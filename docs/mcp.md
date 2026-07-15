# MCP server

An [MCP](https://modelcontextprotocol.io) (Model Context Protocol) server lets AI clients — Claude Desktop, claude.ai custom connectors, Cursor, the MCP Inspector — manage your contacts as tools.

Endpoint:

```
https://contactapi.dev/mcp
```

## Authentication

OAuth 2.1 with dynamic client registration, not an API key. Point a client at the URL; it discovers the authorization server at `/.well-known/oauth-authorization-server`, registers itself, and sends you to log in and approve access. There is no key to copy. Every tool acts on the account you log in as.

## Tools

They mirror the REST endpoints in the [API reference](api-reference.md).

| Tool | Description | Params |
| --- | --- | --- |
| `list_contacts` | List your contacts, newest first | `page`, `page_size` |
| `get_contact` | Fetch one contact | `id` |
| `create_contact` | Create or upsert by email | `email`, `fields` (arbitrary JSON) |
| `update_contact` | Partial update, merged into existing fields | `id`, `email`, `fields` |
| `delete_contact` | Delete one contact | `id` |

## Connecting a stdio client

Clients that only speak stdio (or launch servers via `npx`) can use the published bridge package, which connects them to the hosted endpoint:

```json
{
  "mcpServers": {
    "contactapi": {
      "command": "npx",
      "args": ["-y", "@kozmos-tech/contactapi"]
    }
  }
}
```

On first run the bridge opens a browser to sign in (OAuth); after that your session is cached.

## Pointing at a self-hosted instance

Set `CONTACTAPI_MCP_URL` to your own instance:

```json
{
  "mcpServers": {
    "contactapi": {
      "command": "npx",
      "args": ["-y", "@kozmos-tech/contactapi"],
      "env": { "CONTACTAPI_MCP_URL": "https://contacts.example.com/mcp" }
    }
  }
}
```

`CONTACTAPI_MCP_URL` defaults to `https://contactapi.dev/mcp`.
