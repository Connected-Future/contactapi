import { baseStyle, analyticsScript } from '../styles.js'

export const homePage = /* html */ `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<link rel="icon" href="/favicon.ico?v=2" sizes="any" />
<title>ContactAPI, an open-source API to save contacts</title>
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
  .cta { display: flex; align-items: center; gap: 14px; }
  .cta a.txt, .cta button.txt { font-size: 15px; color: #666; white-space: nowrap; }
  button.txt { background: none; border: none; padding: 0; cursor: pointer; font-family: inherit; }
  button.txt:hover { color: #1a1a1a; }

  .docs-head { display: flex; align-items: baseline; justify-content: space-between; gap: 16px; }
  .docs-head h2 { margin-bottom: 0; }
  .linkbtn { background: none; border: none; padding: 0; font: inherit; font-size: 15px; color: #2563eb; cursor: pointer; white-space: nowrap; }
  .linkbtn:hover { text-decoration: underline; }

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
  .uses { padding-left: 20px; margin: 0 0 16px; }
  .uses li { margin: 0 0 6px; }

  dialog { border: none; border-radius: 10px; padding: 0; max-width: 560px; width: calc(100% - 32px); color: #1a1a1a; box-shadow: 0 12px 44px rgba(0, 0, 0, .18); }
  dialog::backdrop { background: rgba(0, 0, 0, .4); }
  .modal-head { display: flex; align-items: center; justify-content: space-between; gap: 16px; padding: 16px 20px; border-bottom: 1px solid #eee; }
  .modal-head h2 { margin: 0; font-size: 18px; }
  .modal-close { background: none; border: none; font-size: 22px; line-height: 1; color: #999; cursor: pointer; }
  .modal-close:hover { color: #1a1a1a; }
  .modal-body { padding: 20px; }
  .modal-body > :first-child { margin-top: 0; }
  .modal-body h2 { margin-top: 24px; font-size: 15px; }

  footer { margin-top: 56px; font-size: 13px; color: #888; }
</style>
${analyticsScript}
</head>
<body>
  <div class="topbar">
    <h1>ContactAPI</h1>
    <div class="cta">
      <button type="button" class="txt" data-modal="mcp-modal">MCP</button>
      <a class="txt" href="/blog">Blog</a>
      <a class="txt" href="/llms.txt">llms.txt</a>
      <a class="btn" href="/login">Get API key</a>
    </div>
  </div>
  <p class="muted" style="margin-top:8px">An open-source API to save contacts. Send a POST with an email and any other fields you want, and they get saved as-is.</p>

  <div class="docs-head">
    <h2>Endpoints</h2>
    <button type="button" class="linkbtn" data-modal="auth-modal">Authentication</button>
  </div>

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

  <h2>Use cases</h2>
  <p class="muted">Common ways people put ContactAPI to work. Each one is a short walkthrough.</p>
  <ul class="uses">
    <li><a href="/blog/store-contact-form-submissions-without-backend">Store contact form submissions without a backend</a></li>
    <li><a href="/blog/build-a-waitlist-with-a-contacts-api">Build a waitlist</a></li>
    <li><a href="/blog/give-claude-chatgpt-access-to-your-contacts-mcp">Give Claude and ChatGPT access to your contacts</a></li>
    <li><a href="/blog/add-contact-management-to-nextjs">Add contact management to a Next.js app</a></li>
    <li><a href="/blog/manage-newsletter-subscribers-rest-api">Manage newsletter subscribers</a></li>
  </ul>

  <footer>Open source · MIT licensed · <a href="https://github.com/kozmos-tech/contactapi">GitHub</a></footer>

  <dialog id="auth-modal">
    <div class="modal-head">
      <h2>Authentication</h2>
      <button type="button" class="modal-close" aria-label="Close">×</button>
    </div>
    <div class="modal-body">
      <p class="muted">The base URL is <code>https://contactapi.dev</code> and every request carries your key in a header.</p>
      <pre><code>Authorization: Bearer YOUR_KEY</code></pre>
      <table class="params">
        <tr><td><code>ck_secret_…</code></td><td>Use this on your backend. It has full access to every endpoint.</td></tr>
        <tr><td><code>ck_pub_…</code></td><td>Use this in a browser. It can only create contacts and is locked to your domains.</td></tr>
      </table>
    </div>
  </dialog>

  <dialog id="mcp-modal">
    <div class="modal-head">
      <h2>MCP server</h2>
      <button type="button" class="modal-close" aria-label="Close">×</button>
    </div>
    <div class="modal-body">
      <p class="muted">AI clients like Claude Desktop, claude.ai custom connectors, Cursor, and the MCP Inspector can manage your contacts as tools over a <a href="https://modelcontextprotocol.io">Model Context Protocol</a> server.</p>
      <pre><code>https://contactapi.dev/mcp</code></pre>
      <p class="ep-desc" style="margin:14px 0">Auth is <strong>OAuth 2.1 with dynamic client registration</strong> rather than an API key. Point a client at the URL and it discovers the authorization server, registers itself, and sends you to log in and approve access. Every tool is scoped to the account you log in as.</p>
      <table class="params">
        <tr><td><code>list_contacts</code></td><td>List your contacts, newest first. Params: <code>page</code>, <code>page_size</code>.</td></tr>
        <tr><td><code>get_contact</code></td><td>Fetch one contact. Params: <code>id</code>.</td></tr>
        <tr><td><code>create_contact</code></td><td>Create or upsert by email. Params: <code>email</code>, <code>fields</code>.</td></tr>
        <tr><td><code>update_contact</code></td><td>Partial update, merged into existing fields. Params: <code>id</code>, <code>email</code>, <code>fields</code>.</td></tr>
        <tr><td><code>delete_contact</code></td><td>Delete one contact. Params: <code>id</code>.</td></tr>
      </table>
    </div>
  </dialog>

  <script>
    document.querySelectorAll('[data-modal]').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault()
        var d = document.getElementById(el.getAttribute('data-modal'))
        if (d && d.showModal) d.showModal()
      })
    })
    document.querySelectorAll('dialog .modal-close').forEach(function (btn) {
      btn.addEventListener('click', function () { btn.closest('dialog').close() })
    })
    document.querySelectorAll('dialog').forEach(function (d) {
      d.addEventListener('click', function (e) { if (e.target === d) d.close() })
    })
    if (location.hash === '#mcp') {
      var m = document.getElementById('mcp-modal')
      if (m && m.showModal) m.showModal()
    }
  </script>
</body>
</html>`
