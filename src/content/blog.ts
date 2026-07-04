// Blog posts for SEO. Each post is plain data; the body is an HTML fragment that
// gets wrapped by the layout in ../pages/blog.ts. Keep posts short (~300-400 words),
// honest about what ContactAPI is and isn't, and end with a light call to action.

export type Post = {
  slug: string
  title: string
  /** Used for <meta name="description"> and the index listing. */
  description: string
  /** ISO date, YYYY-MM-DD. */
  date: string
  category: 'Alternatives' | 'Comparisons' | 'Use cases' | 'Guides'
  /** HTML fragment: <h2>, <p>, <pre>, <ul>, etc. No <h1> (the title renders it). */
  body: string
}

// Reused so the CTA stays consistent and is written once.
const cta = /* html */ `
  <h2>Where ContactAPI fits</h2>
  <p>ContactAPI is an open-source REST API for saving and managing contacts. You POST an
  email plus any JSON fields, get simple CRUD back, and can reach the same data from an
  AI client over its <a href="/#mcp">MCP server</a>. No CRM, no pipeline stages, no lock-in.</p>
  <p><a class="btn" href="/login">Get an API key</a></p>`

export const posts: Post[] = [
  // ── Alternatives ──────────────────────────────────────────────────────────
  {
    slug: 'hubspot-contacts-api-alternatives',
    title: 'HubSpot Contacts API Alternatives',
    description: 'Lighter, developer-first alternatives to the HubSpot Contacts API when you want CRUD without a full CRM.',
    date: '2026-06-16',
    category: 'Alternatives',
    body: /* html */ `
      <p>HubSpot's Contacts API is powerful, but it comes bolted to a full CRM: object
      schemas, associations, deal pipelines, OAuth apps, and rate tiers you have to reason
      about before you can store a single email. If all you need is to save contacts and
      read them back, that's a lot of surface area.</p>

      <h2>When to look elsewhere</h2>
      <ul>
        <li>You want a plain <code>POST /contacts</code>, not a CRM object model.</li>
        <li>You don't need deals, tickets, or marketing automation.</li>
        <li>You'd rather not manage a HubSpot app and OAuth scopes for a side project.</li>
      </ul>

      <h2>Alternatives worth considering</h2>
      <ul>
        <li><strong>ContactAPI:</strong> open-source REST CRUD, upsert by email, publishable keys for the browser.</li>
        <li><strong>Airtable:</strong> good if you also want a spreadsheet UI for non-developers.</li>
        <li><strong>A Postgres table plus your own endpoints:</strong> most control, most maintenance.</li>
      </ul>

      <p>Keep HubSpot if you genuinely need the CRM: sales pipelines, email sequences, and
      reporting across a team. Drop it when the CRM is dead weight around a contacts table.</p>
      ${cta}`,
  },
  {
    slug: 'google-people-api-alternatives',
    title: 'Google People API Alternatives',
    description: 'Alternatives to the Google People API for developers who want to store contacts without OAuth scopes and Google account lock-in.',
    date: '2026-06-18',
    category: 'Alternatives',
    body: /* html */ `
      <p>The Google People API reads and writes contacts inside a user's Google account.
      That's exactly right if your feature <em>is</em> "sync with the user's Google
      Contacts," and overkill for everything else. You inherit OAuth consent screens,
      sensitive scopes, verification review, and data that lives in Google, not your app.</p>

      <h2>Signs you want something else</h2>
      <ul>
        <li>You want to store <em>your app's</em> contacts, not read the user's Google address book.</li>
        <li>You don't want to pass Google's OAuth verification for restricted scopes.</li>
        <li>You want the contact data in your own database.</li>
      </ul>

      <h2>Alternatives</h2>
      <ul>
        <li><strong>ContactAPI:</strong> your contacts, your account, a bearer key instead of OAuth scopes.</li>
        <li><strong>Firebase/Firestore:</strong> if you want a general database and will model contacts yourself.</li>
        <li><strong>Airtable:</strong> if a visible table beats an API for your team.</li>
      </ul>

      <p>Use the People API only when the goal really is syncing a person's Google
      Contacts. For app-owned contacts, a plain API is less friction and keeps the data
      where you can query it.</p>
      ${cta}`,
  },
  {
    slug: 'airtable-alternatives-storing-contacts',
    title: 'Airtable Alternatives for Storing Contacts',
    description: 'API-first alternatives to Airtable when you are storing contacts programmatically and the spreadsheet UI is getting in the way.',
    date: '2026-06-20',
    category: 'Alternatives',
    body: /* html */ `
      <p>Airtable is a great spreadsheet-database hybrid, and plenty of people use a base
      as a contacts store. It starts to chafe when your access is mostly programmatic:
      per-workspace record limits, an API shaped around bases and views, and pricing that
      climbs as rows grow.</p>

      <h2>When the spreadsheet gets in the way</h2>
      <ul>
        <li>Contacts are written by code (forms, signups), not typed by hand.</li>
        <li>You're hitting row caps or paying per seat for machine access.</li>
        <li>You want a stable REST contract, not a base-and-table API.</li>
      </ul>

      <h2>Alternatives</h2>
      <ul>
        <li><strong>ContactAPI:</strong> an API built for exactly this, with upsert by email and pagination.</li>
        <li><strong>Baserow or NocoDB:</strong> open-source Airtable-likes if you still want a grid UI.</li>
        <li><strong>Postgres plus a thin API:</strong> when contacts are one part of a bigger schema.</li>
      </ul>

      <p>Stay on Airtable if humans need to browse and edit contacts in a grid. Switch when
      the data is really API traffic wearing a spreadsheet costume.</p>
      ${cta}`,
  },
  {
    slug: 'salesforce-contacts-alternatives',
    title: 'Salesforce Contacts Alternatives for Small Teams',
    description: 'Lightweight alternatives to Salesforce for storing and managing contacts when a full enterprise CRM is too much.',
    date: '2026-06-24',
    category: 'Alternatives',
    body: /* html */ `
      <p>Salesforce is the default enterprise CRM, and for a small team or indie project it
      is almost always more than you need. It brings objects, layouts, permission sets, and
      an API that assumes a full CRM data model, just to store some contacts.</p>

      <h2>Too much when…</h2>
      <ul>
        <li>You don't have a sales team working leads through stages.</li>
        <li>You want to store contacts from a product, not manage a pipeline.</li>
        <li>The per-seat cost and admin overhead outweigh the value.</li>
      </ul>

      <h2>Lighter options</h2>
      <ul>
        <li><strong>ContactAPI:</strong> contacts as a simple API, no CRM to administer.</li>
        <li><strong>HubSpot free tier:</strong> if you want a CRM UI but not the Salesforce weight.</li>
        <li><strong>A spreadsheet or Airtable:</strong> genuinely fine at very small scale.</li>
      </ul>

      <p>Keep Salesforce when you have real sales operations to run. If you're mainly
      collecting and reading contacts, an API or a light CRM will cost less and move faster.</p>
      ${cta}`,
  },
  {
    slug: 'segment-alternatives-contact-storage',
    title: 'Segment Alternatives for Simple Contact Storage',
    description: 'Alternatives to Twilio Segment when you only need to store contacts, not run a full customer data platform.',
    date: '2026-06-26',
    category: 'Alternatives',
    body: /* html */ `
      <p>Twilio Segment is a customer data platform: it collects events, builds profiles,
      and fans data out to dozens of destinations. That's a lot of machinery if your real
      need is keeping a list of people and their attributes.</p>

      <h2>Segment is overkill when…</h2>
      <ul>
        <li>You're tracking contacts, not streaming behavioral events.</li>
        <li>You don't need to route data to many downstream tools.</li>
        <li>You want to read your contacts back directly, not query a warehouse.</li>
      </ul>

      <h2>Simpler alternatives</h2>
      <ul>
        <li><strong>ContactAPI:</strong> store contacts and their fields, then read them over REST.</li>
        <li><strong>RudderStack:</strong> if you do want a CDP but open-source and self-hostable.</li>
        <li><strong>Postgres:</strong> a table beats a CDP for plain contact records.</li>
      </ul>

      <p>Reach for a CDP when you're unifying events across many sources and destinations.
      For storing and managing contacts, a contacts API is the smaller, cheaper fit.</p>
      ${cta}`,
  },
  {
    slug: 'firebase-alternatives-contacts-backend',
    title: 'Firebase Alternatives for a Contacts Backend',
    description: 'Alternatives to Firebase/Firestore when all you are building is a backend to store and manage contacts.',
    date: '2026-06-28',
    category: 'Alternatives',
    body: /* html */ `
      <p>Firebase is a common reach for "I need a backend fast." For a contacts feature it
      works, but you end up modeling collections, writing security rules, and wiring the
      SDK, which is general-purpose plumbing for a specific, well-understood shape of data.</p>

      <h2>Consider an alternative when…</h2>
      <ul>
        <li>Your data really is just contacts with some fields.</li>
        <li>You don't want to write and audit Firestore security rules.</li>
        <li>You'd prefer a REST contract you can call from anywhere.</li>
      </ul>

      <h2>Alternatives</h2>
      <ul>
        <li><strong>ContactAPI:</strong> contacts as a ready-made API, with publishable keys for the browser case.</li>
        <li><strong>Supabase:</strong> if you want a full Postgres backend with auth and storage.</li>
        <li><strong>Firestore, still:</strong> if contacts are one slice of a bigger realtime app.</li>
      </ul>

      <p>Firebase earns its keep for realtime, multi-feature apps. If contacts are the whole
      job, a purpose-built API saves you the modeling and the rules.</p>
      ${cta}`,
  },

  // ── Comparisons ─────────────────────────────────────────────────────────────
  {
    slug: 'contactapi-vs-google-people-api',
    title: 'ContactAPI vs Google People API',
    description: 'ContactAPI and the Google People API solve different problems. Here is how they compare and when to use each.',
    date: '2026-06-30',
    category: 'Comparisons',
    body: /* html */ `
      <p>These two get compared a lot, but they answer different questions. The Google
      People API reads and writes contacts inside a <em>user's Google account</em>.
      ContactAPI stores <em>your app's</em> contacts in your own account.</p>

      <h2>At a glance</h2>
      <ul>
        <li><strong>Auth.</strong> The People API uses OAuth with sensitive scopes and verification; ContactAPI uses a bearer key.</li>
        <li><strong>Where data lives.</strong> The People API keeps it in the user's Google account; ContactAPI keeps it in your database.</li>
        <li><strong>Browser writes.</strong> The People API doesn't really do them; ContactAPI has publishable, domain-locked keys.</li>
        <li><strong>AI access.</strong> ContactAPI ships an <a href="/#mcp">MCP server</a>; the People API does not.</li>
      </ul>

      <h2>Use the People API when</h2>
      <p>Your feature is literally syncing the user's Google Contacts, such as a personal
      CRM, a contact importer, or an address-book integration.</p>

      <h2>Use ContactAPI when</h2>
      <p>You're collecting and managing contacts your product owns, like signups, waitlists,
      and form submissions, and want them in your own store with a simple REST contract.</p>
      ${cta}`,
  },
  {
    slug: 'contactapi-vs-hubspot',
    title: 'ContactAPI vs HubSpot',
    description: 'A straight comparison of ContactAPI and HubSpot for storing contacts: an API versus a full CRM.',
    date: '2026-07-01',
    category: 'Comparisons',
    body: /* html */ `
      <p>HubSpot is a CRM platform; ContactAPI is a contacts API. The comparison is really
      whether you need a CRM or just need to store contacts.</p>

      <h2>At a glance</h2>
      <ul>
        <li><strong>Scope.</strong> HubSpot covers CRM, marketing, sales, and service; ContactAPI stores and manages contacts.</li>
        <li><strong>Data model.</strong> HubSpot has objects, properties, and associations; ContactAPI has an email plus any JSON fields.</li>
        <li><strong>Setup.</strong> HubSpot needs an account, app, and OAuth; ContactAPI needs a key and a POST.</li>
        <li><strong>Cost.</strong> HubSpot uses tiered CRM pricing; ContactAPI is open-source and self-hostable.</li>
      </ul>

      <h2>Choose HubSpot when</h2>
      <p>A team needs pipelines, email sequences, and reporting, plus a place where
      non-developers work leads through stages.</p>

      <h2>Choose ContactAPI when</h2>
      <p>You want the contacts table without the CRM around it: a simple endpoint your code
      calls, and data you can query yourself. You can always export to a CRM later.</p>
      ${cta}`,
  },
  {
    slug: 'contactapi-vs-airtable',
    title: 'ContactAPI vs Airtable',
    description: 'ContactAPI versus Airtable for contacts: an API-first store compared to a spreadsheet-database with a UI.',
    date: '2026-07-02',
    category: 'Comparisons',
    body: /* html */ `
      <p>Airtable gives you a visual grid with an API attached. ContactAPI gives you an API
      with no grid. Which is better depends on who touches the data.</p>

      <h2>At a glance</h2>
      <ul>
        <li><strong>Primary interface.</strong> Airtable is a spreadsheet UI; ContactAPI is REST.</li>
        <li><strong>Best for.</strong> Airtable suits humans browsing and editing; ContactAPI suits code reading and writing.</li>
        <li><strong>Browser writes.</strong> ContactAPI has publishable keys for client-side create.</li>
        <li><strong>Limits.</strong> Airtable has per-base row caps and seats; ContactAPI is a plain contacts store.</li>
      </ul>

      <h2>Choose Airtable when</h2>
      <p>Non-technical teammates need to see and edit contacts in a table, add views, and
      filter by hand.</p>

      <h2>Choose ContactAPI when</h2>
      <p>Contacts arrive from forms and signups and are consumed by code. You want a stable
      REST contract and no row-cap surprises. Nothing stops you from piping data into a
      spreadsheet later if a human ever needs the grid.</p>
      ${cta}`,
  },
  {
    slug: 'contactapi-vs-building-your-own',
    title: 'ContactAPI vs Building Your Own (Postgres + CRUD)',
    description: 'Should you build your own contacts backend or use ContactAPI? An honest build-versus-buy comparison.',
    date: '2026-07-03',
    category: 'Comparisons',
    body: /* html */ `
      <p>Storing contacts is not hard: a table, five endpoints, done. So why not build it?
      Sometimes you should. Here's the honest trade-off.</p>

      <h2>What "build your own" really includes</h2>
      <ul>
        <li>Schema, migrations, and an upsert-by-email path that handles races.</li>
        <li>Auth: API keys, hashing, and a safe way to expose create from the browser.</li>
        <li>Pagination, validation, rate limiting, and error shapes.</li>
        <li>Hosting, backups, and keeping it patched.</li>
      </ul>

      <h2>ContactAPI gives you those out of the box</h2>
      <p>You get secret and publishable keys, upsert by email, pagination, rate limiting,
      and an <a href="/#mcp">MCP server</a> so AI clients can manage contacts too. It's open
      source, so you can read every line or self-host it.</p>

      <h2>Build your own when</h2>
      <p>Contacts are tightly coupled to the rest of your schema, or you have hard
      residency or compliance needs. Otherwise the "just a table" project quietly grows the
      auth, pagination, and ops you'd rather not own.</p>
      ${cta}`,
  },

  // ── Use cases ─────────────────────────────────────────────────────────────
  {
    slug: 'store-contact-form-submissions-without-backend',
    title: 'How to Store Contact Form Submissions Without a Backend',
    description: 'Capture contact form submissions straight from the browser using a publishable API key, with no server required.',
    date: '2026-06-17',
    category: 'Use cases',
    body: /* html */ `
      <p>You have a static site, maybe a landing page, a portfolio, or a docs site, and a
      contact form. You don't want to stand up a server just to catch submissions. With a
      publishable key you can POST straight from the browser.</p>

      <h2>1. Get a publishable key</h2>
      <p>In the dashboard, create a <code>ck_pub_…</code> key and lock it to your domain. It
      can only create contacts, so it's safe to ship in client-side code.</p>

      <h2>2. POST on submit</h2>
      <pre><code>const form = document.querySelector('form')
form.addEventListener('submit', async (e) => {
  e.preventDefault()
  const data = Object.fromEntries(new FormData(form))
  await fetch('https://contactapi.dev/v1/contacts', {
    method: 'POST',
    headers: {
      'Authorization': 'Bearer ck_pub_your_key',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
})</code></pre>

      <h2>3. Read them back</h2>
      <p>From your machine or a script, use your secret key to <code>GET /v1/contacts</code>
      and see every submission. Because create upserts by email, a repeat submitter updates
      their record instead of duplicating it.</p>

      <p>That's the whole thing: a form, a fetch, and no backend to run.</p>
      ${cta}`,
  },
  {
    slug: 'build-a-waitlist-with-a-contacts-api',
    title: 'Building a Waitlist with a Contacts API',
    description: 'Launch a waitlist in an afternoon: collect emails from the browser and manage signups over REST.',
    date: '2026-06-21',
    category: 'Use cases',
    body: /* html */ `
      <p>A waitlist is the smallest possible product: a box for an email and a place to keep
      the emails. Here's how to ship one without a backend.</p>

      <h2>Collect the email</h2>
      <p>Use a publishable key (<code>ck_pub_…</code>, domain-locked, create-only) and POST
      from the page:</p>
      <pre><code>await fetch('https://contactapi.dev/v1/contacts', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ck_pub_your_key',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ email, source: 'waitlist', ref: 'launch-tweet' }),
})</code></pre>

      <p>Attach whatever you want to segment on later, such as <code>source</code>, a
      referral, or plan interest. It's all saved as-is.</p>

      <h2>Handle duplicates for free</h2>
      <p>Create upserts by email, so someone signing up twice updates their record rather
      than creating a second one. No dedupe logic on your side.</p>

      <h2>Work the list</h2>
      <p>When you're ready to invite people, page through with your secret key:</p>
      <pre><code>GET /v1/contacts?page=1&page_size=100</code></pre>
      <p>Export, invite, or pull the emails into your sender. That's a launch-ready waitlist.</p>
      ${cta}`,
  },
  {
    slug: 'give-claude-chatgpt-access-to-your-contacts-mcp',
    title: 'Give Claude and ChatGPT Access to Your Contacts (via MCP)',
    description: 'Let AI assistants read and manage your contacts safely using the Model Context Protocol and OAuth.',
    date: '2026-06-25',
    category: 'Use cases',
    body: /* html */ `
      <p>The Model Context Protocol (MCP) lets AI clients call tools on your behalf.
      ContactAPI ships an MCP server, so an assistant can list, create, update, and delete
      your contacts with your permission, scoped to your account.</p>

      <h2>The endpoint</h2>
      <pre><code>https://contactapi.dev/mcp</code></pre>

      <h2>Auth is OAuth, not a pasted key</h2>
      <p>You don't hand the model an API key. The server uses <strong>OAuth 2.1 with dynamic
      client registration</strong>: point a client at the URL, it discovers the auth server,
      registers itself, and sends you to log in and approve. Every tool call is scoped to the
      account you approved.</p>

      <h2>What the assistant can do</h2>
      <ul>
        <li><code>list_contacts</code> returns your contacts newest first, paginated.</li>
        <li><code>get_contact</code> fetches one by id.</li>
        <li><code>create_contact</code> creates or upserts by email.</li>
        <li><code>update_contact</code> merges fields into an existing contact.</li>
        <li><code>delete_contact</code> removes one.</li>
      </ul>

      <p>Add the URL as a custom connector in claude.ai, Claude Desktop, or Cursor and ask,
      in plain language, to "add ada@example.com to my contacts as a pro user." The model
      does the rest, safely and only for your data.</p>
      ${cta}`,
  },
  {
    slug: 'add-contact-management-to-nextjs',
    title: 'Add Contact Management to a Next.js App in 10 Minutes',
    description: 'Wire ContactAPI into a Next.js app with a client-side form and a server-side list, using publishable and secret keys.',
    date: '2026-06-29',
    category: 'Use cases',
    body: /* html */ `
      <p>Two keys, two patterns: a publishable key for browser writes, a secret key for
      server reads. Here's the fast path in a Next.js App Router project.</p>

      <h2>Client component: capture</h2>
      <p>Use the publishable key (<code>ck_pub_…</code>), safe to ship to the browser:</p>
      <pre><code>'use client'
export function Signup() {
  async function onSubmit(email) {
    await fetch('https://contactapi.dev/v1/contacts', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + process.env.NEXT_PUBLIC_CONTACTAPI_PUB_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email }),
    })
  }
  // ...render a form that calls onSubmit
}</code></pre>

      <h2>Server component: list</h2>
      <p>Keep the secret key server-side (<code>process.env.CONTACTAPI_SECRET_KEY</code>):</p>
      <pre><code>export default async function Contacts() {
  const res = await fetch('https://contactapi.dev/v1/contacts?page=1&page_size=20', {
    headers: { Authorization: 'Bearer ' + process.env.CONTACTAPI_SECRET_KEY },
    cache: 'no-store',
  })
  const { data } = await res.json()
  return <ul>{data.map(c => <li key={c.id}>{c.email}</li>)}</ul>
}</code></pre>

      <p>That's contact capture and a contact list, with the secret key never leaving the
      server. Add PATCH and DELETE the same way when you need them.</p>
      ${cta}`,
  },
  {
    slug: 'manage-newsletter-subscribers-rest-api',
    title: 'Managing Newsletter Subscribers with a REST API',
    description: 'Store, tag, and export newsletter subscribers with a simple REST API instead of locking into an email platform.',
    date: '2026-07-03',
    category: 'Use cases',
    body: /* html */ `
      <p>Email platforms want to own your subscriber list. Keeping subscribers in your own
      contacts API means the list is portable: you can point it at any sender, or several.</p>

      <h2>Subscribe</h2>
      <p>POST from your signup form with a publishable key and tag the source:</p>
      <pre><code>POST /v1/contacts
{ "email": "reader@example.com", "list": "weekly", "subscribed": true }</code></pre>
      <p>Upsert-by-email means re-subscribing just updates the record.</p>

      <h2>Unsubscribe</h2>
      <p>Flip a field rather than deleting, so you keep a record of who opted out:</p>
      <pre><code>PATCH /v1/contacts/con_a1b2
{ "subscribed": false }</code></pre>

      <h2>Export to your sender</h2>
      <p>Page through with your secret key and push the subscribed contacts to whatever
      email tool you use this month:</p>
      <pre><code>GET /v1/contacts?page=1&page_size=100</code></pre>

      <p>Your list lives with you, not inside one vendor. Switch senders without migrating
      subscribers.</p>
      ${cta}`,
  },

  // ── Guides ────────────────────────────────────────────────────────────────
  {
    slug: 'what-is-an-mcp-server',
    title: 'What Is an MCP Server (and Why Your API Should Have One)',
    description: 'A short, practical explainer of Model Context Protocol servers and why exposing one makes your API usable by AI clients.',
    date: '2026-06-27',
    category: 'Guides',
    body: /* html */ `
      <p>The Model Context Protocol (MCP) is a standard way to expose tools, data, and
      prompts to AI clients like Claude and Cursor. An MCP server is the thing that offers
      those tools; the AI client is the thing that calls them.</p>

      <h2>Why it matters for an API</h2>
      <p>Your REST API is built for developers writing code. An MCP server makes the same
      capabilities available to an AI assistant in plain language. Instead of a developer
      writing a fetch call, a user can ask their assistant to "add this person to my
      contacts" and it happens.</p>

      <h2>What a good MCP server needs</h2>
      <ul>
        <li><strong>Tools:</strong> named actions with typed inputs (e.g. <code>create_contact</code>).</li>
        <li><strong>Auth:</strong> ideally OAuth, so users approve access instead of pasting keys.</li>
        <li><strong>Scoping:</strong> every call limited to the account that authorized it.</li>
      </ul>

      <h2>Example</h2>
      <p>ContactAPI exposes its contact operations over MCP at <code>/mcp</code>, secured
      with OAuth 2.1 and dynamic client registration. Point a compatible client at the URL
      and it registers itself, prompts you to approve, and can then manage your contacts.</p>

      <p>If you're building an API in 2026, an MCP server is fast becoming table stakes. It's
      how your product shows up inside the AI tools people already use.</p>
      ${cta}`,
  },
  {
    slug: 'api-key-vs-oauth',
    title: 'API Key vs OAuth: When to Use Each',
    description: 'A practical guide to choosing between API keys and OAuth for your API, with real examples of when each fits.',
    date: '2026-07-01',
    category: 'Guides',
    body: /* html */ `
      <p>API keys and OAuth both authenticate requests, but they answer different questions.
      A key asks whether this is a trusted caller. OAuth asks whether this user approved this
      app to act for them.</p>

      <h2>Use an API key when</h2>
      <ul>
        <li>Your own backend is the caller and can keep a secret.</li>
        <li>You want the simplest possible setup: send a header, done.</li>
        <li>There's no third-party app acting on a user's behalf.</li>
      </ul>
      <p>For browser use, a scoped, domain-locked <em>publishable</em> key is the safe
      middle ground. It can do one narrow thing and nothing else.</p>

      <h2>Use OAuth when</h2>
      <ul>
        <li>A third-party app (or an AI client) needs to act for a user.</li>
        <li>Users should grant and revoke access without sharing a secret.</li>
        <li>You need per-user scoping and consent.</li>
      </ul>

      <h2>How ContactAPI uses both</h2>
      <p>Secret and publishable keys authenticate the <a href="/">REST API</a>. The
      <a href="/#mcp">MCP server</a> uses OAuth 2.1, because there an AI client is acting on
      a user's behalf and should ask permission rather than hold a key. Same data, two auth
      models, each matched to the caller.</p>
      ${cta}`,
  },
]
