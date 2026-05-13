import { useAuth } from '@/context/AuthContext'

export default function Dashboard() {
  const { user } = useAuth()

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">
        Welcome, {user?.name?.split(' ')[0] || 'there'} 👋
      </h1>
      <p className="mt-2 text-muted-foreground">
        The real dashboard (4 stat cards + money-flow chart + category donut + recent
        transactions) gets built on Day 8–9.
      </p>

      <div className="mt-10 rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
        <p className="text-sm text-muted-foreground">Dashboard under construction.</p>
        <p className="mt-2 text-xs text-muted-foreground">
          Logged in as <span className="font-mono">{user?.email}</span>
        </p>
      </div>
    </div>
  )
}
