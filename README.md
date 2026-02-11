# BREACHYMBA BLOG (Telegram Mini App)

Industrial SCP-styled Telegram Mini App hub for news, workshop updates, collections, and server monitoring.

## Stack
- Frontend: React + TypeScript + Vite + TailwindCSS + Framer Motion + TanStack Query
- Backend: Node.js + TypeScript + Fastify + Prisma
- DB: Postgres (+ Redis optional)
- Auth: Telegram WebApp initData + JWT + Discord OAuth

## Quick start (Docker Compose)
1) Copy envs
```
cp .env.example apps/api/.env
cp .env.example apps/web/.env
```
2) Set required values in `apps/api/.env`:
- `TELEGRAM_BOT_TOKEN`
- `JWT_SECRET`
- `ADMIN_TELEGRAM_IDS` (comma-separated Telegram user ids)
- Discord values if you want linking

3) Build and run
```
docker compose up --build
```

4) Seed (from host or inside api container):
```
cd apps/api
npm install
npx prisma db seed
```

API runs on `http://localhost:3001` and web on `http://localhost:5173`.

## Local dev (without Docker)
```
cd apps/api
npm install
cp .env.example .env
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

```
cd apps/web
npm install
cp .env.example .env
npm run dev
```

## Scripts
- `apps/api`: `dev`, `build`, `start`, `lint`, `prisma` commands
- `apps/web`: `dev`, `build`, `preview`, `lint`

## Notes
- Workshop/Collection sync runs every 10 minutes if `CRON_ENABLED=true`.
- Server monitoring runs every 2 minutes.
- Auto-posts are editable/hideable in Admin.

## UI kit
Components are in `apps/web/src/components/ui`:
- BreachButton, BreachCard, BreachChip
- BreachTabs, SegmentedControl
- BreachModal, BreachDrawer
- BreachSkeleton
- BreachToast
- BreachEmptyState, BreachErrorState
- StatusDot, DataRow
- MarkdownViewer

## UI system description
Industrial SCP-styled containment UI with tactile micro-interactions, soft shadows, and crisp typography. Dark-first palette uses charcoal surfaces with orange accent for critical actions and AUTO states. Cards lift on hover, buttons spring/scale on press, segmented filters slide with spring easing, and toasts blur+slide. Hazard stripe appears only for pinned/AUTO emphasis.

## Seed data
Seed creates:
- 2 manual news posts
- 2 workshop items
- 1 collection
- 2 servers

## Environment variables
See `.env.example` for full list.
