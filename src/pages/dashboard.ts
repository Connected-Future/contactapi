import { baseStyle } from '../styles.js'
import type { ApiKey } from '../db/schema.js'

// Minimal HTML escaping for any value that originates from user input
// (names, emails, contact fields) before it lands in markup.
function esc(value: unknown): string {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')
}

function iso(date: Date | null): string {
  return date ? date.toISOString().replace(/\.\d{3}Z$/, 'Z') : '—'
}

const dashStyle = /* css */ `
  ${baseStyle}
  header { display: flex; align-items: baseline; justify-content: space-between; gap: 16px; margin-bottom: 8px; }
  nav a { margin-right: 16px; font-size: 14px; }
  nav a.active { color: #1a1a1a; font-weight: 600; }
  .logout { font-size: 13px; }
  table { width: 100%; border-collapse: collapse; margin: 12px 0 24px; font-size: 14px; }
  th, td { text-align: left; padding: 8px 10px; border-bottom: 1px solid #eee; }
  th { font-size: 12px; text-transform: uppercase; letter-spacing: .04em; color: #888; font-weight: 600; }
  td code { background: #f5f5f5; padding: 2px 6px; border-radius: 4px; }
  .pill { font-size: 11px; padding: 2px 8px; border-radius: 999px; background: #eef; color: #33a; }
  .pill.pub { background: #efe; color: #2a2; }
  .pill.revoked { background: #fee; color: #a22; }
  form.inline { display: inline; }
  button, .btn {
    font-size: 13px; padding: 7px 12px; border: 0; border-radius: 6px;
    background: #1a1a1a; color: #fff; cursor: pointer; text-decoration: none;
  }
  button:hover, .btn:hover { background: #333; }
  button.ghost { background: none; color: #a22; border: 1px solid #ddd; padding: 5px 10px; }
  button.ghost:hover { background: #fafafa; }
  button.link { background: none; color: #2563eb; border: 0; padding: 2px 4px; font-size: 13px; }
  button.link:hover { background: none; text-decoration: underline; }
  code.keyval { display: inline-block; max-width: 340px; overflow-x: auto; vertical-align: middle; white-space: nowrap; }
  tr.flash td { background: #fffbe6; }
  .ok { background: #eefbf0; border: 1px solid #b7e4c7; border-radius: 8px; padding: 12px 14px; font-size: 14px; margin: 8px 0 4px; }
  fieldset { border: 1px solid #e5e5e5; border-radius: 8px; padding: 16px 18px; margin: 8px 0 24px; }
  legend { font-size: 13px; font-weight: 600; padding: 0 6px; }
  .row { display: flex; gap: 12px; align-items: center; flex-wrap: wrap; margin-bottom: 10px; }
  .row label { font-size: 13px; color: #444; }
  input[type=text], select { padding: 8px 10px; font-size: 14px; border: 1px solid #ccc; border-radius: 6px; }
  .token { display: block; background: #1a1a1a; color: #7dd3fc; padding: 14px 16px; border-radius: 8px; font-family: ui-monospace, Menlo, monospace; font-size: 14px; word-break: break-all; margin: 12px 0; }
  .warn { background: #fffbe6; border: 1px solid #f5e08a; border-radius: 8px; padding: 12px 14px; font-size: 14px; }
  .empty { color: #888; font-size: 14px; padding: 20px 0; }

  /* Contacts toolbar: search on the left, "New contact" on the right. */
  .toolbar { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin: 12px 0; flex-wrap: wrap; }
  .search { display: flex; gap: 8px; align-items: center; }
  .search input[type=search] { padding: 8px 10px; font-size: 14px; border: 1px solid #ccc; border-radius: 6px; width: 240px; }
  .search button.ghost { color: #444; }
  .search .clear { font-size: 13px; }
  tr.contact { cursor: pointer; }
  tr.contact:hover td { background: #f7f9ff; }
  .pagination { display: flex; align-items: center; gap: 14px; font-size: 13px; color: #666; margin: 4px 0 24px; }
  .pagination a { padding: 6px 12px; border: 1px solid #ddd; border-radius: 6px; text-decoration: none; color: #1a1a1a; }
  .pagination a:hover { background: #fafafa; }
  .pagination .disabled { padding: 6px 12px; border: 1px solid #f0f0f0; border-radius: 6px; color: #bbb; }

  /* Row-detail drawer ("sheet"). */
  .overlay { position: fixed; inset: 0; background: rgba(0,0,0,.28); opacity: 0; pointer-events: none; transition: opacity .15s; z-index: 40; }
  .overlay.open { opacity: 1; pointer-events: auto; }
  .drawer { position: fixed; top: 0; right: 0; height: 100%; width: min(460px, 100%); background: #fff; box-shadow: -8px 0 24px rgba(0,0,0,.12);
    transform: translateX(100%); transition: transform .2s ease; z-index: 41; display: flex; flex-direction: column; }
  .drawer.open { transform: translateX(0); }
  .drawer .dhead { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 18px 20px; border-bottom: 1px solid #eee; }
  .drawer .dhead h2 { font-size: 16px; margin: 0; word-break: break-all; }
  .drawer .dbody { padding: 18px 20px; overflow-y: auto; flex: 1; }
  .drawer .dfoot { display: flex; align-items: center; justify-content: space-between; gap: 10px; padding: 14px 20px; border-top: 1px solid #eee; }
  .drawer label.field { display: block; font-size: 13px; color: #444; margin: 0 0 14px; }
  .drawer label.field span { display: block; margin-bottom: 5px; font-weight: 600; }
  .drawer input[type=email], .drawer input[type=text] { width: 100%; padding: 8px 10px; font-size: 14px; border: 1px solid #ccc; border-radius: 6px; }
  .drawer textarea { width: 100%; min-height: 200px; padding: 10px; font-size: 13px; font-family: ui-monospace, Menlo, monospace; border: 1px solid #ccc; border-radius: 6px; resize: vertical; }
  .drawer .meta { font-size: 12px; color: #888; margin-top: 8px; line-height: 1.7; }
  .drawer .meta code { background: #f5f5f5; padding: 1px 5px; border-radius: 4px; }
  .drawer .err { color: #a22; font-size: 13px; margin: 0 0 12px; min-height: 1px; }
  .close { background: none; border: 0; font-size: 22px; line-height: 1; color: #888; cursor: pointer; padding: 0 4px; }
  .close:hover { color: #333; }
`

