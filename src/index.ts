import { Hono } from 'hono'
import { HTTPException } from 'hono/http-exception'
import { homePage } from './pages/home.js'
import { loginPage } from './pages/login.js'
import { signupPage } from './pages/signup.js'
import { llmsTxt } from './content/llms.js'
import { contactsRoutes } from './routes/contacts.js'
import { dashboardRoutes } from './routes/dashboard.js'
import { auth } from './auth.js'
import type { AppEnv } from './middleware/auth.js'

const app = new Hono<AppEnv>()

// Marketing / docs pages
app.get('/', (c) => c.html(homePage))
app.get('/login', (c) => c.html(loginPage))
app.get('/signup', (c) => c.html(signupPage))
app.get('/llms.txt', (c) => c.text(llmsTxt))

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
