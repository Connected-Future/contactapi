import { Hono } from 'hono'

const app = new Hono()

const baseStyle = /* css */ `
  * { box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    color: #1a1a1a;
    line-height: 1.6;
    max-width: 720px;
    margin: 0 auto;
    padding: 64px 24px;
  }
  h1 { font-size: 32px; margin: 0; }
  h2 { font-size: 18px; margin: 44px 0 10px; }
  p { margin: 0 0 16px; }
  a { color: #2563eb; }
  .muted { color: #666; }
  code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 13px; }
  pre {
    background: #f5f5f5;
    border: 1px solid #e5e5e5;
    border-radius: 6px;
    padding: 14px 16px;
    overflow-x: auto;
    font-size: 13px;
    margin: 0 0 12px;
  }
  pre code { font-size: 13px; }
`

const page = /* html */ `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>contactapi, an open-source API to save contacts</title>
<meta name="description" content="An open-source API to save contacts with a single POST and manage them with simple CRUD." />
<style>
  ${baseStyle}
  .topbar { display: flex; align-items: center; justify-content: space-between; gap: 16px; }
  .btn {
    display: inline-block;
    padding: 9px 16px;
    font-size: 14px;
    background: #1a1a1a;
    color: #fff;
    border-radius: 6px;
    text-decoration: none;
    white-space: nowrap;
  }
  .btn:hover { background: #333; }

  .endpoint { border: 1px solid #e5e5e5; border-radius: 8px; margin: 16px 0; overflow: hidden; }
  .ep-head { display: flex; align-items: center; gap: 10px; padding: 11px 14px; background: #fafafa; cursor: pointer; list-style: none; }
  .ep-head::-webkit-details-marker { display: none; }
  .endpoint[open] .ep-head { border-bottom: 1px solid #eee; }
  .method { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 12px; font-weight: 600; letter-spacing: .4px; padding: 4px 8px; border-radius: 4px; color: #fff; }
  .method.post { background: #16a34a; }
  .method.get { background: #2563eb; }
  .method.patch { background: #d97706; }
  .method.delete { background: #dc2626; }
  .path { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 14px; }
  .keytag { margin-left: auto; font-size: 11px; padding: 3px 8px; border-radius: 4px; border: 1px solid #ddd; color: #666; background: #fff; white-space: nowrap; }
  .ep-body { padding: 14px; }
  .ep-desc { margin: 0 0 14px; font-size: 14px; color: #444; }
  .label { font-size: 11px; text-transform: uppercase; letter-spacing: .5px; color: #999; margin: 0 0 6px; }
  table.params { width: 100%; border-collapse: collapse; font-size: 13px; margin: 0 0 14px; }
  table.params td { padding: 6px 10px 6px 0; border-bottom: 1px solid #f0f0f0; vertical-align: top; }
  table.params td:first-child { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; white-space: nowrap; }
  .req { color: #dc2626; font-size: 12px; }
  .opt { color: #999; font-size: 12px; }
  footer { margin-top: 56px; font-size: 13px; color: #888; }
</style>
</head>
<body>
  <div class="topbar">
    <h1>contactapi</h1>
    <a class="btn" href="/login">Get API key</a>
  </div>
  <p class="muted" style="margin-top:8px">An open-source API to save contacts. Send a POST with an email and any other fields you want, and they get saved as-is.</p>

  <h2>Endpoints</h2>

  <details class="endpoint">
    <summary class="ep-head">
      <span class="method post">POST</span>
      <span class="path">/v1/contacts</span>
      <span class="keytag">secret or publishable</span>
    </summary>
    <div class="ep-body">
      <p class="ep-desc">Create a contact. If the email already exists the contact is updated rather than duplicated.</p>
      <div class="label">Body</div>
      <table class="params">
        <tr><td>email</td><td><span class="req">required</span></td><td>The contact's email, used as the unique key.</td></tr>
        <tr><td>*</td><td><span class="opt">optional</span></td><td>Any other JSON fields such as name, plan or source are saved as-is.</td></tr>
      </table>
      <div class="label">Request</div>
      <pre><code>{ "email": "ada@example.com", "name": "Ada", "plan": "pro" }</code></pre>
      <div class="label">Response 201</div>
      <pre><code>{
  "id": "con_a1b2",
  "email": "ada@example.com",
  "name": "Ada",
  "plan": "pro",
  "created_at": "2026-07-04T10:00:00Z",
  "updated_at": "2026-07-04T10:00:00Z"
}</code></pre>
    </div>
  </details>

  <details class="endpoint">
    <summary class="ep-head">
      <span class="method get">GET</span>
      <span class="path">/v1/contacts</span>
      <span class="keytag">secret</span>
    </summary>
    <div class="ep-body">
      <p class="ep-desc">List your contacts, sorted by <code>created_at</code>, newest first.</p>
      <div class="label">Query</div>
      <table class="params">
        <tr><td>page</td><td><span class="opt">optional</span></td><td>Which page to return, starting at 1. Defaults to 1.</td></tr>
        <tr><td>page_size</td><td><span class="opt">optional</span></td><td>How many contacts per page, 1–100. Defaults to 20.</td></tr>
      </table>
      <div class="label">Request</div>
      <pre><code>GET /v1/contacts?page=1&amp;page_size=20</code></pre>
      <div class="label">Response 200</div>
      <pre><code>{
  "data": [
    {
      "id": "con_a1b2",
      "email": "ada@example.com",
      "name": "Ada",
      "plan": "pro",
      "created_at": "2026-07-04T10:00:00Z",
      "updated_at": "2026-07-04T10:00:00Z"
    }
  ],
  "page": 1,
  "page_size": 20,
  "total": 137,
  "total_pages": 7
}</code></pre>
      <p class="ep-desc" style="margin:10px 0 0"><code>total</code> is the full contact count across all pages; <code>total_pages</code> is <code>ceil(total / page_size)</code>. There are more pages while <code>page &lt; total_pages</code>.</p>
    </div>
  </details>

  <details class="endpoint">
    <summary class="ep-head">
      <span class="method get">GET</span>
      <span class="path">/v1/contacts/:id</span>
      <span class="keytag">secret</span>
    </summary>
    <div class="ep-body">
      <p class="ep-desc">Fetch a single contact by id.</p>
      <div class="label">Response 200</div>
      <pre><code>{
  "id": "con_a1b2",
  "email": "ada@example.com",
  "name": "Ada",
  "plan": "pro",
  "created_at": "2026-07-04T10:00:00Z",
  "updated_at": "2026-07-04T10:00:00Z"
}</code></pre>
    </div>
  </details>

  <details class="endpoint">
    <summary class="ep-head">
      <span class="method patch">PATCH</span>
      <span class="path">/v1/contacts/:id</span>
      <span class="keytag">secret</span>
    </summary>
    <div class="ep-body">
      <p class="ep-desc">Update a contact by sending only the fields you want to change.</p>
      <div class="label">Request</div>
      <pre><code>{ "plan": "enterprise" }</code></pre>
      <div class="label">Response 200</div>
      <pre><code>{
  "id": "con_a1b2",
  "email": "ada@example.com",
  "name": "Ada",
  "plan": "enterprise",
  "updated_at": "2026-07-04T11:30:00Z"
}</code></pre>
    </div>
  </details>

  <details class="endpoint">
    <summary class="ep-head">
      <span class="method delete">DELETE</span>
      <span class="path">/v1/contacts/:id</span>
      <span class="keytag">secret</span>
    </summary>
    <div class="ep-body">
      <p class="ep-desc">Delete a contact.</p>
      <div class="label">Response 200</div>
      <pre><code>{ "id": "con_a1b2", "deleted": true }</code></pre>
    </div>
  </details>

  <h2>Authentication</h2>
  <p class="muted">The base URL is <code>https://contactapi.dev</code> and every request carries your key in a header.</p>
  <pre><code>Authorization: Bearer YOUR_KEY</code></pre>
  <table class="params">
    <tr><td><code>ck_secret_…</code></td><td>Use this on your backend. It has full access to every endpoint above.</td></tr>
    <tr><td><code>ck_pub_…</code></td><td>Use this in a browser. It can only create contacts and is locked to your domains.</td></tr>
  </table>

  <footer>Open source · MIT licensed · <a href="https://github.com/Connected-Future/contactapi">GitHub</a></footer>
</body>
</html>`

