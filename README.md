# SimpleInvoice

React + TypeScript frontend (Vite, Tailwind) and a NestJS + TypeScript API, with PostgreSQL via Prisma. One repo: `frontend/` and `backend/`. JWT is returned on login, stored in `localStorage`, and sent as `Authorization: Bearer`.

## Run with Docker

```bash
docker compose up
```

No other setup. Migrations and seed run on backend start.

- UI: http://localhost:3000
- API: http://localhost:3001
- Swagger: http://localhost:3001/api/docs
- Database: localhost:5432 (`simple_invoice` / `postgres` / `postgres`)

## Run without Docker

1. `cd backend && npm install && cp .env.example .env`
2. `npx prisma migrate dev && npm run seed`
3. `npm run start:dev`
4. `cd frontend && npm install && cp .env.example .env && npm run dev`

Postgres must already be running on port 5432 with the URL in `backend/.env.example`.

## Login

`reviewer@101digital.io` / `changeme` (seeded — see `backend/prisma/seed.ts`)

## Seed

`npm run seed` from `backend/` (or `npm run seed` from the repo root). Inserts the Appendix A invoice plus extra records for search, filter, sort, and paging.

## Tests

- Backend: `cd backend && npm run test` / `npm run test:e2e`
- Frontend: `cd frontend && npm run test`

## Assumptions

- Customer fields are stored on the invoice, not a separate table
- Overdue is derived on read and never stored
- Dates are UTC calendar days (`YYYY-MM-DD`)
- Money is rounded half-up to 2 decimal places
- List date range matches invoices whose **invoice date and due date** both fall in range
- The UI creates one line item; the schema allows many
- Appendix A `type` and `invoiceGrossTotal` are ignored
- JWT uses the `Authorization: Bearer` header, not cookies
- Currencies are AUD, USD, and GBP
- Discount cannot exceed subtotal + tax

## Known limitations

- No invoice edit or delete
- No multi-item create UI
- No MFA or password-complexity rules
