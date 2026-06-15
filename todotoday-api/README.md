# TodoToday API

Express + TypeScript + Prisma (PostgreSQL) backend for the TodoToday app.

## Local development

1. Copy `.env.example` to `.env` and fill in `DATABASE_URL` and `JWT_SECRET`.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run migrations:
   ```bash
   npx prisma migrate dev
   ```
4. Start the dev server:
   ```bash
   npm run dev
   ```

API runs on `http://localhost:4000` by default.

## Endpoints

### Auth
- `POST /auth/register` — `{ email, password, name }` → `{ token, user }`
- `POST /auth/login` — `{ email, password }` → `{ token, user }`
- `GET /auth/me` — requires `Authorization: Bearer <token>` → `{ user }`
- `PATCH /auth/me` — `{ name }` → `{ user }`

### Todos (all require `Authorization: Bearer <token>`)
- `GET /todos?date=YYYY-MM-DD` — todos for a specific date
- `GET /todos?from=YYYY-MM-DD&to=YYYY-MM-DD` — todos in a date range
- `GET /todos?backlog=true` — todos with no date set (the "Someday" pool)
- `GET /todos` — all todos for the user
- `GET /todos/:id` — single todo
- `POST /todos` — create. Body: `{ description, date?, color?, urgency?, status? }`
  - `date` is optional — omit or set to `null` to add to the Someday backlog (no date)
  - `color` is optional — a random color is assigned if omitted
  - `urgency` defaults to `low` (`low` | `moderate` | `high`)
  - `status` defaults to `not_started` (`not_started` | `in_progress` | `done`)
- `PATCH /todos/:id` — update any of the above fields. Set `date: null` to move a todo back to the backlog.
- `DELETE /todos/:id` — delete a todo
- `GET /todos/calendar/:year/:month` — returns `{ summary: { "YYYY-MM-DD": [{ color, status }] } }` for monthly calendar dots (backlog todos are not included)

## Deploying with Coolify (Nixpacks)

1. Push this repo to GitHub (`todotoday-api`).
2. In Coolify, create a new **Resource → Database → PostgreSQL** named `todotoday-db` (note the internal connection string Coolify provides).
3. Create a new **Resource → Application** from your `todotoday-api` GitHub repo.
   - Build pack: **Nixpacks** (default — it will pick up `nixpacks.toml` in this repo)
   - Port: `4000`
4. Add environment variables in Coolify:
   - `DATABASE_URL` — the connection string from your `todotoday-db` (use the internal hostname Coolify gives the Postgres service, e.g. `postgresql://user:pass@todotoday-db:5432/todotoday`)
   - `JWT_SECRET` — a long random string
   - `JWT_EXPIRES_IN` — e.g. `30d`
   - `CORS_ORIGIN` — `*` (or your app's domain once published)
   - `NODE_ENV` — `production`
   - `PORT` — `4000`
5. Deploy. `nixpacks.toml` generates the Prisma client and builds the TypeScript during the build phase, then the start command runs `prisma migrate deploy` before launching the server — so your `todotoday-db` schema is created/updated on every deploy.
6. Set up a domain in Coolify for this app (e.g. `api.yourdomain.com`) — Coolify + Traefik handle HTTPS automatically.
7. Use this public URL as the `API_URL` in the mobile app's config.

> A `Dockerfile` is also included as a fallback if you ever want to switch this app's build pack to Dockerfile instead of Nixpacks — it's not used by Nixpacks deployments.
