# Self-hosting

Contact API is open source (MIT) and built with [Hono](https://hono.dev), deployed on [Vercel](https://vercel.com).

Source: <https://github.com/kozmos-tech/contactapi>

## Prerequisites

- [Vercel CLI](https://vercel.com/docs/cli) installed globally.
- Environment configured per `.env.example`.

## Develop

```bash
npm install
vc dev
open http://localhost:3000
```

## Build

```bash
npm install
vc build
```

## Deploy

```bash
npm install
vc deploy
```

## Pointing MCP clients at your instance

The MCP bridge reads `CONTACTAPI_MCP_URL`, which defaults to `https://contactapi.dev/mcp`. Set it to your own endpoint to connect clients to your instance. See [MCP server](mcp.md).
