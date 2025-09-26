import { pgTable, serial, text, varchar, timestamp, uuid, integer, json } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: uuid('id').default('gen_random_uuid()').primaryKey(),
  email: varchar('email', { length: 320 }).notNull(),
  email_verified_at: timestamp('email_verified_at'),
  name: text('name'),
  image_url: text('image_url'),
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull()
});

export const accounts = pgTable('accounts', {
  id: uuid('id').default('gen_random_uuid()').primaryKey(),
  user_id: uuid('user_id').notNull(),
  provider_id: varchar('provider_id', { length: 100 }).notNull(),
  provider_account_id: varchar('provider_account_id', { length: 200 }).notNull(),
  access_token: text('access_token'),
  refresh_token: text('refresh_token'),
  expires_at: timestamp('expires_at'),
  scope: text('scope'),
  created_at: timestamp('created_at').defaultNow().notNull()
});

export const sessions = pgTable('sessions', {
  id: uuid('id').default('gen_random_uuid()').primaryKey(),
  user_id: uuid('user_id').notNull(),
  session_token: varchar('session_token', { length: 255 }).notNull(),
  user_agent: text('user_agent'),
  ip_hash: varchar('ip_hash', { length: 128 }),
  created_at: timestamp('created_at').defaultNow().notNull(),
  expires_at: timestamp('expires_at'),
  last_rotated_at: timestamp('last_rotated_at')
});

export const verification_tokens = pgTable('verification_tokens', {
  identifier: varchar('identifier', { length: 255 }).notNull(),
  token: varchar('token', { length: 255 }).notNull(),
  expires_at: timestamp('expires_at').notNull()
});

export const keys = pgTable('keys', {
  kid: varchar('kid', { length: 64 }).primaryKey(),
  alg: varchar('alg', { length: 32 }).notNull(),
  public_key: text('public_key').notNull(),
  private_key: text('private_key').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
  rotates_at: timestamp('rotates_at')
});

export const tenants = pgTable('tenants', {
  id: uuid('id').default('gen_random_uuid()').primaryKey(),
  slug: varchar('slug', { length: 128 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull()
});

export const user_tenants = pgTable('user_tenants', {
  user_id: uuid('user_id').notNull(),
  tenant_id: uuid('tenant_id').notNull(),
  role: varchar('role', { length: 64 }).notNull(),
  created_at: timestamp('created_at').defaultNow().notNull()
});
