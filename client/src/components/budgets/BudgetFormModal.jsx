import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import Modal from '@/components/shared/Modal'
import { CATEGORIES } from '@/constants/categories'
import { createBudget, updateBudget } from '@/api/budgets'

const schema = z.object({
  category: z.enum(CATEGORIES),
  monthlyLimit: z.coerce
    .number()
    .positive('Monthly limit must be greater than 0'),
})

const EMPTY_DEFAULTS = { category: 'Food', monthlyLimit: '' }

export default function BudgetFormModal({ open, onClose, onSaved, initialValue }) {
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
            category: initialValue.category,
            monthlyLimit: initialValue.monthlyLimit,
          }
        : EMPTY_DEFAULTS
    )
  }, [open, initialValue, reset])

  const onSubmit = async (values) => {
    setSubmitting(true)
    try {
      const payload = {
        category: values.category,
        monthlyLimit: Number(values.monthlyLimit),
      }
      const saved = isEdit
        ? await updateBudget(initialValue._id, payload)
        : await createBudget(payload)
      toast.success(isEdit ? 'Budget updated' : 'Budget created')
      onSaved?.(saved)
      onClose?.()
    } catch (err) {
      const msg = err.response?.data?.error || 'Could not save budget'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={submitting ? undefined : onClose}
      title={isEdit ? 'Edit budget' : 'Add budget'}
      size="md"
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Field label="Category" error={errors.category?.message}>
          <select {...register('category')} className="input" disabled={isEdit}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {isEdit && (
            <span className="mt-1 block text-xs text-muted-foreground">
              Delete and recreate to change the category.
            </span>
          )}
        </Field>

        <Field label="Monthly limit" error={errors.monthlyLimit?.message}>
          <input
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            {...register('monthlyLimit')}
            className="input tabular-nums"
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
            {isEdit ? 'Save changes' : 'Add budget'}
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
