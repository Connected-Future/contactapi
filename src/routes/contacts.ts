import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { HTTPException } from 'hono/http-exception'
import { requireAuth, requireSecretKey, type AppEnv } from '../middleware/auth.js'
import {
  serializeContact,
  upsertContact,
  listContacts,
  getContact,
  patchContact,
  deleteContact,
} from '../services/contacts.js'

export const contactsRoutes = new Hono<AppEnv>()

// CORS so publishable keys work from the browser. This runs before auth and
// answers preflight (OPTIONS), which carries no Authorization header — so it
// can't know the key's domains yet. Origin is opened here; the real allowlist
// is the per-key domain lock enforced in `requireAuth`. Bearer tokens aren't
// CORS "credentials" (that's cookies), so `origin: *` is safe and correct here.
contactsRoutes.use(
  '*',
  cors({
    origin: '*',
    allowMethods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Authorization', 'Content-Type'],
    maxAge: 86400,
  }),
)

// Every contact endpoint is authenticated.
contactsRoutes.use('*', requireAuth)

// The CRUD logic lives in services/contacts.ts (shared with the MCP tools); these
// handlers are the HTTP skin over it — parse/validate the request, map the result
// to the documented JSON shape and status codes.

// ── POST /v1/contacts — create or upsert-by-email ────────────────────────────
contactsRoutes.post('/', async (c) => {
  const body = await c.req.json().catch(() => null)
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new HTTPException(400, { message: 'Request body must be a JSON object.' })
  }

  const { email, ...data } = body as Record<string, unknown>
  if (typeof email !== 'string' || email.trim() === '') {
    throw new HTTPException(400, { message: 'email is required' })
  }

  const row = await upsertContact(c.get('userId'), email, data)
  return c.json(serializeContact(row), 201)
})

// ── GET /v1/contacts — list, newest first, paginated ─────────────────────────
contactsRoutes.get('/', requireSecretKey, async (c) => {
  const page = clampInt(c.req.query('page'), 1, 1, Number.MAX_SAFE_INTEGER)
  const pageSize = clampInt(c.req.query('page_size'), 50, 1, 100)

  const { rows, total } = await listContacts(c.get('userId'), { page, pageSize })

  return c.json({
    data: rows.map(serializeContact),
    page,
    page_size: pageSize,
    total,
    total_pages: Math.ceil(total / pageSize),
  })
})

// ── GET /v1/contacts/:id ─────────────────────────────────────────────────────
contactsRoutes.get('/:id', requireSecretKey, async (c) => {
  const row = await getContact(c.get('userId'), c.req.param('id'))
  if (!row) throw notFound()
  return c.json(serializeContact(row))
})

// ── PATCH /v1/contacts/:id — partial update ──────────────────────────────────
contactsRoutes.patch('/:id', requireSecretKey, async (c) => {
  const body = await c.req.json().catch(() => null)
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new HTTPException(400, { message: 'Request body must be a JSON object.' })
  }

  const { email, ...patch } = body as Record<string, unknown>
  if (email !== undefined && (typeof email !== 'string' || email.trim() === '')) {
    throw new HTTPException(400, { message: 'email must be a non-empty string.' })
  }

  const row = await patchContact(c.get('userId'), c.req.param('id'), {
    email: email as string | undefined,
    patch,
  })
  if (!row) throw notFound()
  return c.json(serializeContact(row))
})

// ── DELETE /v1/contacts/:id ──────────────────────────────────────────────────
contactsRoutes.delete('/:id', requireSecretKey, async (c) => {
  const id = c.req.param('id')
  const deleted = await deleteContact(c.get('userId'), id)
  if (!deleted) throw notFound()
  return c.json({ id, deleted: true })
})

// ── Helpers ──────────────────────────────────────────────────────────────────

function notFound(): HTTPException {
  return new HTTPException(404, { message: 'No contact with that id.' })
}

// Parse an integer query param, falling back to `fallback` and clamping to
// [min, max]. Non-numeric or out-of-range input degrades gracefully.
function clampInt(
  raw: string | undefined,
  fallback: number,
  min: number,
  max: number,
): number {
  const n = raw === undefined ? NaN : Number.parseInt(raw, 10)
  if (!Number.isFinite(n)) return fallback
  return Math.min(max, Math.max(min, n))
}
