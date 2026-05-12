import { Link } from 'react-router-dom'

export default function Login() {
  return (
    <div className="min-h-screen grid place-items-center bg-background text-foreground">
      <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8">
        <h1 className="font-display text-2xl font-bold">Welcome back</h1>
        <p className="mt-1 text-sm text-muted-foreground">Log in to continue to your dashboard.</p>
        <p className="mt-6 text-sm text-muted-foreground">
          Form coming on Day 3–4 (auth phase). For now, this is just a placeholder.
        </p>
        <Link
          to="/"
          className="mt-6 inline-block text-sm text-primary hover:underline"
        >
          ← Back home
        </Link>
      </div>
    </div>
  )
}
