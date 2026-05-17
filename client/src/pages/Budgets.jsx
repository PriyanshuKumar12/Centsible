import { useCallback, useEffect, useState } from 'react'
import { Plus, Pencil, Trash2, Target } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'
import { listBudgets, deleteBudget } from '@/api/budgets'
import { formatCurrency } from '@/utils/format'
import BudgetFormModal from '@/components/budgets/BudgetFormModal'
import ConfirmDialog from '@/components/shared/ConfirmDialog'

function monthLabel(year, month) {
  if (!year || !month) return ''
  return new Date(Date.UTC(year, month - 1, 1)).toLocaleString('en-US', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

// Spec §4: green on track, amber at ≥80%, red when exceeded.
function barState(spent, limit) {
  if (limit <= 0) return { color: '#94A3B8', label: 'No limit', tone: 'text-muted-foreground' }
  const pct = (spent / limit) * 100
  if (spent > limit) return { color: '#EF4444', label: 'Over budget', tone: 'text-destructive' }
  if (pct >= 80) return { color: '#F59E0B', label: 'Near limit', tone: 'text-[#F59E0B]' }
  return { color: '#10B981', label: 'On track', tone: 'text-primary' }
}

export default function Budgets() {
  const { user } = useAuth()
  const currency = user?.currency || 'INR'

  const [data, setData] = useState({ items: [], month: null, year: null })
  const [loading, setLoading] = useState(true)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)

  const fetchBudgets = useCallback(async () => {
    setLoading(true)
    try {
      const res = await listBudgets()
      setData(res)
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to load budgets'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBudgets()
  }, [fetchBudgets])

  const openAdd = () => {
    setEditing(null)
    setFormOpen(true)
  }
  const openEdit = (b) => {
    setEditing(b)
    setFormOpen(true)
  }

  const confirmDelete = async () => {
    if (!deleting) return
    try {
      await deleteBudget(deleting._id)
      toast.success('Budget deleted')
      setDeleting(null)
      fetchBudgets()
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to delete'
      toast.error(msg)
    }
  }

  const { items } = data

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">Budgets</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Monthly limits per category{' '}
            {data.month ? `· ${monthLabel(data.year, data.month)}` : ''}
          </p>
        </div>
        <button
          type="button"
          onClick={openAdd}
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> Add budget
        </button>
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-36 animate-pulse rounded-2xl border border-border bg-card/50"
              />
            ))}
          </div>
        ) : items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
            <Target className="mx-auto h-8 w-8 text-muted-foreground" />
            <p className="mt-3 text-sm text-muted-foreground">
              No budgets for {monthLabel(data.year, data.month)} yet.
            </p>
            <button
              type="button"
              onClick={openAdd}
              className="mt-4 inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
            >
              <Plus className="h-4 w-4" /> Create your first budget
            </button>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {items.map((b) => {
              const state = barState(b.spent, b.monthlyLimit)
              const pct = b.monthlyLimit > 0 ? (b.spent / b.monthlyLimit) * 100 : 0
              const remaining = b.monthlyLimit - b.spent
              return (
                <div
                  key={b._id}
                  className="rounded-2xl border border-border bg-card p-5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-display text-lg font-semibold">
                        {b.category}
                      </h2>
                      <p className={`text-xs font-medium ${state.tone}`}>
                        {state.label} · {Math.round(pct)}%
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => openEdit(b)}
                        className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition hover:bg-accent hover:text-foreground"
                        aria-label={`Edit ${b.category} budget`}
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleting(b)}
                        className="grid h-8 w-8 place-items-center rounded-lg text-muted-foreground transition hover:bg-accent hover:text-destructive"
                        aria-label={`Delete ${b.category} budget`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(pct, 100)}%`,
                        backgroundColor: state.color,
                      }}
                    />
                  </div>

                  <div className="mt-3 flex items-baseline justify-between text-sm">
                    <span className="tabular-nums">
                      {formatCurrency(b.spent, currency)}
                      <span className="text-muted-foreground">
                        {' '}
                        / {formatCurrency(b.monthlyLimit, currency)}
                      </span>
                    </span>
                    <span className={`tabular-nums text-xs ${state.tone}`}>
                      {remaining >= 0
                        ? `${formatCurrency(remaining, currency)} left`
                        : `${formatCurrency(-remaining, currency)} over`}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <BudgetFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={fetchBudgets}
        initialValue={editing}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        title="Delete budget?"
        message={
          deleting
            ? `This will remove the ${deleting.category} budget for this month. This cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
      />
    </div>
  )
}
