# Atelier Store

A Next.js 16 eCommerce foundation using TypeScript, Tailwind CSS v4, Better Auth, Drizzle ORM, and Neon Postgres.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16.4 (App Router, `src/`) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS v4 |
| Authentication | Better Auth 1.7 (Drizzle adapter) |
| ORM | Drizzle ORM |
| Database | Neon Postgres (serverless HTTP driver) |

---

## Prerequisites

- Node.js 18+
- A [Neon](https://neon.tech) project (free tier works)

---

## Getting Started

### 1. Clone and install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy the example env file and fill in your values:

```bash
cp .env.example .env.local
```

| Variable | Description |
|---|---|
| `DATABASE_URL` | Neon connection string (`postgresql://...?sslmode=require`) |
| `BETTER_AUTH_SECRET` | Random secret (32+ chars) — run `openssl rand -base64 32` |
| `BETTER_AUTH_URL` | Base URL of the app (e.g. `http://localhost:3000`) |
| `NEXT_PUBLIC_APP_URL` | Same as above, exposed to the client |

### 3. Push the database schema

```bash
npm run db:push
```

This applies the Better Auth tables (`user`, `session`, `account`, `verification`) to your Neon database.

### 4. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Confirm Better Auth is responding at [http://localhost:3000/api/auth/get-session](http://localhost:3000/api/auth/get-session) — it should return `{"session":null}`.

---

## Project Structure

```
atelier-store/
├── .env.example                        # Environment variables template
├── drizzle.config.ts                   # Drizzle Kit config (reads env via @next/env)
├── next.config.ts                      # Next.js config (cacheComponents + Tailwind turbopack)
├── tsconfig.json                       # TypeScript config (@/* alias → src/)
│
└── src/
    ├── middleware.ts                   # Pass-through placeholder (add auth guards here)
    │
    ├── types/
    │   └── index.ts                   # Shared type exports (Session, User, etc.)
    │
    ├── app/
    │   ├── globals.css                # Tailwind CSS v4 @import + theme tokens
    │   ├── layout.tsx                 # Root layout (Geist fonts, metadata)
    │   ├── page.tsx                   # Foundation status page
    │   └── api/
    │       └── auth/
    │           └── [...all]/
    │               └── route.ts       # Better Auth route handler (all HTTP verbs)
    │
    ├── db/
    │   ├── index.ts                   # Drizzle ORM client (Neon HTTP driver)
    │   └── schema/
    │       ├── auth.ts                # Better Auth PostgreSQL tables
    │       └── index.ts               # Schema barrel export
    │
    └── lib/
        ├── auth.ts                    # Better Auth server instance (+ Drizzle adapter)
        └── auth-client.ts             # Better Auth React client (useSession, signIn, etc.)
```

---

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm run start` | Start the production server |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Generate Drizzle migration SQL files |
| `npm run db:migrate` | Apply pending migration files |
| `npm run db:push` | Push schema directly to Neon (no migration files) |
| `npm run db:studio` | Open Drizzle Studio in the browser |

---

## Key Architecture Notes

### Caching model
`cacheComponents: true` is enabled (Next.js 16 default). Session reads via `cookies()` are request-time operations — they **cannot** be prerendered. Auth-gated UI must stream in behind a `<Suspense>` boundary. See the [Next.js auth with Cache Components guide](https://nextjs.org/docs/app/guides/authentication-with-cache-components).

### Auth endpoints
Better Auth mounts all routes under `/api/auth/*`. The catch-all handler at `src/app/api/auth/[...all]/route.ts` exports GET, POST, PATCH, PUT, and DELETE to cover all required HTTP methods.

### Database client
`src/db/index.ts` uses `drizzle-orm/neon-http` with Neon's serverless HTTP driver — no persistent WebSocket connection required, making it suitable for edge-compatible routes if needed in future.

### Middleware
`src/middleware.ts` is a pass-through stub. Auth session checks and redirect logic should be added here when building protected routes.

### Adding schemas
Add new Drizzle table definitions to `src/db/schema/` and export them from `src/db/schema/index.ts`. Run `npm run db:push` (dev) or `npm run db:generate && npm run db:migrate` (production workflow).
