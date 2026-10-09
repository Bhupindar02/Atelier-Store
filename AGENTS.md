<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

## Project: Atelier Store

Next.js 16.4 eCommerce foundation. **This is a foundation-only setup — no e-commerce features, auth UI, payments, or schemas beyond Better Auth's own tables have been built yet.**

### Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | Next.js (App Router, `src/`) | 16.4.0 |
| Language | TypeScript | ^5 |
| Styling | Tailwind CSS | ^4 |
| Auth | Better Auth (Drizzle adapter) | ^1.7.7 |
| ORM | Drizzle ORM | ^0.45.4 |
| Database | Neon Postgres (`@neondatabase/serverless`) | ^1.2.0 |
| Migrations | Drizzle Kit | ^0.31.11 |

---

## Critical Conventions — Read Before Writing Code

### 1. Caching model (`cacheComponents: true`)

`cacheComponents` and `partialPrefetching` are **both enabled** in `next.config.ts` (Next.js 16 defaults). This changes how rendering works:

- Data fetching is **dynamic by default**. Use `use cache` to opt into caching at the component or function level.
- Session reads (`cookies()`, `headers()`) **cannot be prerendered**. Auth-gated UI must stream in behind a `<Suspense>` boundary.
- Use `use cache: private` for browser-only session caching (never cached on the server).
- Before writing any cached or auth-related server code, read: `node_modules/next/dist/docs/01-app/02-guides/authentication-with-cache-components.md`

### 2. Route Handlers

- Route handlers live in `src/app/api/**/route.ts`.
- Export named HTTP methods: `GET`, `POST`, `PUT`, `PATCH`, `DELETE`.
- Route handlers are **not cached by default**. Add `export const dynamic = 'force-static'` only for fully static GET handlers.
- A `route.ts` and `page.tsx` **cannot exist at the same route segment** — place API routes under `src/app/api/`.
- Type dynamic params with the global `RouteContext` helper: `ctx: RouteContext<'/path/[id]'>`.

### 3. Database

- DB client is at `src/db/index.ts` — import `{ db }` from `@/db`.
- Drizzle schema files live in `src/db/schema/`. Export all tables from `src/db/schema/index.ts`.
- Run `npm run db:push` for schema changes in development. Use `db:generate` + `db:migrate` in production workflows.
- `DATABASE_URL` **must** be set before any server code that touches `db` runs — missing it throws at module load time.

#### Agreed Database Scope & Schema Decisions:
- **Scope Limit**: First database phase is strictly scoped to **`products`**, **`categories`**, and **`stocks`**. Do NOT add carts, orders, payments, reviews, wishlists, or product variants yet.
- **Relationships**:
  - `categories` (1) ──< (N) `products`
  - `products` (1) ── (1) `stocks` (1:1 inventory record referencing `products.id` with `onDelete: 'cascade'`)
- **Key Tables**:
  - `categories`: `id` (PK, text slug e.g. `'handbags'`), `name`, `slug` (unique), `description`, `displayOrder`, `createdAt`.
  - `products`: `id` (PK, text slug e.g. `'atelier-valmont-tote'`), `categoryId` (FK -> `categories.id`), `sku` (unique), `name`, `price`, `material`, `color`, `badge`, `primaryImage`, `secondaryImage`, `gallery` (jsonb), `description`, `origin`, `savoirFaireStory`, `details` (jsonb), `sizes` (jsonb), `careInstructions` (jsonb), `isSpotlight` (boolean default false), timestamps.
  - `stocks`: `id` (PK), `productId` (FK unique -> `products.id`), `status` (`'in_stock' | 'low_stock' | 'made_to_order' | 'out_of_stock'`), `quantity`, `label`, `description`, `updatedAt`.
- **Query & Fallback Convention**:
  - Query functions live in `src/db/queries/products.ts` to isolate SQL queries from UI components.
  - Query layer must provide a safe fallback to static data if `DATABASE_URL` is unconfigured/unreachable to prevent build breakage.

### 4. Auth

- **Server**: import `{ auth }` from `@/lib/auth` — only in Server Components, Route Handlers, and Server Actions.
- **Client**: import `{ authClient, useSession, signIn, signUp, signOut }` from `@/lib/auth-client` — only in Client Components (`"use client"`).
- All Better Auth HTTP traffic is handled by `src/app/api/auth/[...all]/route.ts`. Do not create additional auth route files.
- Session reads are request-time — never prerendered. Always use `<Suspense>` when showing session-dependent UI.

### 5. Middleware

- `src/middleware.ts` is a pass-through stub. Add auth session checks and redirects here.
- The `matcher` in `config` already skips `_next` internals and static assets.

### 6. Environment variables

- Server-only vars: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`.
- Client-exposed vars (inlined at build time): `NEXT_PUBLIC_APP_URL`.
- For tool configs outside Next.js (e.g. `drizzle.config.ts`), load env with `loadEnvConfig` from `@next/env`.
- Copy `.env.example` → `.env.local` to get started. Never commit `.env.local`.

---

## Project Structure

```
src/
├── middleware.ts                   # Auth guard placeholder — add session checks here
├── types/
│   └── index.ts                   # Shared type exports (Session, User, etc.)
├── app/
│   ├── globals.css                # Tailwind CSS v4 + theme tokens
│   ├── layout.tsx                 # Root layout (fonts, metadata)
│   ├── page.tsx                   # Foundation status page
│   └── api/
│       └── auth/
│           └── [...all]/
│               └── route.ts       # Better Auth — handles all /api/auth/* requests
├── db/
│   ├── index.ts                   # Drizzle client (throws if DATABASE_URL missing)
│   ├── queries/                   # Data access functions (products, etc.)
│   └── schema/
│       ├── auth.ts                # Better Auth tables: user, session, account, verification
│       ├── products.ts            # E-commerce tables: categories, products, stocks
│       └── index.ts               # Re-exports all schemas — import from here
└── lib/
    ├── auth.ts                    # Better Auth server instance + Drizzle adapter
    └── auth-client.ts             # Better Auth React client
```

---

## Setup (for new environments)

```bash
# 1. Install deps
npm install

# 2. Configure env
cp .env.example .env.local
# Fill in DATABASE_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL, NEXT_PUBLIC_APP_URL

# 3. Push schema to Neon
npm run db:push

# 4. Start dev server
npm run dev

# 5. Verify auth is responding
# GET http://localhost:3000/api/auth/get-session → { "session": null }
```

## Available Scripts

| Script | Description |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run db:generate` | Generate migration SQL |
| `npm run db:migrate` | Apply migrations |
| `npm run db:push` | Push schema directly (dev) |
| `npm run db:studio` | Open Drizzle Studio |
