import {
  Pencil,
  Trash2,
  ArrowDownLeft,
  ArrowUpRight,
  ChevronLeft,
  ChevronRight,
  Inbox,
} from 'lucide-react'
import { formatCurrency, formatDate } from '@/utils/format'

export default function TransactionTable({
  items,
  total,
  page,
  limit,
  loading,
  currency,
  onEdit,
  onDelete,
  onPageChange,
}) {
  const pageCount = Math.max(1, Math.ceil(total / limit))

  if (loading && items.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="border-b border-border bg-muted/50 px-4 py-3">
          <div className="h-3 w-24 animate-pulse rounded bg-muted" />
        </div>
        <div className="divide-y divide-border">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-4">
              <div className="h-7 w-7 shrink-0 animate-pulse rounded-full bg-muted" />
              <div className="flex-1 space-y-2">
                <div className="h-3 w-1/3 animate-pulse rounded bg-muted" />
                <div className="h-3 w-1/5 animate-pulse rounded bg-muted" />
              </div>
              <div className="h-3 w-16 shrink-0 animate-pulse rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
        <Inbox className="mx-auto h-8 w-8 text-muted-foreground" />
        <p className="mt-3 text-sm font-medium">No transactions</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Try adjusting filters, or add your first transaction.
        </p>
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3 font-medium">Date</th>
              <th className="px-4 py-3 font-medium">Description</th>
              <th className="px-4 py-3 font-medium">Category</th>
              <th className="px-4 py-3 font-medium text-right">Amount</th>
              <th className="px-4 py-3 font-medium w-px" aria-label="Actions" />
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {items.map((t) => {
              const isIncome = t.type === 'income'
              return (
                <tr key={t._id} className="hover:bg-muted/30 transition">
                  <td className="px-4 py-3 whitespace-nowrap text-muted-foreground">
                    {formatDate(t.date)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={`grid h-7 w-7 place-items-center rounded-full ${
                          isIncome ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
                        }`}
                      >
                        {isIncome ? (
                          <ArrowDownLeft className="h-3.5 w-3.5" />
                        ) : (
                          <ArrowUpRight className="h-3.5 w-3.5" />
                        )}
                      </span>
                      <span className="truncate max-w-[28ch]">
                        {t.description || <em className="text-muted-foreground">No description</em>}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full border border-border bg-secondary px-2.5 py-1 text-xs">
                      {t.category}
                    </span>
                  </td>
                  <td
                    className={`px-4 py-3 text-right tabular-nums font-medium ${
                      isIncome ? 'text-success' : 'text-foreground'
                    }`}
                  >
                    {isIncome ? '+' : '−'}
                    {formatCurrency(t.amount, currency)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onEdit?.(t)}
                        className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition hover:bg-accent hover:text-foreground"
                        aria-label={`Edit ${t.description || t.category}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete?.(t)}
                        className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition hover:bg-destructive/10 hover:text-destructive"
                        aria-label={`Delete ${t.description || t.category}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between border-t border-border px-4 py-3 text-xs text-muted-foreground">
        <span>
          {total === 0
            ? '0 transactions'
            : `Showing ${(page - 1) * limit + 1}–${Math.min(page * limit, total)} of ${total}`}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onPageChange?.(page - 1)}
            disabled={page <= 1 || loading}
            className="grid h-8 w-8 place-items-center rounded-lg border border-border bg-secondary transition hover:bg-accent disabled:opacity-40 disabled:hover:bg-secondary"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="tabular-nums">
            Page {page} of {pageCount}
          </span>
          <button
            type="button"
            onClick={() => onPageChange?.(page + 1)}
            disabled={page >= pageCount || loading}
            className="grid h-8 w-8 place-items-center rounded-lg border border-border bg-secondary transition hover:bg-accent disabled:opacity-40 disabled:hover:bg-secondary"
            aria-label="Next page"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
