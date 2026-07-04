import { Hono } from 'hono'
import { bodyLimit } from 'hono/body-limit'
import { HTTPException } from 'hono/http-exception'
import { homePage } from './pages/home.js'
import { loginPage } from './pages/login.js'
import { signupPage } from './pages/signup.js'
import { llmsTxt } from './content/llms.js'
import { contactsRoutes } from './routes/contacts.js'
import { dashboardRoutes } from './routes/dashboard.js'
import { rateLimit } from './middleware/ratelimit.js'
import { auth } from './auth.js'
import type { AppEnv } from './middleware/auth.js'

const app = new Hono<AppEnv>()

// Cap request bodies so a giant payload can't exhaust memory. 64 KB is roomy for
// a contact's JSON fields; anything larger is almost certainly abuse.
app.use(
  '*',
  bodyLimit({
    maxSize: 64 * 1024,
    onError: (c) => c.json({ error: { message: 'Request body too large.' } }, 413),
  }),
)

// Marketing / docs pages
app.get('/', (c) => c.html(homePage))
app.get('/login', (c) => c.html(loginPage))
app.get('/signup', (c) => c.html(signupPage))
app.get('/llms.txt', (c) => c.text(llmsTxt))

// Throttle auth (signup/login/sign-out) per IP to blunt credential brute-force.
app.use('/api/auth/*', rateLimit({ bucket: 'auth', windowMs: 60_000, max: 20 }))

// Better Auth — signup/login/session endpoints for the dashboard.
app.on(['POST', 'GET'], '/api/auth/*', (c) => auth.handler(c.req.raw))

// Authenticated browser dashboard (cookie session).
app.route('/dashboard', dashboardRoutes)

// API (Bearer key auth)
app.route('/v1/contacts', contactsRoutes)

// All errors surface as { error: { message } }, matching the documented shape.
app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return c.json({ error: { message: err.message } }, err.status)
  }
  console.error(err)
  return c.json({ error: { message: 'Internal server error' } }, 500)
})

export default app
