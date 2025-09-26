# OpenPass Deployment Guide

This guide helps you deploy OpenPass using Docker Compose for local development or production.

---

## Prerequisites
- Docker & Docker Compose installed
- (Optional) Adminer or pgweb for DB inspection

---

## Quickstart (Local)

1. **Clone the repo:**
   ```sh
   git clone https://github.com/your-org/openpass.git
   cd openpass
   ```
2. **Configure environment:**
   - Copy `.env.example` to `.env` and fill in values:
     ```env
     APP_URL=http://localhost:3000
     AUTH_URL=http://localhost:4000
     DATABASE_URL=postgres://openpass:password@db:5432/openpass
     SESSION_STRATEGY=cookie
     JWT_ISSUER=http://localhost:4000
     JWT_AUDIENCE=featherauth
     ENCRYPTION_KEY=base64:...
     COOKIE_NAME=__fa_session
     ```
   - Edit `providers.json` to enable providers and add credentials.

3. **Start services:**
   ```sh
   docker compose up --build
   ```
   - This starts Postgres, the auth server, and Adminer/pgweb (optional).

4. **Access services:**
   - Auth server: `http://localhost:4000`
   - Example React app: `http://localhost:3000`
   - Adminer: `http://localhost:8080` (if enabled)

---

## Environment Variables

| Variable         | Description                          |
|------------------|--------------------------------------|
| APP_URL          | Public URL of your React app         |
| AUTH_URL         | Public URL of auth server            |
| DATABASE_URL     | Postgres connection string           |
| SESSION_STRATEGY | `cookie` or `jwt`                    |
| JWT_ISSUER       | JWT issuer URL                       |
| JWT_AUDIENCE     | JWT audience claim                   |
| ENCRYPTION_KEY   | Base64-encoded key for secrets       |
| COOKIE_NAME      | Name of session cookie               |

---

## Customization
- **Providers:** Edit `providers.json` to enable/disable and add credentials for Google, GitHub, etc.
- **DB Adapters:** Default is Postgres; swap adapter for MySQL/SQLite as needed.
- **Session Strategy:** Change `SESSION_STRATEGY` to `jwt` for JWT mode.

---

## Production Notes
- Use HTTPS for all endpoints.
- Set strong secrets and rotate keys regularly.
- Use managed Postgres (RDS, Cloud SQL) for reliability.
- Configure healthchecks and liveness/readiness endpoints for orchestration.
- For Kubernetes, use provided Helm chart (coming soon).

---

## Troubleshooting
- Check logs for errors (`docker compose logs`)
- Ensure all env vars are set and correct
- Verify provider credentials and callback URLs

---

## Useful Commands
- List users: `docker compose exec server featherauth user list`
- Migrate DB: `docker compose exec server featherauth db migrate`
- Add provider: `docker compose exec server featherauth provider add`

---

## More
- See [README.md](./README.md) for full feature set, API, and architecture.
- For advanced deployment, see `/docs` (coming soon).
