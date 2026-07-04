import { Hono } from 'hono'
import { and, count, desc, eq } from 'drizzle-orm'
import { db } from '../db/client.js'
import { apiKeys, contacts } from '../db/schema.js'
import { requireSession } from '../middleware/session.js'
import { hashToken, type AppEnv } from '../middleware/auth.js'
import { rawId } from '../db/ids.js'
import {
  dashboardHome,
  keysPage,
  keyCreatedPage,
  contactsPage,
} from '../pages/dashboard.js'

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
  return c.html(keysPage(c.get('sessionUser').name, rows))
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

  // Raw token: ck_<secret|pub>_<random>. Shown once; only its hash is stored.
  const token = `ck_${type === 'secret' ? 'secret' : 'pub'}_${rawId()}${rawId()}${rawId()}`
  const keyPrefix = `${token.slice(0, type === 'secret' ? 12 : 9)}…${token.slice(-4)}`

  await db.insert(apiKeys).values({
    userId: c.get('userId'),
    type,
    keyHash: hashToken(token),
    keyPrefix,
    allowedDomains,
  })

  return c.html(keyCreatedPage(c.get('sessionUser').name, token))
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
