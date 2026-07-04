import { createMiddleware } from 'hono/factory'
import { HTTPException } from 'hono/http-exception'
import { createHash } from 'node:crypto'
import { eq } from 'drizzle-orm'
import { db } from '../db/client.js'
import { apiKeys } from '../db/schema.js'

// Shared Hono environment.
//  - `userId`  — the account a request acts on. Set by API-key auth (below) for
//    /v1/* routes, and by session auth (middleware/session.ts) for /dashboard/*.
//  - `keyType` — which kind of API key authenticated the request; gates
//    secret-only vs. publishable routes. Unset on session-authenticated routes.
export type AppEnv = {
  Variables: {
    userId: string
    keyType: 'secret' | 'publishable'
    sessionUser: { id: string; name: string; email: string }
  }
}

// SHA-256 hex of a raw token. We only ever store/compare hashes, never the
// plaintext `ck_…` value.
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

// ── API-key authentication (customer Bearer keys) ────────────────────────────
// Resolves `Authorization: Bearer ck_…` to its owning account. Every /v1/*
// route already scopes its queries by the `userId` set here.
export const requireAuth = createMiddleware<AppEnv>(async (c, next) => {
  const header = c.req.header('Authorization') ?? ''
  const match = header.match(/^Bearer\s+(.+)$/i)
  if (!match) {
    throw new HTTPException(401, {
      message: 'Missing or malformed Authorization header. Expected: Bearer <api key>.',
    })
  }

  const token = match[1].trim()
  const [key] = await db
    .select()
    .from(apiKeys)
    .where(eq(apiKeys.keyHash, hashToken(token)))
    .limit(1)

  if (!key || key.revokedAt) {
    throw new HTTPException(401, { message: 'Invalid or revoked API key.' })
  }

  // Publishable keys are locked to their allowed domains (browser Origin check).
  if (key.type === 'publishable' && key.allowedDomains.length > 0) {
    const origin = c.req.header('Origin') ?? c.req.header('Referer') ?? ''
    let host = ''
    try {
      host = origin ? new URL(origin).host : ''
    } catch {
      host = ''
    }
    if (!host || !key.allowedDomains.includes(host)) {
      throw new HTTPException(403, {
        message: 'This publishable key is not allowed from this domain.',
      })
    }
  }

  c.set('userId', key.userId)
  c.set('keyType', key.type)

  // Best-effort last-used stamp — fire it off without blocking the response.
  // (Calling .catch on the drizzle thenable is what actually executes it.)
  db.update(apiKeys)
    .set({ lastUsedAt: new Date() })
    .where(eq(apiKeys.id, key.id))
    .catch(() => {})

  await next()
})

// Secret-only guard: rejects publishable keys (403) on every endpoint except
// POST /v1/contacts.
export const requireSecretKey = createMiddleware<AppEnv>(async (c, next) => {
  if (c.get('keyType') !== 'secret') {
    throw new HTTPException(403, {
      message: 'This endpoint requires a secret key.',
    })
  }
  await next()
})
