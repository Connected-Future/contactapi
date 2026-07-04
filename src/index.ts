import { Hono } from 'hono'
import { bodyLimit } from 'hono/body-limit'
import { HTTPException } from 'hono/http-exception'
import { homePage } from './pages/home.js'
import { loginPage } from './pages/login.js'
import { signupPage } from './pages/signup.js'
import { blogIndexPage, renderPost } from './pages/blog.js'
import { llmsTxt } from './content/llms.js'
import { contactsRoutes } from './routes/contacts.js'
import { dashboardRoutes } from './routes/dashboard.js'
import { rateLimit } from './middleware/ratelimit.js'
import { auth } from './auth.js'
import { oAuthDiscoveryMetadata, oAuthProtectedResourceMetadata } from 'better-auth/plugins'
import { StreamableHTTPTransport } from '@hono/mcp'
import { buildMcpServer } from './mcp/server.js'
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
app.get('/blog', (c) => c.html(blogIndexPage()))
app.get('/blog/:slug', (c) => {
  const html = renderPost(c.req.param('slug'))
  return html ? c.html(html) : c.notFound()
})
app.get('/llms.txt', (c) => c.text(llmsTxt))

// Throttle auth (signup/login/sign-out) per IP to blunt credential brute-force.
app.use('/api/auth/*', rateLimit({ bucket: 'auth', windowMs: 60_000, max: 20 }))

// Better Auth — signup/login/session endpoints for the dashboard.
app.on(['POST', 'GET'], '/api/auth/*', (c) => auth.handler(c.req.raw))

// Authenticated browser dashboard (cookie session).
app.route('/dashboard', dashboardRoutes)

// API (Bearer key auth)
app.route('/v1/contacts', contactsRoutes)

// ── MCP server (OAuth 2.1) ───────────────────────────────────────────────────
// AI clients manage contacts as tools over the /mcp endpoint. Auth is OAuth: the
// `mcp` plugin (src/auth.ts) turns /api/auth/* into an authorization server with
// dynamic client registration; clients discover it via these root well-known
// documents, then present the access token to /mcp.
const oauthServerMetadata = oAuthDiscoveryMetadata(auth)
const protectedResourceMetadata = oAuthProtectedResourceMetadata(auth)
app.get('/.well-known/oauth-authorization-server', (c) => oauthServerMetadata(c.req.raw))
app.get('/.well-known/oauth-protected-resource', (c) => protectedResourceMetadata(c.req.raw))

app.use('/mcp', rateLimit({ bucket: 'mcp', windowMs: 60_000, max: 60 }))
app.all('/mcp', async (c) => {
  // Resolve the OAuth access token to its owning account. No/invalid token → 401
  // with a WWW-Authenticate pointing at the protected-resource metadata, which is
  // what makes a compliant MCP client kick off the OAuth flow.
  const session = await auth.api.getMcpSession({ headers: c.req.raw.headers })
  if (!session) {
    const resourceMetadata = new URL('/.well-known/oauth-protected-resource', c.req.url).href
    c.header('WWW-Authenticate', `Bearer resource_metadata="${resourceMetadata}"`)
    return c.json({ error: { message: 'Unauthorized' } }, 401)
  }

  // Fresh, user-scoped server per request — stateless and tenant-safe.
  const server = buildMcpServer(session.userId)
  const transport = new StreamableHTTPTransport()
  await server.connect(transport)
  return (await transport.handleRequest(c)) ?? c.body(null, 204)
})

// All errors surface as { error: { message } }, matching the documented shape.
app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return c.json({ error: { message: err.message } }, err.status)
  }
  console.error(err)
  return c.json({ error: { message: 'Internal server error' } }, 500)
})

export default app
