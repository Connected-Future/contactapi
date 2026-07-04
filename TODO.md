# TODO — Authentication

- [ ] **Email verification** — currently `emailVerified` defaults false and isn't
  enforced. Add an email provider + `requireEmailVerification` when there's a way
  to send mail.
- [ ] **Password reset** — wire `sendResetPassword` (needs email).
- [ ] **CORS for publishable keys** — the domain lock checks `Origin`/`Referer`,
  but browser cross-origin calls also need CORS headers on `/v1/*` for the
  allowed domains.
- [ ] **Rate limiting** on `/api/auth/*` and key creation.
- [ ] **Tests** — port the manual smoke checks (signup → session → mint → Bearer
  → revoke → 401; publishable on `GET` → 403; domain mismatch → 403) into a
  committed test suite.
- [ ] **`BETTER_AUTH_URL` in production** — set to the deployed origin so cookies
  and CSRF origin checks are correct.

## Reference
- Auth model & error codes: `src/content/llms.ts` (the `/llms.txt` spec).
- Schema: `src/db/schema.ts` (`api_keys`, `contacts`) + `src/db/auth-schema.ts`
  (Better Auth tables).
