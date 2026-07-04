import { createMiddleware } from 'hono/factory'
import { HTTPException } from 'hono/http-exception'
import type { Context } from 'hono'

// Fixed-window, per-IP rate limiter.
//
// NOTE: state lives in this process's memory. On serverless (Vercel) each
// instance has its own map, so the effective limit is per-instance, not global.
// That's enough to blunt bursts, brute-force loops, and accidental hammering,
// but it is NOT a hard global guarantee — move to a shared store (Upstash/Redis)
// if you need one. Kept dependency-free on purpose.
export function rateLimit(opts: {
  windowMs: number
  max: number
  // Namespace so independent limiters (auth vs. key creation) don't share
  // counters for the same IP.
  bucket: string
}) {
  const hits = new Map<string, { count: number; resetAt: number }>()

  return createMiddleware(async (c, next) => {
    const now = Date.now()
    const id = `${opts.bucket}:${clientIp(c)}`

    let entry = hits.get(id)
    if (!entry || entry.resetAt <= now) {
      entry = { count: 0, resetAt: now + opts.windowMs }
      hits.set(id, entry)
    }
    entry.count++

    if (entry.count > opts.max) {
      c.header('Retry-After', String(Math.ceil((entry.resetAt - now) / 1000)))
      throw new HTTPException(429, {
        message: 'Too many requests. Slow down and try again shortly.',
      })
    }

    // Opportunistic sweep so the map can't grow unbounded under churn.
    if (hits.size > 10_000) {
      for (const [k, v] of hits) if (v.resetAt <= now) hits.delete(k)
    }

    await next()
  })
}

// Best-effort client IP. Behind Vercel/most proxies the real address is the
// first entry of X-Forwarded-For; fall back to X-Real-IP, then a constant so a
// missing header can't spoof its way into an unlimited bucket.
function clientIp(c: Context): string {
  const xff = c.req.header('x-forwarded-for')
  if (xff) return xff.split(',')[0]!.trim()
  return c.req.header('x-real-ip') ?? 'unknown'
}
