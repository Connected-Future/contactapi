import { baseStyle } from '../styles.js'
import type { ApiKey, Contact } from '../db/schema.js'

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

export function contactsPage(name: string, contacts: Contact[]): string {
  const rows = contacts.length
    ? contacts
        .map((row) => {
          const data = row.data as Record<string, unknown>
          const fields = Object.entries(data)
            .filter(([k]) => !['id', 'email', 'created_at', 'updated_at'].includes(k))
            .map(([k, v]) => `${esc(k)}=${esc(v)}`)
            .join(', ')
          return `<tr>
            <td><code>${esc(row.id)}</code></td>
            <td>${esc(row.email)}</td>
            <td class="muted">${fields || '—'}</td>
            <td>${iso(row.createdAt)}</td>
          </tr>`
        })
        .join('')
    : `<tr><td colspan="4" class="empty">No contacts yet. Create some via <code>POST /v1/contacts</code>.</td></tr>`

  return shell('Contacts · contactapi', '/dashboard/contacts', name, /* html */ `
    <h1>Contacts</h1>
    <p class="muted">The 50 most recent contacts on your account.</p>
    <table>
      <thead><tr><th>ID</th><th>Email</th><th>Fields</th><th>Created</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `)
}
