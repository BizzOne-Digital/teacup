# Tea Cup Cafe — Online Ordering

Single Next.js app (no separate backend folder): hero + category menu + cart + checkout, MongoDB Atlas orders, and `/admin` for paid-order alerts.

Design is inspired by [ONO Poké Bar](https://onopokebar.onlineorders.store/). Menu items are imported from [Tea Cup Cafe online ordering](https://teacupcafe.onlineordering.io/en) (20 categories, 224 items in `data/menu.json`).

## Setup

1. Edit `.env.local`: set `MONGODB_URI`, and admin `ADMIN_EMAIL` / `ADMIN_PASSWORD` (defaults: `admin@teacupcafe.com` / `admin@123`).
2. Optional: add Stripe keys for card checkout; without Stripe, checkout uses **demo pay** (marks order paid in DB).
3. Place your notification audio at **`public/notification.mp3`** (admin plays it when a new paid order appears).
4. Install and run:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — admin at [http://localhost:3000/admin](http://localhost:3000/admin).

## Refresh menu from source site

```bash
npm run scrape-menu
```

## Stripe webhook (production)

Point Stripe webhook to `POST /api/webhooks/stripe` with event `checkout.session.completed`.

## Production

1. Set all variables in `.env.local` (or your host’s env UI) — **required:**
   - `MONGODB_URI` — real Atlas connection string
   - `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`
   - `NEXT_PUBLIC_APP_URL` — public site URL (e.g. `https://your-domain.com`)
2. Optional: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` for live card payments.
3. Build and run locally:

```bash
npm run build
npm start
```

4. **Vercel / Node host:** connect repo, set the same env vars, deploy. Use `npm run build` as build command and `npm start` (or the platform default for Next.js).

5. **MongoDB Atlas:** allow network access from your host (or `0.0.0.0/0` for serverless).

6. After deploy, run `npm run seed` once (with production `MONGODB_URI` in env) to store menu snapshot in DB.

7. Add `public/notification.mp3` for admin order alerts.
