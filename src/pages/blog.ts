import { baseStyle } from '../styles.js'
import { posts, type Post } from '../content/blog.js'

const SITE = 'https://contactapi.dev'

// Escape user-facing strings that land in HTML/attributes. Post content is authored
// by us and trusted, but titles/descriptions still flow into <title> and <meta>.
function esc(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

// A readable, locale-stable date like "June 27, 2026". Built from the ISO parts so it
// doesn't depend on the server timezone.
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
function formatDate(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  return `${MONTHS[m - 1]} ${d}, ${y}`
}

const blogStyle = /* css */ `
  .btn {
    display: inline-block;
    padding: 9px 16px;
    font-size: 14px;
    background: #1a1a1a;
    color: #fff;
    border-radius: 6px;
    text-decoration: none;
  }
  .btn:hover { background: #333; }
  .backlink { font-size: 14px; color: #666; text-decoration: none; }
  .post-meta { color: #999; font-size: 13px; margin: 0 0 24px; }
  .post-body ul { margin: 0 0 16px; padding-left: 22px; }
  .post-body li { margin: 0 0 6px; }
  .cat { font-size: 11px; text-transform: uppercase; letter-spacing: .5px; color: #999; margin: 32px 0 8px; }
  .post-link { display: block; text-decoration: none; margin: 0 0 18px; }
  .post-link .t { font-size: 16px; color: #1a1a1a; font-weight: 600; }
  .post-link:hover .t { color: #2563eb; }
  .post-link .d { font-size: 14px; color: #666; margin: 2px 0 0; }
  footer { margin-top: 56px; font-size: 13px; color: #888; }
`

function layout(opts: { title: string; description: string; canonical: string; body: string }): string {
  return /* html */ `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<link rel="icon" href="/favicon.ico?v=2" sizes="any" />
<title>${esc(opts.title)}</title>
<meta name="description" content="${esc(opts.description)}" />
<link rel="canonical" href="${esc(opts.canonical)}" />
<style>${baseStyle}${blogStyle}</style>
</head>
<body>
${opts.body}
</body>
</html>`
}

const CATEGORY_ORDER: Post['category'][] = ['Comparisons', 'Alternatives', 'Use cases', 'Guides']

export function blogIndexPage(): string {
  // Group posts by category, newest first within each group.
  const groups = CATEGORY_ORDER.map((cat) => ({
    cat,
    items: posts
      .filter((p) => p.category === cat)
      .sort((a, b) => (a.date < b.date ? 1 : -1)),
  })).filter((g) => g.items.length > 0)

  const sections = groups
    .map(
      (g) => /* html */ `
    <p class="cat">${g.cat}</p>
    ${g.items
      .map(
        (p) => /* html */ `<a class="post-link" href="/blog/${p.slug}">
      <span class="t">${esc(p.title)}</span>
      <span class="d">${esc(p.description)}</span>
    </a>`,
      )
      .join('')}`,
    )
    .join('')

  const body = /* html */ `
  <div class="topbar" style="display:flex;align-items:center;justify-content:space-between;gap:16px">
    <h1>Blog</h1>
    <a class="backlink" href="/">← ContactAPI</a>
  </div>
  <p class="muted" style="margin-top:8px">Guides and comparisons for storing and managing contacts with an API.</p>
  ${sections}
  <footer>Open source · MIT licensed · <a href="https://github.com/Connected-Future/contactapi">GitHub</a></footer>`

  return layout({
    title: 'Blog · ContactAPI',
    description: 'Guides, comparisons, and use cases for storing and managing contacts with a simple API.',
    canonical: `${SITE}/blog`,
    body,
  })
}

/** Render a single post by slug, or return null if there's no such post. */
export function renderPost(slug: string): string | null {
  const post = posts.find((p) => p.slug === slug)
  if (!post) return null

  const body = /* html */ `
  <p><a class="backlink" href="/blog">← Blog</a></p>
  <h1>${esc(post.title)}</h1>
  <p class="post-meta">${post.category} · ${formatDate(post.date)}</p>
  <div class="post-body">${post.body}</div>
  <footer>Open source · MIT licensed · <a href="https://github.com/Connected-Future/contactapi">GitHub</a></footer>`

  return layout({
    title: `${post.title} · ContactAPI`,
    description: post.description,
    canonical: `${SITE}/blog/${post.slug}`,
    body,
  })
}
