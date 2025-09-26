# OpenPass

A lightweight, self-hosted social authentication backend for any React app. Drop-in UI + JS SDK, OAuth/OIDC providers out of the box, Postgres-first (swappable adapters), Docker-ready, secure by default.

---

## Core Goals

- **Plug-and-play for React:** Prebuilt `<SignIn/>`, `<SignUp/>`, `<UserButton/>` components and a tiny JS SDK.
- **Backend you can own:** Fully functional auth server (OAuth/OIDC flows, sessions, user management) you deploy.
- **Postgres-first:** Official schema + migrations; DB adapters (Drizzle/Prisma) enable MySQL/SQLite/Neon/Supabase later.
- **Security by default:** PKCE, state/nonce, HTTPS, rotating refresh tokens, session hijack protection, CSRF for cookie mode.
- **Minimal config:** Providers enabled via `providers.json` + env vars; start with `docker compose up`.

---

## Feature Set (MVP v0.1)

- **Providers:** Google, GitHub, Microsoft, Apple (via OpenID Connect), plus generic OIDC.
- **Auth flows:** OAuth 2.1 + OIDC Code Flow w/ PKCE.
- **Sessions:**
  - Option A: HTTP-only cookies (sameSite=strict, rotating refresh).
  - Option B: JWT access + refresh (short-lived access, long-lived refresh).
- **Data model (Postgres):** users, accounts (per provider), sessions, verification_tokens (for email), keys (JWKS), tenants (optional).
- **React SDK:** auth.signIn(provider), auth.signOut(), useSession(), withAuth HOC/route guard.
- **Prebuilt UI:** `<SignIn providers={['google','github']}/>`; themeable via CSS vars or Tailwind classes.
- **Admin CLI:** featherauth user list/create, provider add, db migrate.
- **Webhooks:** USER_CREATED, USER_SIGNED_IN, SESSION_REVOKED.

---

## Nice-to-have (v0.2+)

- Email/password (optional module), magic link, TOTP MFA, WebAuthn (passkeys).
- Org/multi-tenant: org membership, roles, invitations.
- Audit log + admin web UI.
- Rate limiting & bot protection.
- Social providers expansion (Discord, Slack, LinkedIn, Twitter/X, Apple private email relay handling).
- SAML bridge (enterprise).

---

## Architecture

**Tech:** TypeScript, Fastify (or Express) + Node 20+, Drizzle ORM (primary), Zod for validation, jose for JWT/JWK, openid-client for provider integrations.

```
/server
  /src
    /config          # env, provider registry
    /db              # drizzle schema + migrations
    /domain          # use-cases (signIn, linkAccount, rotateTokens)
    /providers       # oauth/oidc handlers
    /routes          # REST endpoints
    /security        # csrf, rate limit, pkce, nonce
    /tokens          # jwt, session, refresh rotation
    /webhooks        # event bus
  Dockerfile
  docker-compose.yml
/sdk
  /react             # hooks + components
  /core              # fetch client, token store
  /css               # themes
/examples
  /vite-react
  /nextjs
```

---

## OAuth Flow (Code w/ PKCE)

React `signIn('google')` → redirect to provider → callback hits `/auth/callback/:provider` → server exchanges code → links/creates user + account → issues session (cookie or JWT) → redirects to APP_URL with state checked → React `useSession()` hydrates.

---

## API Surface

**Public REST Endpoints:**
- `POST /auth/start` → `{ provider, redirectURI }` → 302 to provider (generates state/nonce/PKCE).
- `GET /auth/callback/:provider` → handles code exchange; sets cookie or returns `{ accessToken, refreshToken }`.
- `POST /auth/token` → refresh access using refresh token (rotating).
- `POST /auth/signout` → revoke session (server-side + cookie clear).
- `GET /auth/session` → returns session/user (for SSR/hydration).
- `GET /.well-known/jwks.json` → public keys (JWT verification).
- `GET /.well-known/openid-configuration` → optional OIDC issuer metadata (if exposing as IdP later).

**Admin/Dev Endpoints (protected):**
- `POST /admin/users`, `GET /admin/users`, `POST /admin/providers`, `POST /admin/tenants`.

---

## Data Model (Drizzle schema sketch)

- **users:** id (uuid), email, email_verified_at, name, image_url, created_at, updated_at.
- **accounts:** id, user_id (fk), provider_id, provider_account_id, access_token (encrypted), refresh_token (encrypted), expires_at, scope.
- **sessions:** id, user_id, session_token (hashed), user_agent, ip_hash, created_at, expires_at, last_rotated_at.
- **verification_tokens:** identifier, token (hashed), expires_at.
- **keys:** kid, alg, public_key, private_key (encrypted), created_at, rotates_at.
- **tenants (opt):** id, slug, name; user_tenants: user_id, tenant_id, role.

Encryption at rest via libsodium (or Node crypto) for tokens; hashing via argon2/bcrypt for secrets.

---

## Security & Compliance Defaults

