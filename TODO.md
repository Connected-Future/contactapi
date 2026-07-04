# TODO — Authentication

- [ ] **Email verification** — currently `emailVerified` defaults false and isn't
  enforced. Add an email provider + `requireEmailVerification` when there's a way
  to send mail.
- [ ] **Password reset** — wire `sendResetPassword` (needs email).
- [x] **CORS for publishable keys** — `hono/cors` on `/v1/*` (origin `*`;
  preflight can't see the key, so the per-key domain lock in `requireAuth` stays
  the real allowlist). See `src/routes/contacts.ts`.
- [x] **Rate limiting** on `/api/auth/*` (20/min/IP) and key creation
  (10/min/IP), via `src/middleware/ratelimit.ts`. Caveat: in-memory, so on
  serverless the limit is per-instance, not global — swap in Upstash/Redis if a
  hard global cap is needed.
- [ ] **Distributed rate limiting** — move the limiter to a shared store so the
  cap holds across serverless instances.
- [ ] **Tests** — port the manual smoke checks (signup → session → mint → Bearer
  → revoke → 401; publishable on `GET` → 403; domain mismatch → 403) into a
  committed test suite.
- [ ] **`BETTER_AUTH_URL` in production** — set to the deployed origin so cookies
  and CSRF origin checks are correct.

## Reference
- Auth model & error codes: `src/content/llms.ts` (the `/llms.txt` spec).
- Schema: `src/db/schema.ts` (`api_keys`, `contacts`) + `src/db/auth-schema.ts`
  (Better Auth tables).
