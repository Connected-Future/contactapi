# Getting started

## 1. Get an API key

Log in at <https://contactapi.dev/login>. Your dashboard gives you two keys:

- a **secret key** (`ck_secret_…`) for your backend,
- a **publishable key** (`ck_pub_…`) for the browser.

See [Authentication](authentication.md) for the difference.

## 2. Save your first contact

```bash
curl -X POST https://contactapi.dev/v1/contacts \
  -H "Authorization: Bearer ck_secret_..." \
  -H "Content-Type: application/json" \
  -d '{ "email": "ada@example.com", "name": "Ada", "plan": "pro" }'
```

Response `201 Created`:

```json
{
  "id": "con_a1b2",
  "email": "ada@example.com",
  "name": "Ada",
  "plan": "pro",
  "created_at": "2026-07-04T10:00:00Z",
  "updated_at": "2026-07-04T10:00:00Z"
}
```

`email` is required. Every other field you send is stored as-is.

## 3. List them back

```bash
curl "https://contactapi.dev/v1/contacts?page=1&page_size=20" \
  -H "Authorization: Bearer ck_secret_..."
```

## Next steps

- Full endpoint list in the [API reference](api-reference.md).
- Manage contacts from an AI client with the [MCP server](mcp.md).
