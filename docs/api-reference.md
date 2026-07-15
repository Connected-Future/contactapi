# API reference

Base URL: `https://contactapi.dev`

All requests are authenticated with a Bearer key ([Authentication](authentication.md)). All bodies are JSON.

| Method | Path | Key | Description |
| --- | --- | --- | --- |
| `POST` | `/v1/contacts` | secret or publishable | Create (or upsert) a contact by email |
| `GET` | `/v1/contacts` | secret | List contacts, paginated |
| `GET` | `/v1/contacts/:id` | secret | Fetch a single contact |
| `PATCH` | `/v1/contacts/:id` | secret | Update a contact |
| `DELETE` | `/v1/contacts/:id` | secret | Delete a contact |

## POST /v1/contacts

Create a contact. Accepts a secret or publishable key. If a contact with the same email already exists, it is updated in place rather than duplicated (upsert).

Body parameters:

- `email` (string, required) — the contact's email, used as the unique key.
- any other fields (optional) — anything else, such as `name`, `plan`, or `source`, is saved as-is.

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

## GET /v1/contacts

List your contacts, sorted by `created_at`, newest first. Requires a secret key.

Query parameters:

- `page` (integer, optional) — which page to return, starting at 1. Defaults to 1.
- `page_size` (integer, optional) — how many contacts per page, 1–100. Defaults to 20.

```bash
curl "https://contactapi.dev/v1/contacts?page=1&page_size=20" \
  -H "Authorization: Bearer ck_secret_..."
```

Response `200 OK`:

```json
{
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
}
```

`total` is the full contact count across all pages. `total_pages` is `ceil(total / page_size)`. There are more pages to fetch while `page < total_pages`.

## GET /v1/contacts/:id

Fetch a single contact by id. Requires a secret key.

```bash
curl https://contactapi.dev/v1/contacts/con_a1b2 \
  -H "Authorization: Bearer ck_secret_..."
```

Response `200 OK`:

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

## PATCH /v1/contacts/:id

Update a contact by sending only the fields you want to change. Fields you omit are left untouched. Requires a secret key.

```bash
curl -X PATCH https://contactapi.dev/v1/contacts/con_a1b2 \
  -H "Authorization: Bearer ck_secret_..." \
  -H "Content-Type: application/json" \
  -d '{ "plan": "enterprise" }'
```

Response `200 OK`:

```json
{
  "id": "con_a1b2",
  "email": "ada@example.com",
  "name": "Ada",
  "plan": "enterprise",
  "updated_at": "2026-07-04T11:30:00Z"
}
```

## DELETE /v1/contacts/:id

Delete a contact by id. Requires a secret key.

```bash
curl -X DELETE https://contactapi.dev/v1/contacts/con_a1b2 \
  -H "Authorization: Bearer ck_secret_..."
```

Response `200 OK`:

```json
{ "id": "con_a1b2", "deleted": true }
```
