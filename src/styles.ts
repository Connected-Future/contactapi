export const baseStyle = /* css */ `
  * { box-sizing: border-box; }
  body {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    color: #1a1a1a;
    line-height: 1.6;
    max-width: 720px;
    margin: 0 auto;
    padding: 64px 24px;
  }
  h1 { font-size: 32px; margin: 0; }
  h2 { font-size: 18px; margin: 44px 0 10px; }
  p { margin: 0 0 16px; }
  a { color: #2563eb; }
  .muted { color: #666; }
  code { font-family: ui-monospace, SFMono-Regular, Menlo, monospace; font-size: 13px; }
  pre {
    background: #f5f5f5;
    border: 1px solid #e5e5e5;
    border-radius: 6px;
    padding: 14px 16px;
    overflow-x: auto;
    font-size: 13px;
    margin: 0 0 12px;
  }
  pre code { font-size: 13px; }
`

// Shared <head> snippets included on every page.
export const analyticsScript = /* html */ `
  <script defer src="https://yourtraffic.dev/script.js"></script>
`