function shell(title: string, active: string, name: string, inner: string): string {
  const link = (href: string, label: string) =>
    `<a href="${href}" class="${active === href ? 'active' : ''}">${label}</a>`
  return /* html */ `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(title)}</title>
<style>${dashStyle}</style>
</head>
<body>
  <header>
    <nav>
      ${link('/dashboard', 'Overview')}
      ${link('/dashboard/keys', 'API keys')}
      ${link('/dashboard/contacts', 'Contacts')}
    </nav>
    <span class="muted logout">${esc(name)} · <a href="#" id="logout">Log out</a></span>
  </header>
  ${inner}
<script type="module">
  document.getElementById('logout')?.addEventListener('click', async (e) => {
    e.preventDefault();
    await fetch('/api/auth/sign-out', { method: 'POST' });
    location.href = '/login';
  });
</script>
</body>
</html>`
}

export function dashboardHome(name: string, contactCount: number, keyCount: number): string {
  return shell('Dashboard · contactapi', '/dashboard', name, /* html */ `
    <h1>Welcome, ${esc(name)}</h1>
    <p class="muted">Your account at a glance.</p>
    <table>
      <tr><th>Contacts</th><td>${contactCount}</td></tr>
      <tr><th>Active API keys</th><td>${keyCount}</td></tr>
    </table>
    <p><a class="btn" href="/dashboard/keys">Manage API keys →</a></p>
  `)
}

