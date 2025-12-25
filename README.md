# Boilerplate — Run with Docker Compose

This document explains how to start the database using Docker Compose, run Prisma migrations, seed the database and run the NestJS app.

> Tested workflow (development): start Postgres + pgAdmin with Docker Compose, run migrations & seed from the host (uses `dotenv -e .env.development`) and start the app in local dev mode.

---

## Prerequisites

- Docker & Docker Compose installed
- Node.js (for running `npm` scripts) — required when running migrations & seeding from host
- `git` to clone the repo

Files used:
- `docker/docker-compose.yml` (provides `postgres` + `pgadmin` services)
- `package.json` scripts:
  - `npm run migrate:dev` → merges Prisma models and runs `prisma migrate dev` using `.env.development`
  - `npm run prisma:seed:dev` → runs the TypeScript seed script using `.env.development`

The repository contains `.env.development` which configures `DATABASE_URL` for local development:

```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/app_dev
```

This configuration expects Postgres to be reachable at `localhost:5432` (the default mapping used by the included `docker-compose.yml`).

---

## 1) Start database (Postgres + pgAdmin)

From project root:

```bash
docker compose up -d postgres pgadmin
```

Check logs:

```bash
docker compose logs -f postgres
```

Open pgAdmin at: http://localhost:5050 (default user: `admin@example.com`, password `admin` — see `docker/docker-compose.yml`).

---

## 2) Run migrations and seed (recommended / simple) — from host

This uses the npm scripts which load `.env.development` and run Prisma commands.

Install dependencies (first time):

```bash
npm ci
```

Run migrations (development):

```bash
npm run migrate:dev
```

Run seed script (development):

```bash
npm run prisma:seed:dev
```

After these commands, the database will be migrated and initial seed data inserted.

---

## 3) Run the app (development)

Start in watch/dev mode (run locally):

```bash
npm run start:dev
```

The API will be available at: http://localhost:3000
Swagger UI (dev only): http://localhost:3000/docs

---

## Alternative: Run migrations & seed inside a container (one-off)

If you prefer running migrations from inside a container (no Node on host), you can run a one-off Node container with the project mounted. Example (Linux/macOS):

```bash
# run migrations inside node container (attach current dir as /app)
docker run --rm -v "$(pwd)":/app -w /app node:18 bash -lc "npm ci && npm run migrate:dev"

# run seeding
docker run --rm -v "$(pwd)":/app -w /app node:18 bash -lc "npm ci && npm run prisma:seed:dev"
```

Windows (PowerShell) equivalent:

```powershell
docker run --rm -v ${PWD}:/app -w /app node:18 bash -lc "npm ci && npm run migrate:dev"
```

Note: when running inside a container, `DATABASE_URL` should point to the Docker network hostname `postgres` instead of `localhost`. Example environment override:

```bash
docker run --rm -e DATABASE_URL="postgresql://postgres:postgres@postgres:5432/app_dev" -v "$(pwd)":/app -w /app node:18 bash -lc "npm ci && npm run migrate:dev"
```

---

## Optional: Run the API as a Docker service

`docker/docker-compose.yml` contains a commented-out `api` service. To run the API in Docker:

1. Uncomment or add an `api` service in `docker-compose.yml` that builds the repo and sets `env_file: ../.env.development` and depends on `postgres`.
2. Build & start:

```bash
docker compose up -d --build api
```

3. The container will expose the configured port (the compose file example maps `3000:3000`).

Important: when running the API as a Docker service, ensure `DATABASE_URL` points to `postgres://...@postgres:5432/...` (service name as host).

---

## Troubleshooting

- `prisma migrate dev` fails with connection errors: ensure `postgres` container is running (`docker compose ps`) and `.env.development` points to the correct host/port.
- If you run migrations from inside a container, set `DATABASE_URL` to use the Docker service hostname `postgres`.
- If you have existing migrations and Prisma reports conflicts, inspect `prisma/migrations` and resolve as needed.

---

If you'd like, I can:

- Add a ready-to-use `api` service to `docker/docker-compose.yml` and an accompanying `Dockerfile` example (so you can run the entire stack with one `docker compose up -d`), or
- Add GitHub Actions workflow to run migrations on deploy.

Let me know which you'd prefer and I will add it to the repository.