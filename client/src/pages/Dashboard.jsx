import { LogOut } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export default function Dashboard() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="container flex items-center justify-between py-6">
        <div className="flex items-center gap-2">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary text-primary-foreground font-bold">
            ₵
          </div>
          <span className="font-display text-xl font-bold">Centsible</span>
        </div>
        <button
          onClick={logout}
          className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-2 text-sm hover:bg-accent transition"
        >
          <LogOut className="h-4 w-4" /> Log out
        </button>
      </header>

      <main className="container py-8">
        <h1 className="font-display text-3xl font-bold">
          Welcome, {user?.name?.split(' ')[0] || 'there'} 👋
        </h1>
        <p className="mt-2 text-muted-foreground">
          You're logged in. The real dashboard (4 stat cards + money-flow chart + category donut + recent transactions) gets built on Day 8–9.
        </p>

        <div className="mt-10 rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
          <p className="text-sm text-muted-foreground">Dashboard under construction.</p>
          <p className="mt-2 text-xs text-muted-foreground">
            Logged in as <span className="font-mono">{user?.email}</span>
          </p>
        </div>
      </main>
    </div>
  )
}
