# Contact API documentation

An open-source API to save contacts. Send a `POST` with an email and any other JSON fields you want, and they get saved as-is. Manage them with simple CRUD.

Base URL: `https://contactapi.dev`

## Contents

- [Getting started](getting-started.md) — make your first request in a minute.
- [Authentication](authentication.md) — API keys, secret vs. publishable.
- [API reference](api-reference.md) — every endpoint, parameters, and responses.
- [MCP server](mcp.md) — connect AI clients over the Model Context Protocol.
- [Errors](errors.md) — status codes and error shape.
- [Self-hosting](self-hosting.md) — run your own instance.

## Key concepts

- **Contacts are keyed by email.** Creating a contact whose email already exists updates it in place rather than duplicating it (upsert).
- **Contact IDs** look like `con_a1b2`.
- **Timestamps** are ISO 8601 UTC.
- **Bodies** are JSON in and JSON out.

## Links

- Landing page and interactive docs: <https://contactapi.dev>
- LLM-friendly docs: <https://contactapi.dev/llms.txt>
- Source: <https://github.com/kozmos-tech/contactapi> (MIT)
