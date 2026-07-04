import { createMiddleware } from 'hono/factory'
import { auth } from '../auth.js'
import type { AppEnv } from './auth.js'

// Dashboard session guard. Resolves the Better Auth cookie to an account and
// stashes it on the context; unauthenticated visitors are bounced to /login.
// This is the human/browser counterpart to the Bearer-key `requireAuth`.
export const requireSession = createMiddleware<AppEnv>(async (c, next) => {
  const session = await auth.api.getSession({ headers: c.req.raw.headers })
  if (!session) {
    return c.redirect('/login')
  }
  c.set('userId', session.user.id)
  c.set('sessionUser', {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
  })
  await next()
})
