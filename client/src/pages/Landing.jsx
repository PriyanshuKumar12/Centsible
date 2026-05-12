import { Link } from 'react-router-dom'
import { ArrowRight, TrendingUp, PiggyBank, BarChart3 } from 'lucide-react'

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="container flex items-center justify-between py-6">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground font-bold">
            ₵
          </div>
          <span className="font-display text-xl font-bold">Centsible</span>
        </div>
        <nav className="flex items-center gap-3">
          <Link to="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
            Log in
          </Link>
          <Link
            to="/signup"
            className="rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition"
          >
            Get started
          </Link>
        </nav>
      </header>

      <main className="container py-16 md:py-24">
        <section className="mx-auto max-w-3xl text-center">
          <span className="inline-block rounded-full border border-border bg-secondary px-3 py-1 text-xs text-muted-foreground">
            Personal finance, made sensible
          </span>
          <h1 className="mt-6 font-display text-4xl font-extrabold tracking-tight md:text-6xl">
            Make sense of your <span className="text-primary">spending</span>
          </h1>
          <p className="mt-6 text-lg text-muted-foreground">
            Track income and expenses, set monthly budgets, and visualize your financial habits — all in one place.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground hover:opacity-90 transition"
            >
              Start tracking <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              to="/login"
              className="rounded-full border border-border bg-secondary px-6 py-3 font-medium hover:bg-accent transition"
            >
              I already have an account
            </Link>
          </div>
        </section>

        <section className="mx-auto mt-24 grid max-w-5xl gap-6 md:grid-cols-3">
          <FeatureCard
            icon={<TrendingUp className="h-5 w-5" />}
            title="Track everything"
            body="Log income and expenses across 10+ categories. Search, filter, sort — it's all there."
          />
          <FeatureCard
            icon={<PiggyBank className="h-5 w-5" />}
            title="Budget smarter"
            body="Set monthly limits per category. Get an email alert when you hit 80% of your budget."
          />
          <FeatureCard
            icon={<BarChart3 className="h-5 w-5" />}
            title="See the picture"
            body="Visualize trends with monthly bar charts, category donuts, and simple insights."
          />
        </section>
      </main>

      <footer className="container border-t border-border py-8 text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Centsible. Built as a portfolio project.</p>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, body }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="mt-4 font-display text-lg font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{body}</p>
    </div>
  )
}
