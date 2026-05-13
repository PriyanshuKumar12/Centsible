import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import Modal from '@/components/shared/Modal'
import { CATEGORIES, TRANSACTION_TYPES } from '@/constants/categories'
import { createTransaction, updateTransaction } from '@/api/transactions'
import { toDateInputValue } from '@/utils/format'

const schema = z.object({
  type: z.enum(TRANSACTION_TYPES),
  amount: z.coerce.number().nonnegative('Amount must be non-negative'),
  category: z.enum(CATEGORIES),
  description: z.string().trim().max(200).optional(),
  date: z.string().min(1, 'Date is required'),
})

const EMPTY_DEFAULTS = {
  type: 'expense',
  amount: '',
  category: 'Food',
  description: '',
  date: toDateInputValue(new Date()),
}

export default function TransactionFormModal({ open, onClose, onSaved, initialValue }) {
  const isEdit = Boolean(initialValue?._id)
  const [submitting, setSubmitting] = useState(false)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema), defaultValues: EMPTY_DEFAULTS })

  useEffect(() => {
    if (!open) return
    reset(
      initialValue
        ? {
            type: initialValue.type,
            amount: initialValue.amount,
            category: initialValue.category,
            description: initialValue.description || '',
            date: toDateInputValue(initialValue.date),
          }
        : EMPTY_DEFAULTS
    )
  }, [open, initialValue, reset])

  const onSubmit = async (values) => {
    setSubmitting(true)
    try {
      const payload = {
        ...values,
        amount: Number(values.amount),
        // Send the date as midnight local time on the chosen day.
        date: new Date(values.date).toISOString(),
      }
      const saved = isEdit
        ? await updateTransaction(initialValue._id, payload)
        : await createTransaction(payload)
      toast.success(isEdit ? 'Transaction updated' : 'Transaction added')
      onSaved?.(saved)
      onClose?.()
    } catch (err) {
      const msg = err.response?.data?.error || 'Could not save transaction'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={submitting ? undefined : onClose}
      title={isEdit ? 'Edit transaction' : 'Add transaction'}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field label="Type" error={errors.type?.message}>
          <select {...register('type')} className="input">
            <option value="expense">Expense</option>
            <option value="income">Income</option>
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Amount" error={errors.amount?.message}>
            <input
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              {...register('amount')}
              className="input tabular-nums"
            />
          </Field>
          <Field label="Date" error={errors.date?.message}>
            <input type="date" {...register('date')} className="input" />
          </Field>
        </div>

        <Field label="Category" error={errors.category?.message}>
          <select {...register('category')} className="input">
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>

        <Field label="Description (optional)" error={errors.description?.message}>
          <input
            type="text"
            placeholder="e.g. Lunch with team"
            maxLength={200}
            {...register('description')}
            className="input"
          />
        </Field>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-full border border-border bg-secondary px-4 py-2 text-sm transition hover:bg-accent disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {isEdit ? 'Save changes' : 'Add transaction'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="text-sm font-medium">{label}</span>
      <div className="mt-1.5">{children}</div>
      {error && <span className="mt-1 block text-xs text-destructive">{error}</span>}
    </label>
  )
}
