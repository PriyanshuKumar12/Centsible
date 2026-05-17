import { useCallback, useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, Download, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'
import {
  listTransactions,
  deleteTransaction,
  exportTransactionsCsv,
} from '@/api/transactions'
import TransactionFilters from '@/components/transactions/TransactionFilters'
import TransactionTable from '@/components/transactions/TransactionTable'
import TransactionFormModal from '@/components/transactions/TransactionFormModal'
import ConfirmDialog from '@/components/shared/ConfirmDialog'

const LIMIT = 20

// Convert URLSearchParams → plain filter object the API accepts.
function paramsToFilters(params) {
  const get = (k) => params.get(k) || undefined
  return {
    search: get('search'),
    type: get('type'),
    category: get('category'),
    from: get('from'),
    to: get('to'),
    page: Number(params.get('page')) || 1,
  }
}

// Convert filter object → URLSearchParams (drops empties).
function filtersToParams(filters) {
  const out = {}
  for (const [k, v] of Object.entries(filters)) {
    if (v === undefined || v === null || v === '') continue
    if (k === 'page' && Number(v) === 1) continue // page=1 is implicit
    out[k] = String(v)
  }
  return out
}

export default function Transactions() {
  const { user } = useAuth()
  const currency = user?.currency || 'INR'

  const [searchParams, setSearchParams] = useSearchParams()
  const filters = useMemo(() => paramsToFilters(searchParams), [searchParams])

  const [data, setData] = useState({ items: [], total: 0, page: 1, limit: LIMIT })
  const [loading, setLoading] = useState(true)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [deleting, setDeleting] = useState(null)
  const [exporting, setExporting] = useState(false)

  const updateFilters = useCallback(
    (next) => {
      setSearchParams(filtersToParams(next), { replace: true })
    },
    [setSearchParams]
  )

  const fetchList = useCallback(async () => {
    setLoading(true)
    try {
      const res = await listTransactions({ ...filters, limit: LIMIT })
      setData(res)
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to load transactions'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchList()
  }, [fetchList])

  const openAdd = () => {
    setEditing(null)
    setFormOpen(true)
  }
  const openEdit = (txn) => {
    setEditing(txn)
    setFormOpen(true)
  }

  const confirmDelete = async () => {
    if (!deleting) return
    try {
      await deleteTransaction(deleting._id)
      toast.success('Transaction deleted')
      setDeleting(null)
      // If we just emptied the last page, step back one.
      const remaining = data.total - 1
      const lastPage = Math.max(1, Math.ceil(remaining / LIMIT))
      if (filters.page > lastPage) {
        updateFilters({ ...filters, page: lastPage })
      } else {
        fetchList()
      }
    } catch (err) {
      const msg = err.response?.data?.error || 'Failed to delete'
      toast.error(msg)
    }
  }

  const handleExport = async () => {
    if (data.total === 0) {
      toast.info('Nothing to export for the current filters')
      return
    }
    setExporting(true)
    try {
      // Export respects the active filters but not pagination.
      await exportTransactionsCsv({
        search: filters.search,
        type: filters.type,
        category: filters.category,
        from: filters.from,
        to: filters.to,
      })
      toast.success('CSV downloaded')
    } catch (err) {
      const msg = err.response?.data?.error || 'Export failed'
      toast.error(msg)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">Transactions</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track every inflow and outflow.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExport}
            disabled={exporting}
            className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-2.5 text-sm font-medium transition hover:bg-accent disabled:opacity-60"
          >
            {exporting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Download className="h-4 w-4" />
            )}
            Export CSV
          </button>
          <button
            type="button"
            onClick={openAdd}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> Add transaction
          </button>
        </div>
      </div>

      <div className="mt-6">
        <TransactionFilters value={filters} onChange={updateFilters} />
      </div>

      <div className="mt-6">
        <TransactionTable
          items={data.items}
          total={data.total}
          page={data.page}
          limit={data.limit}
          loading={loading}
          currency={currency}
          onEdit={openEdit}
          onDelete={(t) => setDeleting(t)}
          onPageChange={(p) => updateFilters({ ...filters, page: p })}
        />
      </div>

      <TransactionFormModal
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSaved={fetchList}
        initialValue={editing}
      />

      <ConfirmDialog
        open={Boolean(deleting)}
        onClose={() => setDeleting(null)}
        onConfirm={confirmDelete}
        title="Delete transaction?"
        message={
          deleting
            ? `This will permanently delete "${deleting.description || deleting.category}". This cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
      />
    </div>
  )
}
