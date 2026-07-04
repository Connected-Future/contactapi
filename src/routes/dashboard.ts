import { Hono, type Context } from 'hono'
import { and, count, desc, eq, ilike } from 'drizzle-orm'
import { db } from '../db/client.js'
import { apiKeys, contacts, type Contact } from '../db/schema.js'
import { requireSession } from '../middleware/session.js'
import { type AppEnv } from '../middleware/auth.js'
import { mintApiKey } from '../api-keys.js'
import { decryptKey } from '../db/keycrypto.js'
import { dashboardHome, keysPage, contactsPage } from '../pages/dashboard.js'

export const dashboardRoutes = new Hono<AppEnv>()

// Everything under /dashboard requires a logged-in browser session.
dashboardRoutes.use('*', requireSession)

// ── Overview ─────────────────────────────────────────────────────────────────
dashboardRoutes.get('/', async (c) => {
  const userId = c.get('userId')
  const [[{ contactCount }], [{ keyCount }]] = await Promise.all([
    db.select({ contactCount: count() }).from(contacts).where(eq(contacts.userId, userId)),
    db.select({ keyCount: count() }).from(apiKeys).where(eq(apiKeys.userId, userId)),
  ])
  return c.html(dashboardHome(c.get('sessionUser').name, contactCount, keyCount))
})

// ── API keys ─────────────────────────────────────────────────────────────────
dashboardRoutes.get('/keys', async (c) => {
  const rows = await db
    .select()
    .from(apiKeys)
    .where(eq(apiKeys.userId, c.get('userId')))
    .orderBy(desc(apiKeys.createdAt))
  const createdId = c.req.query('created') ?? null
  return c.html(keysPage(c.get('sessionUser').name, rows, createdId))
})

dashboardRoutes.post('/keys', async (c) => {
  const form = await c.req.parseBody()
  const type = form.type === 'publishable' ? 'publishable' : 'secret'

  const allowedDomains =
    type === 'publishable'
      ? String(form.allowed_domains ?? '')
          .split(',')
          .map((d) => d.trim().toLowerCase())
          .filter(Boolean)
      : []

  // Keys are viewable afterwards (stored encrypted), so just drop back to the
  // list with the new one highlighted rather than a one-time reveal page.
  const { row } = await mintApiKey({ userId: c.get('userId'), type, allowedDomains })
  return c.redirect(`/dashboard/keys?created=${row.id}`)
})

// Reveal a single key's raw value to its signed-in owner (fetched on demand by
// the dashboard's "Reveal"/"Copy" buttons; the value never ships in page HTML).
dashboardRoutes.post('/keys/:id/reveal', async (c) => {
  const [key] = await db
    .select()
    .from(apiKeys)
    .where(and(eq(apiKeys.userId, c.get('userId')), eq(apiKeys.id, c.req.param('id'))))
    .limit(1)
  if (!key || !key.keyEncrypted) {
    return c.json({ error: 'Key not found.' }, 404)
  }
  return c.json({ key: decryptKey(key.keyEncrypted) })
})

dashboardRoutes.post('/keys/:id/revoke', async (c) => {
  await db
    .update(apiKeys)
    .set({ revokedAt: new Date() })
    .where(and(eq(apiKeys.userId, c.get('userId')), eq(apiKeys.id, c.req.param('id'))))
  return c.redirect('/dashboard/keys')
})

// ── Contacts ─────────────────────────────────────────────────────────────────
const PAGE_SIZE = 25

// ISO 8601 UTC without milliseconds — matches the API's contact shape.
function iso(date: Date): string {
  return date.toISOString().replace(/\.\d{3}Z$/, 'Z')
}

// Flatten a row to the shape the dashboard (and API) speak: structured columns
// win, so any stray reserved keys inside `data` are dropped in favour of them.
function serializeContact(row: Contact) {
  const { id, email, created_at, updated_at, ...fields } = row.data as Record<
    string,
    unknown
  >
  return {
    id: row.id,
    email: row.email,
    fields,
    created_at: iso(row.createdAt),
    updated_at: iso(row.updatedAt),
  }
}

