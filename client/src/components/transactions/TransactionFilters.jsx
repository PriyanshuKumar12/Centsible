import { useEffect, useState } from 'react'
import { Search, X } from 'lucide-react'
import { CATEGORIES } from '@/constants/categories'

export default function TransactionFilters({ value, onChange }) {
  // Local state for the search input so typing feels instant; we propagate
  // upward 300ms after the user stops typing.
  const [search, setSearch] = useState(value.search || '')

  useEffect(() => {
    setSearch(value.search || '')
  }, [value.search])

  useEffect(() => {
    const id = setTimeout(() => {
      if ((search || '') !== (value.search || '')) {
        onChange({ ...value, search: search || undefined, page: 1 })
      }
    }, 300)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  const set = (patch) => onChange({ ...value, ...patch, page: 1 })

  const hasFilters =
    value.type || value.category || value.from || value.to || value.search

  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="relative min-w-[200px] flex-1">
        <label className="block text-xs font-medium text-muted-foreground mb-1">Search</label>
        <Search className="pointer-events-none absolute left-3 top-[34px] h-4 w-4 text-muted-foreground" />
        <input
          type="search"
          placeholder="Description…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="input pl-9"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1">Type</label>
        <select
          value={value.type || ''}
          onChange={(e) => set({ type: e.target.value || undefined })}
          className="input"
        >
          <option value="">All</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1">Category</label>
        <select
          value={value.category || ''}
          onChange={(e) => set({ category: e.target.value || undefined })}
          className="input"
        >
          <option value="">All</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1">From</label>
        <input
          type="date"
          value={value.from || ''}
          onChange={(e) => set({ from: e.target.value || undefined })}
          className="input"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-muted-foreground mb-1">To</label>
        <input
          type="date"
          value={value.to || ''}
          onChange={(e) => set({ to: e.target.value || undefined })}
          className="input"
        />
      </div>

      {hasFilters && (
        <button
          type="button"
          onClick={() => onChange({ page: 1 })}
          className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary px-3 py-2 text-xs text-muted-foreground transition hover:bg-accent hover:text-foreground"
        >
          <X className="h-3 w-3" /> Clear
        </button>
      )}
    </div>
  )
}
