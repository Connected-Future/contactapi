import { baseStyle } from '../styles.js'

export const loginPage = /* html */ `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<link rel="icon" href="/favicon.ico?v=2" sizes="any" />
<title>Log in to ContactAPI</title>
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
  <p id="error" style="color:#c00;font-size:13px;margin-top:12px;display:none"></p>
  <p class="alt">Don't have an account? <a href="/signup">Sign up</a></p>
<script type="module">
  const form = document.getElementById('loginForm');
  const errEl = document.getElementById('error');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errEl.style.display = 'none';
    const res = await fetch('/api/auth/sign-in/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
      }),
    });
    if (res.ok) {
      location.href = '/dashboard';
    } else {
      const body = await res.json().catch(() => ({}));
      errEl.textContent = body?.message || 'Invalid email or password.';
      errEl.style.display = 'block';
    }
  });
</script>
</body>
</html>`
