import {
  pgTable,
  text,
  jsonb,
  timestamp,
  uniqueIndex,
  index,
} from 'drizzle-orm/pg-core'
import { newId } from './ids.js'
import { user } from './auth-schema.js'

// Accounts, sessions and credentials live in `auth-schema.ts` — Better Auth
// owns them. Re-exported here so `import * as schema` (and drizzle-kit) see the
// full set in one place.
export * from './auth-schema.js'

// Bearer API keys. Two types: `secret` (ck_secret_…, full access) and
// `publishable` (ck_pub_…, create-only, locked to allowed_domains). The raw
// token is shown once at creation; only its SHA-256 hash is persisted.
export const apiKeys = pgTable(
  'api_keys',
  {
    id: text('id').primaryKey().$defaultFn(() => newId('key')),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    type: text('type', { enum: ['secret', 'publishable'] }).notNull(),
    keyHash: text('key_hash').notNull().unique(),
    keyPrefix: text('key_prefix').notNull(),
    allowedDomains: jsonb('allowed_domains')
      .$type<string[]>()
      .notNull()
      .default([]),
    lastUsedAt: timestamp('last_used_at', { withTimezone: true }),
    revokedAt: timestamp('revoked_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('api_keys_user_id_idx').on(t.userId)],
)

// Contacts. Structured columns for the queryable bits (id, owner, email,
// timestamps) plus a JSONB `data` bag for arbitrary fields saved as-is
// (name, plan, source, …). Unique per (user_id, email) so a create with an
// existing email upserts in place rather than duplicating.
export const contacts = pgTable(
  'contacts',
  {
    id: text('id').primaryKey().$defaultFn(() => newId('con')),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    email: text('email').notNull(),
    data: jsonb('data').$type<Record<string, unknown>>().notNull().default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    uniqueIndex('contacts_user_email_idx').on(t.userId, t.email),
    index('contacts_user_created_idx').on(t.userId, t.createdAt.desc()),
  ],
)

// `User` is re-exported from ./auth-schema via `export *` above.
export type ApiKey = typeof apiKeys.$inferSelect
export type Contact = typeof contacts.$inferSelect
