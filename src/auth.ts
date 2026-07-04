import { betterAuth } from 'better-auth'
import { drizzleAdapter } from 'better-auth/adapters/drizzle'
import { db } from './db/client.js'
import { user, session, account, verification } from './db/auth-schema.js'
import { newId, type IdPrefix } from './db/ids.js'

// Prefix the id of each auth table to match the rest of the codebase
// (usr_… / ses_… / acc_… / ver_…), instead of Better Auth's opaque default.
const ID_PREFIX: Record<string, IdPrefix> = {
  user: 'usr',
  session: 'ses',
  account: 'acc',
  verification: 'ver',
}

// Dashboard authentication (human accounts + cookie sessions). This is separate
// from the customer-facing Bearer API keys, which stay in `middleware/auth.ts`.
export const auth = betterAuth({
  // Falls back to request-derived URL when unset; set BETTER_AUTH_URL in prod.
  baseURL: process.env.BETTER_AUTH_URL,
  secret: process.env.BETTER_AUTH_SECRET,
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: { user, session, account, verification },
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true, // start a session immediately after signup
    minPasswordLength: 8,
  },
  advanced: {
    database: {
      generateId: ({ model }) => newId(ID_PREFIX[model] ?? 'usr'),
    },
  },
})