export function keysPage(name: string, keys: ApiKey[], createdId: string | null = null): string {
  const rows = keys.length
    ? keys
        .map((k) => {
          const revoked = k.revokedAt !== null
          const typePill = k.type === 'secret'
            ? '<span class="pill">secret</span>'
            : '<span class="pill pub">publishable</span>'
          const status = revoked
            ? '<span class="pill revoked">revoked</span>'
            : typePill
          // Reveal/Copy fetch the raw value on demand; revoked or legacy
          // (hash-only) keys can only show their masked prefix.
          const revealable = !revoked && k.keyEncrypted !== null
          const controls = revealable
            ? `<button type="button" class="link reveal" data-id="${esc(k.id)}">Reveal</button>
               <button type="button" class="link copy" data-id="${esc(k.id)}">Copy</button>`
            : ''
          const action = revoked
            ? '—'
            : `<form class="inline" method="post" action="/dashboard/keys/${esc(k.id)}/revoke" onsubmit="return confirm('Revoke this key? Apps using it will stop working.')"><button class="ghost" type="submit">Revoke</button></form>`
          const flash = createdId && k.id === createdId ? ' class="flash"' : ''
          return `<tr${flash} data-row="${esc(k.id)}">
            <td><code class="keyval" data-masked="${esc(k.keyPrefix)}">${esc(k.keyPrefix)}</code> ${controls}</td>
            <td>${status}</td>
            <td>${esc(k.allowedDomains.join(', ') || '—')}</td>
            <td>${iso(k.lastUsedAt)}</td>
            <td>${iso(k.createdAt)}</td>
            <td>${action}</td>
          </tr>`
        })
        .join('')
    : `<tr><td colspan="6" class="empty">No API keys yet — create one below.</td></tr>`

  const createdBanner = createdId
    ? `<div class="ok">New key created — it's highlighted below. You can reveal or copy any key here whenever you need it.</div>`
    : ''

  return shell('API keys · contactapi', '/dashboard/keys', name, /* html */ `
    <h1>API keys</h1>
    <p class="muted">Authenticate requests with <code>Authorization: Bearer &lt;key&gt;</code>. Secret keys have full access; publishable keys can only create contacts and are locked to your domains. Keys are stored encrypted — reveal or copy them here anytime.</p>
    ${createdBanner}
    <table>
      <thead><tr><th>Key</th><th>Type</th><th>Domains</th><th>Last used</th><th>Created</th><th></th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    <fieldset>
      <legend>Create another key</legend>
      <form method="post" action="/dashboard/keys">
        <div class="row">
          <label>Type
            <select name="type" id="keyType">
              <option value="secret">Secret (full access)</option>
              <option value="publishable">Publishable (create-only)</option>
            </select>
          </label>
          <label id="domainsWrap" style="display:none">Allowed domains
            <input type="text" name="allowed_domains" placeholder="app.example.com, example.com" size="34" />
          </label>
          <button type="submit">Create key</button>
        </div>
      </form>
    </fieldset>
    <script type="module">
      const sel = document.getElementById('keyType');
      const wrap = document.getElementById('domainsWrap');
      sel.addEventListener('change', () => { wrap.style.display = sel.value === 'publishable' ? '' : 'none'; });

      // Cache revealed values so Reveal-then-Copy doesn't refetch.
      const cache = new Map();
      async function fetchKey(id) {
        if (cache.has(id)) return cache.get(id);
        const res = await fetch('/dashboard/keys/' + id + '/reveal', { method: 'POST' });
        if (!res.ok) throw new Error('reveal failed');
        const { key } = await res.json();
        cache.set(id, key);
        return key;
      }

      document.querySelectorAll('button.reveal').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const id = btn.dataset.id;
          const code = document.querySelector('[data-row="' + id + '"] code.keyval');
          if (btn.textContent === 'Hide') {
            code.textContent = code.dataset.masked;
            btn.textContent = 'Reveal';
            return;
          }
          btn.disabled = true;
          try { code.textContent = await fetchKey(id); btn.textContent = 'Hide'; }
          catch { btn.textContent = 'Error'; }
          finally { btn.disabled = false; }
        });
      });

      document.querySelectorAll('button.copy').forEach((btn) => {
        btn.addEventListener('click', async () => {
          const id = btn.dataset.id;
          const original = btn.textContent;
          btn.disabled = true;
          try {
            await navigator.clipboard.writeText(await fetchKey(id));
            btn.textContent = 'Copied!';
          } catch { btn.textContent = 'Error'; }
          finally {
            btn.disabled = false;
            setTimeout(() => { btn.textContent = original; }, 1500);
          }
        });
      });
    </script>
  `)
}