const loginPage = /* html */ `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Log in to contactapi</title>
<style>
  ${baseStyle}
  body { max-width: 360px; padding-top: 96px; }
  .back { font-size: 13px; }
  h1 { font-size: 24px; margin: 20px 0 6px; }
  form { display: flex; flex-direction: column; gap: 12px; margin-top: 24px; }
  label { font-size: 13px; color: #444; margin-bottom: -6px; }
  input {
    width: 100%;
    padding: 10px 12px;
    font-size: 15px;
    border: 1px solid #ccc;
    border-radius: 6px;
  }
  button {
    padding: 11px;
    font-size: 15px;
    border: 0;
    border-radius: 6px;
    background: #1a1a1a;
    color: #fff;
    cursor: pointer;
    margin-top: 4px;
  }
  button:hover { background: #333; }
  .alt { font-size: 13px; color: #666; margin-top: 20px; text-align: center; }
</style>
</head>
<body>
  <a class="back muted" href="/">← contactapi</a>
  <h1>Log in</h1>
  <p class="muted" style="font-size:14px">Log in to get your API key.</p>
  <form id="loginForm">
    <label for="email">Email</label>
    <input id="email" type="email" required placeholder="you@example.com" autocomplete="email" />
    <label for="password">Password</label>
    <input id="password" type="password" required placeholder="••••••••" autocomplete="current-password" />
    <button type="submit">Log in</button>
  </form>
  <p class="alt">Don't have an account? <a href="#">Sign up</a></p>
<script>
  // UI only for now, no auth wired up yet.
  document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
  });
</script>
</body>
</html>`

app.get('/', (c) => c.html(page))
app.get('/login', (c) => c.html(loginPage))

export default app
