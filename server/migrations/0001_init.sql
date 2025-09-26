-- 0001_init.sql
-- Initial schema for OpenPass (Postgres)

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email varchar(320) NOT NULL,
  email_verified_at timestamp with time zone,
  name text,
  image_url text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS accounts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider_id varchar(100) NOT NULL,
  provider_account_id varchar(200) NOT NULL,
  access_token text,
  refresh_token text,
  expires_at timestamp with time zone,
  scope text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  session_token varchar(255) NOT NULL,
  user_agent text,
  ip_hash varchar(128),
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  expires_at timestamp with time zone,
  last_rotated_at timestamp with time zone
);

CREATE TABLE IF NOT EXISTS verification_tokens (
  identifier varchar(255) NOT NULL,
  token varchar(255) NOT NULL,
  expires_at timestamp with time zone NOT NULL
);

CREATE TABLE IF NOT EXISTS keys (
  kid varchar(64) PRIMARY KEY,
  alg varchar(32) NOT NULL,
  public_key text NOT NULL,
  private_key text NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  rotates_at timestamp with time zone
);

CREATE TABLE IF NOT EXISTS tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug varchar(128) NOT NULL,
  name varchar(255) NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS user_tenants (
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  tenant_id uuid NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
  role varchar(64) NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);
