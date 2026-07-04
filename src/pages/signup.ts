import { baseStyle } from '../styles.js'

export const signupPage = /* html */ `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Sign up for contactapi</title>
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
  .hint { font-size: 12px; color: #999; margin-top: -6px; }
  .alt { font-size: 13px; color: #666; margin-top: 20px; text-align: center; }
</style>
</head>
<body>
  <a class="back muted" href="/">← contactapi</a>
  <h1>Sign up</h1>
  <p class="muted" style="font-size:14px">Create an account to get your API key.</p>
  <form id="signupForm">
    <label for="name">Name</label>
    <input id="name" type="text" required placeholder="Ada Lovelace" autocomplete="name" />
    <label for="email">Email</label>
    <input id="email" type="email" required placeholder="you@example.com" autocomplete="email" />
    <label for="password">Password</label>
    <input id="password" type="password" required minlength="8" placeholder="••••••••" autocomplete="new-password" />
    <p class="hint">At least 8 characters.</p>
    <button type="submit">Create account</button>
  </form>
  <p id="error" style="color:#c00;font-size:13px;margin-top:12px;display:none"></p>
  <p class="alt">Already have an account? <a href="/login">Log in</a></p>
<script type="module">
  const form = document.getElementById('signupForm');
  const errEl = document.getElementById('error');
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errEl.style.display = 'none';
    const res = await fetch('/api/auth/sign-up/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
      }),
    });
    if (res.ok) {
      location.href = '/dashboard';
    } else {
      const body = await res.json().catch(() => ({}));
      errEl.textContent = body?.message || 'Could not create account.';
      errEl.style.display = 'block';
    }
  });
</script>
</body>
</html>`
