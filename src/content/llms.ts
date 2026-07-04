export const llmsTxt = `# contactapi

> An open-source API to save contacts. Send a POST with an email and any other JSON fields you want, and they get saved as-is. Manage them with simple CRUD. The base URL is https://contactapi.dev and every request is authenticated with a Bearer API key.

Contacts are keyed by email: creating a contact whose email already exists updates it in place rather than duplicating it. Contact IDs look like \`con_a1b2\`. All timestamps are ISO 8601 UTC. All request and response bodies are JSON.

## Base URL

\`\`\`
https://contactapi.dev
\`\`\`

## Authentication

Every request carries your API key in the \`Authorization\` header as a Bearer token:

\`\`\`
Authorization: Bearer YOUR_KEY
\`\`\`

There are two kinds of key:

- \`ck_secret_…\` — secret key. Use it on your backend. Full access to every endpoint below.
- \`ck_pub_…\` — publishable key. Use it in the browser. It can only create contacts (POST /v1/contacts) and is locked to your domains.

## Endpoints

### POST /v1/contacts

Create a contact. Accepts a secret or publishable key. If a contact with the same email already exists, it is updated in place rather than duplicated (upsert).

Body parameters:

- \`email\` (string, required) — the contact's email, used as the unique key.
- any other fields (optional) — any other JSON fields such as \`name\`, \`plan\` or \`source\` are saved as-is.

Request:

\`\`\`
curl -X POST https://contactapi.dev/v1/contacts \\
  -H "Authorization: Bearer ck_secret_..." \\
  -H "Content-Type: application/json" \\
  -d '{ "email": "ada@example.com", "name": "Ada", "plan": "pro" }'
\`\`\`

Response \`201 Created\`:

\`\`\`json
{
  "id": "con_a1b2",
  "email": "ada@example.com",
  "name": "Ada",
  "plan": "pro",
  "created_at": "2026-07-04T10:00:00Z",
  "updated_at": "2026-07-04T10:00:00Z"
}
\`\`\`

### GET /v1/contacts

List your contacts, sorted by \`created_at\`, newest first. Requires a secret key.

Query parameters:

- \`page\` (integer, optional) — which page to return, starting at 1. Defaults to 1.
- \`page_size\` (integer, optional) — how many contacts per page, 1–100. Defaults to 20.

Request:

\`\`\`
curl https://contactapi.dev/v1/contacts?page=1&page_size=20 \\
  -H "Authorization: Bearer ck_secret_..."
\`\`\`

Response \`200 OK\`:

\`\`\`json
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
\`\`\`

\`total\` is the full contact count across all pages. \`total_pages\` is \`ceil(total / page_size)\`. There are more pages to fetch while \`page < total_pages\`.

### GET /v1/contacts/:id

Fetch a single contact by id. Requires a secret key.

Request:

\`\`\`
curl https://contactapi.dev/v1/contacts/con_a1b2 \\
  -H "Authorization: Bearer ck_secret_..."
\`\`\`

Response \`200 OK\`:

\`\`\`json
{
  "id": "con_a1b2",
  "email": "ada@example.com",
  "name": "Ada",
  "plan": "pro",
  "created_at": "2026-07-04T10:00:00Z",
  "updated_at": "2026-07-04T10:00:00Z"
}
\`\`\`

### PATCH /v1/contacts/:id

Update a contact by sending only the fields you want to change. Fields you omit are left untouched. Requires a secret key.

Request:

\`\`\`
curl -X PATCH https://contactapi.dev/v1/contacts/con_a1b2 \\
  -H "Authorization: Bearer ck_secret_..." \\
  -H "Content-Type: application/json" \\
  -d '{ "plan": "enterprise" }'
\`\`\`

Response \`200 OK\`:

\`\`\`json
{
  "id": "con_a1b2",
  "email": "ada@example.com",
  "name": "Ada",
  "plan": "enterprise",
  "updated_at": "2026-07-04T11:30:00Z"
}
\`\`\`

### DELETE /v1/contacts/:id

Delete a contact by id. Requires a secret key.

Request:

\`\`\`
curl -X DELETE https://contactapi.dev/v1/contacts/con_a1b2 \\
  -H "Authorization: Bearer ck_secret_..."
\`\`\`

Response \`200 OK\`:

\`\`\`json
{ "id": "con_a1b2", "deleted": true }
\`\`\`

## MCP server

An MCP (Model Context Protocol) server lets AI clients — Claude Desktop, claude.ai custom connectors, Cursor, the MCP Inspector — manage contacts as tools. The endpoint is:

\`\`\`
https://contactapi.dev/mcp
\`\`\`

Authentication is OAuth 2.1 with dynamic client registration, not an API key. Point the client at the URL; it discovers the authorization server at \`/.well-known/oauth-authorization-server\`, registers itself, and sends you to log in and approve access. All tools act on the account you log in as.

Tools (they mirror the REST endpoints above):

- \`list_contacts\` — list your contacts, newest first. Params: \`page\`, \`page_size\`.
- \`get_contact\` — fetch one contact. Params: \`id\`.
- \`create_contact\` — create or upsert-by-email. Params: \`email\`, \`fields\` (arbitrary JSON).
- \`update_contact\` — partial update, merged into existing fields. Params: \`id\`, \`email\`, \`fields\`.
- \`delete_contact\` — delete one contact. Params: \`id\`.

## Errors

Errors return a non-2xx status and a JSON body with an \`error\` object:

\`\`\`json
{ "error": { "message": "email is required" } }
\`\`\`

Common status codes:

- \`400 Bad Request\` — the request body or query is invalid (e.g. missing \`email\`).
- \`401 Unauthorized\` — missing or invalid API key.
- \`403 Forbidden\` — the key is not allowed to perform this action (e.g. a publishable key on a non-create endpoint).
- \`404 Not Found\` — no contact with that id.

## Optional

- [GitHub repository](https://github.com/kozmos-tech/contactapi): Source code, MIT licensed.
- [Get an API key](https://contactapi.dev/login): Log in to obtain your key.
`