- OAuth/OIDC hardening: PKCE, nonce, state, exact redirect URI match, issuer/audience checks.
- Cookie mode: httpOnly, secure, sameSite=strict, domain scoping, CSRF token for stateful POSTs.
- JWT mode: short TTL (5–15m), refresh rotation w/ reuse detection, JTI & kid; JWKS rotation.
- Rate limits on auth routes; IP/device fingerprinting for anomaly detection (later).
- Secrets via env; support KMS (AWS/GCP/Azure) for key management.
- Logs: structured JSON, PII scrubbing, trace IDs.

---

## Configuration

**Env**
```
APP_URL=https://app.localhost:3000
AUTH_URL=https://auth.localhost:4000
DATABASE_URL=postgres://...
SESSION_STRATEGY=cookie|jwt
JWT_ISSUER=https://auth.localhost:4000
JWT_AUDIENCE=featherauth
ENCRYPTION_KEY=base64:...
COOKIE_NAME=__fa_session
```

**Providers (`providers.json`)**
```
{
  "google": { "clientId": "...", "clientSecret": "...", "enabled": true },
  "github": { "clientId": "...", "clientSecret": "...", "enabled": true },
  "microsoft": { "clientId": "...", "clientSecret": "...", "enabled": false },
  "apple": { "clientId": "...", "teamId":"...", "keyId":"...", "privateKey":"..."}
}
```

---

## React Integration (SDK)

```tsx
// App.tsx
import { FeatherAuthProvider, useSession, SignIn } from "@featherauth/react";

<FeatherAuthProvider baseUrl={import.meta.env.VITE_AUTH_URL}>
  <Routes>
    <Route path="/login" element={<SignIn providers={["google","github"]} />} />
    <Route path="/dashboard" element={<Protected><Dashboard/></Protected>} />
  </Routes>
</FeatherAuthProvider>

// use in components
const { user, status } = useSession(); // 'authenticated' | 'unauthenticated' | 'loading'
```

**Server-side verification (API service):**
```ts
import { createVerifier } from "@featherauth/core";
const verify = createVerifier({ jwksUri: `${AUTH_URL}/.well-known/jwks.json` });
app.use(async (req,res,next) => {
  const claims = await verify(req.headers.authorization || req.cookies.__fa_session);
  req.user = claims?.sub ? { id: claims.sub, email: claims.email } : null;
  next();
});
```

---

## Deployment

**Docker**
- Images: featherauth/server, featherauth/migrate.
- `docker-compose.yml`: Postgres 16 + Auth server + optional Adminer/pgweb.
- Healthchecks, graceful shutdown, liveness/readiness endpoints.

**K8s (later)**
- Helm chart: secrets, HPA, PodDisruptionBudgets, Ingress TLS.
- Separate Job for migrations; PVC or managed PG (RDS, Cloud SQL).

---

## Adapters (DB & Framework)

- DB: `@fa/adapter-postgres` (default), `@fa/adapter-mysql`, `@fa/adapter-sqlite`.
- ORM: Primary Drizzle; optional Prisma adapter.
- Framework: React-agnostic; examples for Vite, CRA, Next.js (App Router).

---

## Observability & Ops

- Metrics: logins, signups, refresh rotations, failures, p95 latency.
- Expose `/metrics` (Prometheus) and `/healthz`.
- Structured logs with request IDs; OpenTelemetry hooks.

---

## Roadmap & Milestones

- **M0 (Week 1–2):** Project scaffolding, Drizzle schema, Google provider, cookie sessions, React SDK useSession.
- **M1 (Week 3–4):** GitHub provider, JWT mode + JWKS, Docker compose, basic `<SignIn/>` UI.
- **M2 (Week 5–6):** Admin CLI, Webhooks, Microsoft/Apple, production hardening (rate limit, CSRF).
- **M3 (Week 7–8):** Docs site, example apps (Vite, Next), DB adapter interface + MySQL/SQLite beta.
- **M4 (v0.2):** Magic link, MFA (TOTP), admin web UI, orgs/roles.

---

## Licensing & Governance

- License: MIT or Apache-2.0.
- CoC: Contributor Covenant.
- Versioning: SemVer; releases via GitHub Actions.
- Security policy: private disclosure email + SLAs; weekly dependency scans.

---

## Documentation Structure

- Quickstart (Docker compose).
- Add a provider in 60 seconds.
- React integration (Vite/Next examples).
- Cookie vs JWT sessions (choose your mode).
- Protecting API routes (Express/Fastify examples).
- DB migration & adapters.
- Webhooks & event types.
- Security checklist (prod).

---

## Acceptance Criteria (MVP)

- `docker compose up` provides a working auth server + Postgres.
- Sign in with Google & GitHub from example React app.
- Session persists across reload; protected route works.
- Webhook fires on first login; admin CLI lists the user.
- Swap to JWT mode with a single env change.

---

## Quickstart

Local quickstart (Docker + example app):

1. Start Postgres + server stub:

```powershell
docker compose up --build
```

2. Run the example Vite app (in a separate shell):

```powershell
cd examples/vite-react
npm install
npm run dev
```

3. Open the example app at http://localhost:3000 and the auth server at http://localhost:4000.

Notes:
- Edit `providers.json` and `.env.example` (copy to `.env`) to configure providers and secrets.
- The server included here is a minimal stub. Replace with the full implementation in `/server/src` when ready.
- All endpoints covered by integration tests (happy path + security).
