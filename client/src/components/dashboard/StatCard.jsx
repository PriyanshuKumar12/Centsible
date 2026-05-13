import { formatCurrency } from '@/utils/format'

export default function StatCard({ icon: Icon, label, amount, currency, tone = 'primary', loading }) {
  const tones = {
    primary: 'bg-primary/10 text-primary',
    success: 'bg-success/10 text-success',
    danger: 'bg-danger/10 text-danger',
    info: 'bg-info/10 text-info',
  }
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center gap-3">
        <span className={`grid h-10 w-10 place-items-center rounded-full ${tones[tone] || tones.primary}`}>
          <Icon className="h-5 w-5" />
        </span>
        <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {label}
        </span>
      </div>
      <div className="mt-4">
        {loading ? (
          <div className="h-8 w-32 animate-pulse rounded bg-muted" />
        ) : (
          <p className="font-display text-2xl font-bold tabular-nums">
            {formatCurrency(amount, currency)}
          </p>
        )}
      </div>
    </div>
  )
}