// List view: newest first, paginated, optionally filtered by email substring.
dashboardRoutes.get('/contacts', async (c) => {
  const userId = c.get('userId')
  const q = (c.req.query('q') ?? '').trim()
  const page = Math.max(1, Number.parseInt(c.req.query('page') ?? '1', 10) || 1)

  const where = q
    ? and(eq(contacts.userId, userId), ilike(contacts.email, `%${q}%`))
    : eq(contacts.userId, userId)

  const [rows, [{ total }]] = await Promise.all([
    db
      .select()
      .from(contacts)
      .where(where)
      .orderBy(desc(contacts.createdAt))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
    db.select({ total: count() }).from(contacts).where(where),
  ])

  return c.html(
    contactsPage(c.get('sessionUser').name, {
      contacts: rows.map(serializeContact),
      page,
      total,
      totalPages: Math.max(1, Math.ceil(total / PAGE_SIZE)),
      pageSize: PAGE_SIZE,
      q,
    }),
  )
})

// Create (or upsert-by-email) from the dashboard sheet.
dashboardRoutes.post('/contacts', async (c) => {
  const parsed = await readContactBody(c)
  if ('error' in parsed) return c.json({ error: parsed.error }, 400)

  const [row] = await db
    .insert(contacts)
    .values({ userId: c.get('userId'), email: parsed.email, data: parsed.fields })
    .onConflictDoUpdate({
      target: [contacts.userId, contacts.email],
      set: { data: parsed.fields, updatedAt: new Date() },
    })
    .returning()

  return c.json(serializeContact(row), 201)
})

// Edit: replaces email + the whole data bag with what the sheet submits.
dashboardRoutes.patch('/contacts/:id', async (c) => {
  const parsed = await readContactBody(c)
  if ('error' in parsed) return c.json({ error: parsed.error }, 400)

  try {
    const [row] = await db
      .update(contacts)
      .set({ email: parsed.email, data: parsed.fields, updatedAt: new Date() })
      .where(and(eq(contacts.userId, c.get('userId')), eq(contacts.id, c.req.param('id'))))
      .returning()
    if (!row) return c.json({ error: 'No contact with that id.' }, 404)
    return c.json(serializeContact(row))
  } catch (err) {
    // Unique (user_id, email) — the new email already belongs to another contact.
    if (isUniqueViolation(err)) {
      return c.json({ error: 'Another contact already uses that email.' }, 409)
    }
    throw err
  }
})

dashboardRoutes.delete('/contacts/:id', async (c) => {
  const [row] = await db
    .delete(contacts)
    .where(and(eq(contacts.userId, c.get('userId')), eq(contacts.id, c.req.param('id'))))
    .returning({ id: contacts.id })
  if (!row) return c.json({ error: 'No contact with that id.' }, 404)
  return c.json({ id: row.id, deleted: true })
})

// Validate a { email, fields } body from the sheet. `fields` is the JSON bag of
// arbitrary contact data; reserved keys are stripped so they can't shadow the
// structured columns.
async function readContactBody(
  c: Context<AppEnv>,
): Promise<{ email: string; fields: Record<string, unknown> } | { error: string }> {
  const body = await c.req.json().catch(() => null)
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { error: 'Body must be a JSON object.' }
  }
  const { email, fields } = body as Record<string, unknown>
  if (typeof email !== 'string' || email.trim() === '') {
    return { error: 'email is required.' }
  }
  if (fields !== undefined && (typeof fields !== 'object' || fields === null || Array.isArray(fields))) {
    return { error: 'fields must be a JSON object.' }
  }
  const clean = { ...(fields as Record<string, unknown> | undefined) }
  for (const k of ['id', 'email', 'created_at', 'updated_at']) delete clean[k]
  return { email: email.trim(), fields: clean }
}

// Postgres unique-violation code is 23505. Drizzle wraps the driver error, so
// the code can sit on the error itself or on its `cause`.
function isUniqueViolation(err: unknown): boolean {
  const code = (e: unknown) =>
    typeof e === 'object' && e !== null && 'code' in e
      ? (e as { code?: string }).code
      : undefined
  return (
    code(err) === '23505' ||
    code((err as { cause?: unknown } | null)?.cause) === '23505'
  )
}
