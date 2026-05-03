# MedStock AI

AI-powered hospital supply chain intelligence B2B SaaS platform.

## Architecture

- **Frontend**: React + Vite (`artifacts/medstock-ai`), served at `/`
- **API**: Express 5 backend (`artifacts/api-server`), served at `/api`
- **Database**: PostgreSQL via Drizzle ORM (`lib/db`)
- **API Contract**: OpenAPI spec in `lib/api-spec/openapi.yaml`
- **Client Hooks**: Orval-generated React Query hooks in `lib/api-client-react`
- **Validation**: Orval-generated Zod schemas in `lib/api-zod`

## Stack

- React + Vite + TypeScript frontend
- Express 5 backend with pino logging
- PostgreSQL + Drizzle ORM
- TanStack React Query for data fetching
- Recharts for visualizations
- shadcn/ui + Tailwind CSS components
- Wouter for client-side routing
- Orval for API code generation (hooks + Zod schemas)

## Features (4 MVP Modules)

1. **Dashboard** – KPI command center: critical items, expiry risk, wastage trend chart, alerts feed, system health
2. **Inventory** – Real-time SKU table with CRITICAL/LOW/ADEQUATE status badges, stock update modal (receipt/consumption/adjustment), search + filter by department/status
3. **AI Forecasting** – 30/60/90-day demand predictions with confidence intervals, projected stockout dates, manual override capability, trigger model runs
4. **Expiry & Wastage** – Near-expiry tracking with financial loss estimates, AI redistribution suggestions, wastage reports with department breakdown
5. **Alerts** – System alerts feed with severity levels (critical/warning/info), resolve-in-place workflow, filter by type/severity
6. **Crisis Coordination** – Network surplus listings + critical shortage requests, AI matching between hospitals (96%+ match scores), crisis mode toggle

## Database Schema

- `hospitals` – facility registry with crisis mode flags
- `departments` – hospital departments
- `skus` – stock-keeping units (medicines, supplies)
- `stock_movements` – consumption/receipt/adjustment history
- `expiry_batches` – batch-level expiry tracking
- `forecasts` – AI demand predictions (30/60/90 day horizons)
- `alerts` – system-generated alerts
- `surplus_listings` – network surplus available for transfer
- `crisis_requests` – critical shortage requests from hospitals

## API Routes

All routes are mounted under `/api`:
- `GET/POST /api/dashboard/summary|stock-by-status|alerts-feed|wastage-trend`
- `GET/POST/PUT/DELETE /api/skus` + `/api/skus/:id/movement-history`
- `GET /api/inventory` + `POST /api/inventory/update-stock`
- `GET/POST /api/forecasts` + `POST /api/forecasts/run` + `/api/forecasts/:skuId/override`
- `GET /api/expiry/items|wastage-report|redistribution-suggestions` + `POST /api/expiry/mark-resolved`
- `GET/POST /api/alerts` + `POST /api/alerts/:id/resolve`
- `GET/POST /api/crisis/surplus-listings|requests|matches|mode`
- `GET /api/departments|hospitals`

## Key Implementation Notes

- `MY_HOSPITAL_ID = 1` (Apollo Hospital Bangalore) is the current facility in crisis.ts
- Forecast horizon Zod schema uses `zod.literal(30|60|90)` — backend must coerce query param strings to numbers before schema parse
- Orval generates `useListForecasts(params, options)` — params is the FIRST positional arg, not inside the options object
- `lib/api-zod/src/index.ts` exports only from `./generated/api` (Orval regenerates the barrel)
- DB push command: `pnpm --filter @workspace/db run push`
- Codegen command: `pnpm --filter @workspace/api-spec run codegen`