// Shape the contacts route serializes each row into for the dashboard.
export type ContactView = {
  id: string
  email: string
  fields: Record<string, unknown>
  created_at: string
  updated_at: string
}

export type ContactsView = {
  contacts: ContactView[]
  page: number
  total: number
  totalPages: number
  pageSize: number
  q: string
}

// One-line preview of a contact's non-reserved fields for the table.
function fieldsSummary(fields: Record<string, unknown>): string {
  const parts = Object.entries(fields).map(([k, v]) => {
    const val = v === null || typeof v === 'object' ? JSON.stringify(v) : String(v)
    return `${k}=${val}`
  })
  const joined = parts.join(', ')
  return joined.length > 80 ? `${joined.slice(0, 79)}…` : joined
}

export function contactsPage(name: string, view: ContactsView): string {
  const { contacts, page, total, totalPages, pageSize, q } = view

  const rows = contacts.length
    ? contacts
        .map(
          (row) => `<tr class="contact" data-id="${esc(row.id)}">
            <td>${esc(row.email)}</td>
            <td class="muted">${esc(fieldsSummary(row.fields)) || '—'}</td>
            <td>${esc(row.created_at)}</td>
          </tr>`,
        )
        .join('')
    : `<tr><td colspan="3" class="empty">${
        q ? `No contacts match “${esc(q)}”.` : 'No contacts yet — create one, or POST to <code>/v1/contacts</code>.'
      }</td></tr>`

  // Preserve the active search term across page links.
  const qs = (p: number) => {
    const params = new URLSearchParams()
    if (q) params.set('q', q)
    if (p > 1) params.set('page', String(p))
    const s = params.toString()
    return s ? `/dashboard/contacts?${s}` : '/dashboard/contacts'
  }
  const prev = page > 1
    ? `<a href="${qs(page - 1)}">← Prev</a>`
    : `<span class="disabled">← Prev</span>`
  const next = page < totalPages
    ? `<a href="${qs(page + 1)}">Next →</a>`
    : `<span class="disabled">Next →</span>`

  const rangeStart = total === 0 ? 0 : (page - 1) * pageSize + 1
  const rangeEnd = Math.min(page * pageSize, total)

  const clear = q
    ? `<a class="clear muted" href="/dashboard/contacts">Clear</a>`
    : ''

  // Embed the current page's contacts so the drawer can open instantly. Escape
  // "<" so the payload can't break out of the <script> element.
  const payload = JSON.stringify(contacts).replaceAll('<', '\\u003c')

  return shell('Contacts · contactapi', '/dashboard/contacts', name, /* html */ `
    <h1>Contacts</h1>
    <p class="muted">${total} contact${total === 1 ? '' : 's'} on your account. Click a row to view, edit, or delete it.</p>

    <div class="toolbar">
      <form class="search" method="get" action="/dashboard/contacts">
        <input type="search" name="q" value="${esc(q)}" placeholder="Search by email…" />
        <button class="ghost" type="submit">Search</button>
        ${clear}
      </form>
      <button type="button" id="newContact">+ New contact</button>
    </div>

    <table>
      <thead><tr><th>Email</th><th>Fields</th><th>Created</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>

    <div class="pagination">
      ${prev}
      <span>${total === 0 ? '0 of 0' : `${rangeStart}–${rangeEnd} of ${total}`}</span>
      ${next}
    </div>

    <div class="overlay" id="overlay"></div>
    <aside class="drawer" id="drawer" aria-hidden="true">
      <div class="dhead">
        <h2 id="drawerTitle">Contact</h2>
        <button type="button" class="close" id="drawerClose" aria-label="Close">×</button>
      </div>
      <div class="dbody">
        <p class="err" id="drawerErr"></p>
        <label class="field"><span>Email</span>
          <input type="email" id="fEmail" placeholder="jane@example.com" />
        </label>
        <label class="field"><span>Fields (JSON)</span>
          <textarea id="fFields" spellcheck="false">{}</textarea>
        </label>
        <div class="meta" id="drawerMeta"></div>
      </div>
      <div class="dfoot">
        <button type="button" class="ghost" id="drawerDelete">Delete</button>
        <button type="button" id="drawerSave">Save</button>
      </div>
    </aside>

    <script type="application/json" id="contactsData">${payload}</script>
    <script type="module">
      const rows = JSON.parse(document.getElementById('contactsData').textContent);
      const byId = new Map(rows.map((r) => [r.id, r]));

      const overlay = document.getElementById('overlay');
      const drawer = document.getElementById('drawer');
      const title = document.getElementById('drawerTitle');
      const err = document.getElementById('drawerErr');
      const emailEl = document.getElementById('fEmail');
      const fieldsEl = document.getElementById('fFields');
      const metaEl = document.getElementById('drawerMeta');
      const delBtn = document.getElementById('drawerDelete');
      const saveBtn = document.getElementById('drawerSave');

      let currentId = null; // null = create mode

      function esc(s) { return String(s).replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c])); }

      function open(id) {
        currentId = id;
        err.textContent = '';
        const c = id ? byId.get(id) : null;
        if (c) {
          title.textContent = c.email;
          emailEl.value = c.email;
          fieldsEl.value = JSON.stringify(c.fields ?? {}, null, 2);
          metaEl.innerHTML = 'ID <code>' + esc(c.id) + '</code><br>Created ' + esc(c.created_at) + '<br>Updated ' + esc(c.updated_at);
          delBtn.style.display = '';
        } else {
          title.textContent = 'New contact';
          emailEl.value = '';
          fieldsEl.value = '{}';
          metaEl.innerHTML = '';
          delBtn.style.display = 'none';
        }
        overlay.classList.add('open');
        drawer.classList.add('open');
        drawer.setAttribute('aria-hidden', 'false');
        emailEl.focus();
      }

      function close() {
        overlay.classList.remove('open');
        drawer.classList.remove('open');
        drawer.setAttribute('aria-hidden', 'true');
      }

      document.querySelectorAll('tr.contact').forEach((tr) => {
        tr.addEventListener('click', () => open(tr.dataset.id));
      });
      document.getElementById('newContact').addEventListener('click', () => open(null));
      document.getElementById('drawerClose').addEventListener('click', close);
      overlay.addEventListener('click', close);
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });

      saveBtn.addEventListener('click', async () => {
        err.textContent = '';
        const email = emailEl.value.trim();
        if (!email) { err.textContent = 'Email is required.'; return; }
        let fields;
        try { fields = fieldsEl.value.trim() ? JSON.parse(fieldsEl.value) : {}; }
        catch { err.textContent = 'Fields must be valid JSON.'; return; }
        if (typeof fields !== 'object' || fields === null || Array.isArray(fields)) {
          err.textContent = 'Fields must be a JSON object.'; return;
        }
        saveBtn.disabled = true;
        try {
          const url = currentId ? '/dashboard/contacts/' + currentId : '/dashboard/contacts';
          const res = await fetch(url, {
            method: currentId ? 'PATCH' : 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ email, fields }),
          });
          if (res.ok) { location.reload(); return; }
          const body = await res.json().catch(() => ({}));
          err.textContent = body.error || 'Could not save contact.';
        } catch { err.textContent = 'Network error — try again.'; }
        finally { saveBtn.disabled = false; }
      });

      delBtn.addEventListener('click', async () => {
        if (!currentId) return;
        if (!confirm('Delete this contact? This cannot be undone.')) return;
        delBtn.disabled = true;
        try {
          const res = await fetch('/dashboard/contacts/' + currentId, { method: 'DELETE' });
          if (res.ok) { location.reload(); return; }
          err.textContent = 'Could not delete contact.';
        } catch { err.textContent = 'Network error — try again.'; }
        finally { delBtn.disabled = false; }
      });
    </script>
  `)
}
