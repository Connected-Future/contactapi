import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { HTTPException } from 'hono/http-exception'
import { and, count, desc, eq, sql } from 'drizzle-orm'
import { db } from '../db/client.js'
import { contacts, type Contact } from '../db/schema.js'
import { requireAuth, requireSecretKey, type AppEnv } from '../middleware/auth.js'

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

// Every contact endpoint is authenticated. (Currently a stub — see TODO.md.)
contactsRoutes.use('*', requireAuth)

// ── Serialization ────────────────────────────────────────────────────────────

// ISO 8601 UTC without milliseconds, e.g. "2026-07-04T10:00:00Z" — matches docs.
function iso(date: Date): string {
  return date.toISOString().replace(/\.\d{3}Z$/, 'Z')
}

// Flatten a row to the documented shape: { id, email, ...data, created_at,
// updated_at }. The structured columns are authoritative, so any stray reserved
// keys inside `data` are dropped in favour of them.
function serialize(row: Contact) {
  const { id, email, created_at, updated_at, ...rest } = row.data as Record<
    string,
    unknown
  >
  return {
    id: row.id,
    email: row.email,
    ...rest,
    created_at: iso(row.createdAt),
    updated_at: iso(row.updatedAt),
  }
}

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

  const userId = c.get('userId')
  const now = new Date()

  // Unique (user_id, email) means an existing email updates in place rather than
  // duplicating. A create replaces the stored fields with the new payload.
  const [row] = await db
    .insert(contacts)
    .values({ userId, email, data })
    .onConflictDoUpdate({
      target: [contacts.userId, contacts.email],
      set: { data, updatedAt: now },
    })
    .returning()

  return c.json(serialize(row), 201)
})

// ── GET /v1/contacts — list, newest first, paginated ─────────────────────────
contactsRoutes.get('/', requireSecretKey, async (c) => {
  const userId = c.get('userId')

  const page = clampInt(c.req.query('page'), 1, 1, Number.MAX_SAFE_INTEGER)
  const pageSize = clampInt(c.req.query('page_size'), 20, 1, 100)

  const where = eq(contacts.userId, userId)

  const [rows, [{ total }]] = await Promise.all([
    db
      .select()
      .from(contacts)
      .where(where)
      .orderBy(desc(contacts.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize),
    db.select({ total: count() }).from(contacts).where(where),
  ])

  return c.json({
    data: rows.map(serialize),
    page,
    page_size: pageSize,
    total,
    total_pages: Math.ceil(total / pageSize),
  })
})

// ── GET /v1/contacts/:id ─────────────────────────────────────────────────────
contactsRoutes.get('/:id', requireSecretKey, async (c) => {
  const row = await findOwned(c.get('userId'), c.req.param('id'))
  return c.json(serialize(row))
})

// ── PATCH /v1/contacts/:id — partial update ──────────────────────────────────
contactsRoutes.patch('/:id', requireSecretKey, async (c) => {
  const userId = c.get('userId')
  const id = c.req.param('id')

  const body = await c.req.json().catch(() => null)
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new HTTPException(400, { message: 'Request body must be a JSON object.' })
  }

  const { email, ...patch } = body as Record<string, unknown>
  if (email !== undefined && (typeof email !== 'string' || email.trim() === '')) {
    throw new HTTPException(400, { message: 'email must be a non-empty string.' })
  }

  // Shallow-merge the patch into the JSONB bag (`data || patch`) so omitted
  // fields are left untouched. `email` lives in its own column, so update it
  // separately when supplied.
  const [row] = await db
    .update(contacts)
    .set({
      data: sql`${contacts.data} || ${JSON.stringify(patch)}::jsonb`,
      ...(email !== undefined ? { email } : {}),
      updatedAt: new Date(),
    })
    .where(and(eq(contacts.userId, userId), eq(contacts.id, id)))
    .returning()

  if (!row) throw notFound()
  return c.json(serialize(row))
})

// ── DELETE /v1/contacts/:id ──────────────────────────────────────────────────
contactsRoutes.delete('/:id', requireSecretKey, async (c) => {
  const userId = c.get('userId')
  const id = c.req.param('id')

  const [row] = await db
    .delete(contacts)
    .where(and(eq(contacts.userId, userId), eq(contacts.id, id)))
    .returning({ id: contacts.id })

  if (!row) throw notFound()
  return c.json({ id: row.id, deleted: true })
})

// ── Helpers ──────────────────────────────────────────────────────────────────

async function findOwned(userId: string, id: string): Promise<Contact> {
  const [row] = await db
    .select()
    .from(contacts)
    .where(and(eq(contacts.userId, userId), eq(contacts.id, id)))
    .limit(1)
  if (!row) throw notFound()
  return row
}

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
