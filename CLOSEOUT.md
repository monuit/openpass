# OpenPass — Project Closeout

This document lists recommended steps to close out the repository for now and guidance for future work.

## Quick status
- Core scaffolding (server, SDK, example) implemented.
- Server signs RS256 tokens and exposes JWKS at `/.well-known/jwks.json`.
- Basic auth endpoints implemented with a mock OIDC provider exchange.
- Example Vite app demonstrates the SDK.
- Drizzle schema + initial SQL migration created.

## Recommended immediate steps before final closure
1. Replace provider mocks with real OIDC/OAuth2 exchanges
   - Use `openid-client` to perform code exchange and token validation.
   - Add per-provider config (client_id, client_secret, issuer) in `providers.json` and allow env override.
2. Persist sessions and refresh tokens
   - Use the existing Drizzle schema to store sessions and refresh tokens.
   - Implement rotating refresh tokens and reuse detection to prevent token replay.
3. Secure key persistence and rotation
   - Persist JWKS keys to the database rather than keeping them only in memory.
   - Add a key rotation policy (generate new key, publish to JWKS, deprecate old key after grace period).
4. Tests & CI
   - Add integration tests (vitest + supertest) for auth flows and token rotation.
   - Add unit tests for token helpers and provider adapters.
5. Documentation
   - Add CONTRIBUTING.md, CODE_OF_CONDUCT.md, and a brief SECURITY.md documenting acceptable disclosure and contact.
   - Expand README with architecture diagram and quick start (docker-compose + env examples).
6. Production operational concerns
   - Ensure ENCRYPTION_KEY and secrets are managed by your secrets manager.
   - Configure TLS and cookie settings for production: secure, SameSite, httpOnly.
   - Add observability (Prometheus metrics, structured logs, distributed tracing).

## Files changed in closeout
- `.gitignore` — updated to ignore temporary and build files.
- `CLOSEOUT.md` — this file.

## How to push these changes
If you have push access and a configured remote `origin` pointing to `https://github.com/monuit/openpass.git`, run:

```powershell
# from repository root
git add .gitignore CLOSEOUT.md
git commit -m "chore: add closeout doc and ignore tmp/build files"
git push origin HEAD
```

If you are using SSH remotes or different branch names, adjust the push command accordingly.

If push fails due to authentication, push from your local machine where your GitHub credentials are configured.

## Minimal followups (low effort)
- Add a small `Makefile` or `package.json` script that runs the smoke test (`node ./.tmp/run_and_test.js`) for quick CI checks.
- Add short unit tests for `server/src/tokens/index.ts` to assert signing and verification roundtrip.

---
Last edited: 2025-09-25
