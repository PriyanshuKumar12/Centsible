# Centsible

> Make sense of your spending — a modern personal finance tracker.

A full-stack **MERN** application for tracking income and expenses, setting category budgets with email alerts, and visualising where your money goes.

**Live demo:** **[centsible-five.vercel.app](https://centsible-five.vercel.app)** · API → [centsible-api.onrender.com](https://centsible-api.onrender.com/api/health)

### 🔑 Demo account

```
Email:    demo@centsible.app
Password: Demo@123
```

Pre-seeded with ~30 realistic transactions across the last 6 months.

---

## Features

- **Authentication** — JWT auth with bcrypt-hashed passwords, protected routes
- **Transactions** — full CRUD, filtering (type / category / date range / search), pagination, **CSV export** (RFC-4180)
- **Budgets** — per-category monthly budgets with progress bars and **email alerts** at ≥80% (Resend)
- **Dashboard** — balance / income / savings / expense cards, 6-month money-flow bar chart, category donut, recent activity
- **Analytics** — month-over-month spending insight + reusable charts
- **Settings** — update profile, change password, currency switcher (₹ / $ / €), light/dark theme, delete account (cascades data)
- **UX** — dark-first theme, fully responsive with a mobile nav drawer, loading skeletons, empty states, toasts, page-transition animations (reduced-motion aware)

## Tech Stack

| | |
|---|---|
| **Frontend** | React 19, Vite 8, Tailwind CSS, React Router 7, React Hook Form + Zod, Recharts, Sonner, lucide-react |
| **Backend** | Node.js, Express 5, MongoDB Atlas, Mongoose 9, JWT, bcryptjs, Zod, Resend |
| **Deploy** | Vercel (frontend) · Render (backend) · MongoDB Atlas · cron-job.org (keep-alive) |

## Project Structure

```
centsible/
├── client/      # React + Vite frontend
├── server/      # Express + Mongoose backend
├── scripts/     # dev tooling (free-port helper)
├── render.yaml  # backend Infrastructure-as-Code blueprint
└── DEPLOYMENT.md # step-by-step deploy guide
```

## Run Locally

**Prerequisites:** Node.js 18+ and a MongoDB Atlas cluster (free M0 tier is enough).

### Backend

```bash
cd server
cp .env.example .env          # fill in MONGO_URI and JWT_SECRET (others optional)
npm install
npm run seed                  # optional: create the demo account + sample data
npm run dev                   # http://localhost:5000
```

### Frontend

```bash
cd client
npm install
npm run dev                   # http://localhost:5173
```

The frontend proxies to `http://localhost:5000/api` by default; override with `VITE_API_URL`
(see `client/.env.example`).

## Environment Variables

| Scope | Key | Notes |
|---|---|---|
| server | `MONGO_URI` | MongoDB Atlas connection string (required) |
| server | `JWT_SECRET` | JWT signing secret (required) |
| server | `CLIENT_URL` | Allowed CORS origin (your Vercel URL in prod) |
| server | `RESEND_API_KEY` | Optional — budget-alert emails; safe no-op if unset |
| server | `PORT` / `NODE_ENV` | Render sets `PORT`; use `NODE_ENV=production` in prod |
| client | `VITE_API_URL` | Deployed API base, e.g. `https://<app>.onrender.com/api` |

Full annotated templates: `server/.env.example`, `client/.env.example`.

## Deployment

See **[`DEPLOYMENT.md`](./DEPLOYMENT.md)** for the full step-by-step guide (Vercel + Render + Atlas + keep-alive).

## Screenshots

_Add screenshots/GIF here after deploy — Dashboard, Transactions, Budgets, Analytics, Settings (light + dark)._

## License

MIT
