# Authentication

Every request carries your API key in the `Authorization` header as a Bearer token:

```
Authorization: Bearer YOUR_KEY
```

## Key types

There are two kinds of key.

| Key | Prefix | Use it | Can do |
| --- | --- | --- | --- |
| Secret | `ck_secret_…` | Your backend | Full access to every endpoint |
| Publishable | `ck_pub_…` | The browser | Create contacts only (`POST /v1/contacts`), locked to your domains |

A publishable key is safe to ship in client-side code. It cannot list, read, update, or delete contacts, and it only works from the domains you allow on the key.

Both keys are minted from your dashboard. The secret key is shown once; store it somewhere safe.

## Using keys in the browser

The API sends permissive CORS headers so publishable keys work from the browser. The real allowlist is the per-key domain lock, so a publishable key only functions on the domains you configured for it.

## Errors

- A missing or invalid key returns `401 Unauthorized`.
- Using a publishable key on an endpoint it is not allowed to call returns `403 Forbidden`.

See [Errors](errors.md) for the full list.
