# Centsible

> Make sense of your spending — a modern personal finance tracker.

Full-stack MERN app for tracking income, expenses, budgets, and visual analytics.

## Tech Stack

**Frontend:** React 18 + Vite, Tailwind CSS, shadcn/ui, Recharts, React Router, React Hook Form + Zod, Sonner
**Backend:** Node.js, Express, MongoDB Atlas, Mongoose, JWT + bcrypt, Resend (email)
**Deploy:** Vercel (frontend) + Render (backend) + MongoDB Atlas

## Project Structure

```
centsible/
├── client/      # React + Vite frontend
└── server/      # Express + Mongoose backend
```

## Run Locally

### Prerequisites
- Node.js 18+
- A MongoDB Atlas cluster (free M0 tier is enough)

### Frontend
```bash
cd client
npm install
npm run dev
```

### Backend
```bash
cd server
cp .env.example .env       # fill in MONGO_URI, JWT_SECRET
npm install
npm run dev
```

## Status

In active development — see `CENTSIBLE_PROJECT_SPEC.md` for the full feature roadmap.
