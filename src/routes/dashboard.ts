import { Hono } from 'hono'
import { and, count, desc, eq } from 'drizzle-orm'
import { db } from '../db/client.js'
import { apiKeys, contacts } from '../db/schema.js'
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

// ── Contacts viewer ──────────────────────────────────────────────────────────
dashboardRoutes.get('/contacts', async (c) => {
  const rows = await db
    .select()
    .from(contacts)
    .where(eq(contacts.userId, c.get('userId')))
    .orderBy(desc(contacts.createdAt))
    .limit(50)
  return c.html(contactsPage(c.get('sessionUser').name, rows))
})
