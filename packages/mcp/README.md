# @kozmos-tech/contactapi

An open-source API for collecting and managing contacts and signups.

Contact API's MCP server is hosted and remote. This package is a tiny launcher
that bridges any stdio MCP client to the hosted endpoint, so clients that only
speak stdio (or launch servers via `npx`) can connect with one config block.

## Usage

Add Contact API to your MCP client config:

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

That's it. On first run the bridge opens a browser to sign in (OAuth); after that
your session is cached. The client then sees Contact API's tools — `list_contacts`,
`get_contact`, `create_contact` (upsert by email), `update_contact`, and
`delete_contact`, all scoped to the account you log in as.

## Authentication

OAuth 2.1 with dynamic client registration. The first run opens a browser to
authorize the connection — no API key to copy. After that your session is cached.

## Self-hosting

Point the bridge at your own Contact API instance with an environment variable:

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

## License

MIT
