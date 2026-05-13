import { Link } from 'react-router-dom'
import { ArrowDownLeft, ArrowUpRight, ChevronRight, Inbox } from 'lucide-react'
import { formatCurrency, formatDate } from '@/utils/format'

export default function RecentTransactions({ items, currency }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">Recent transactions</h2>
        <Link
          to="/transactions"
          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          View all <ChevronRight className="h-3 w-3" />
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="mt-4 grid h-40 place-items-center rounded-xl border border-dashed border-border bg-card/50 text-center">
          <div>
            <Inbox className="mx-auto h-6 w-6 text-muted-foreground" />
            <p className="mt-2 text-sm text-muted-foreground">No transactions yet.</p>
          </div>
        </div>
      ) : (
        <ul className="mt-4 divide-y divide-border">
          {items.map((t) => {
            const isIncome = t.type === 'income'
            return (
              <li key={t._id} className="flex items-center gap-3 py-3">
                <span
                  className={`grid h-9 w-9 place-items-center rounded-full shrink-0 ${
                    isIncome ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
                  }`}
                >
                  {isIncome ? (
                    <ArrowDownLeft className="h-4 w-4" />
                  ) : (
                    <ArrowUpRight className="h-4 w-4" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm truncate">
                    {t.description || <em className="text-muted-foreground">No description</em>}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t.category} · {formatDate(t.date)}
                  </p>
                </div>
                <p
                  className={`text-sm font-medium tabular-nums shrink-0 ${
                    isIncome ? 'text-success' : 'text-foreground'
                  }`}
                >
                  {isIncome ? '+' : '−'}
                  {formatCurrency(t.amount, currency)}
                </p>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
