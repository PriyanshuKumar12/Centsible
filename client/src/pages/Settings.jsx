import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { toast } from 'sonner'
import { Loader2, Sun, Moon, Trash2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import { useTheme } from '@/context/ThemeContext'
import {
  updateProfile,
  changePassword,
  updatePreferences,
  deleteAccount,
} from '@/api/user'
import Modal from '@/components/shared/Modal'

const profileSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(80),
  email: z.string().trim().email('Enter a valid email'),
})

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'New password must be at least 8 characters'),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((d) => d.newPassword === d.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  })

const CURRENCIES = [
  { value: 'INR', label: '₹ Indian Rupee (INR)' },
  { value: 'USD', label: '$ US Dollar (USD)' },
  { value: 'EUR', label: '€ Euro (EUR)' },
]

export default function Settings() {
  const { user, updateUser, logout } = useAuth()
  const { theme, toggle: toggleTheme } = useTheme()
  const navigate = useNavigate()

  const [currency, setCurrency] = useState(user?.currency || 'INR')
  const [savingCurrency, setSavingCurrency] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)

  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name || '', email: user?.email || '' },
  })

  const passwordForm = useForm({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  })

  const onSaveProfile = async (values) => {
    try {
      const updated = await updateProfile(values)
      updateUser(updated)
      toast.success('Profile updated')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not update profile')
    }
  }

  const onChangePassword = async (values) => {
    try {
      await changePassword({
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      })
      passwordForm.reset()
      toast.success('Password updated')
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not change password')
    }
  }

  const onCurrencyChange = async (next) => {
    const prev = currency
    setCurrency(next)
    setSavingCurrency(true)
    try {
      const updated = await updatePreferences({ currency: next })
      updateUser(updated)
      toast.success('Currency updated')
    } catch (err) {
      setCurrency(prev) // revert on failure
      toast.error(err.response?.data?.error || 'Could not update currency')
    } finally {
      setSavingCurrency(false)
    }
  }

  const onDeleteAccount = async (password) => {
    await deleteAccount({ password })
    toast.success('Account deleted')
    await logout()
    navigate('/', { replace: true })
  }

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="font-display text-3xl font-bold">Settings</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Manage your profile, security, and preferences.
      </p>

      {/* Profile */}
      <Section title="Profile" description="Your name and login email.">
        <form
          onSubmit={profileForm.handleSubmit(onSaveProfile)}
          className="space-y-4"
        >
          <Field label="Name" error={profileForm.formState.errors.name?.message}>
            <input
              type="text"
              {...profileForm.register('name')}
              className="input"
            />
          </Field>
          <Field label="Email" error={profileForm.formState.errors.email?.message}>
            <input
              type="email"
              autoComplete="email"
              {...profileForm.register('email')}
              className="input"
            />
          </Field>
          <SubmitButton
            submitting={profileForm.formState.isSubmitting}
            label="Save changes"
          />
        </form>
      </Section>

      {/* Password */}
      <Section title="Password" description="Use at least 8 characters.">
        <form
          onSubmit={passwordForm.handleSubmit(onChangePassword)}
          className="space-y-4"
        >
          <Field
            label="Current password"
            error={passwordForm.formState.errors.currentPassword?.message}
          >
            <input
              type="password"
              autoComplete="current-password"
              {...passwordForm.register('currentPassword')}
              className="input"
            />
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field
              label="New password"
              error={passwordForm.formState.errors.newPassword?.message}
            >
              <input
                type="password"
                autoComplete="new-password"
                {...passwordForm.register('newPassword')}
                className="input"
              />
            </Field>
            <Field
              label="Confirm new password"
              error={passwordForm.formState.errors.confirmPassword?.message}
            >
              <input
                type="password"
                autoComplete="new-password"
                {...passwordForm.register('confirmPassword')}
                className="input"
              />
            </Field>
          </div>
          <SubmitButton
            submitting={passwordForm.formState.isSubmitting}
            label="Update password"
          />
        </form>
      </Section>

      {/* Preferences */}
      <Section
        title="Preferences"
        description="How Centsible looks and formats money."
      >
        <div className="space-y-5">
          <label className="block">
            <span className="text-sm font-medium">Currency</span>
            <div className="mt-1.5 flex items-center gap-2">
              <select
                value={currency}
                disabled={savingCurrency}
                onChange={(e) => onCurrencyChange(e.target.value)}
                className="input disabled:opacity-60"
              >
                {CURRENCIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
              {savingCurrency && (
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
              )}
            </div>
          </label>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Theme</p>
              <p className="text-xs text-muted-foreground">
                Currently {theme === 'dark' ? 'dark' : 'light'} mode.
              </p>
            </div>
            <button
              type="button"
              onClick={toggleTheme}
              className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary px-4 py-2 text-sm font-medium transition hover:bg-accent"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="h-4 w-4" /> Switch to light
                </>
              ) : (
                <>
                  <Moon className="h-4 w-4" /> Switch to dark
                </>
              )}
            </button>
          </div>
        </div>
      </Section>

      {/* Danger zone */}
      <div className="mt-6 rounded-2xl border border-destructive/40 bg-card p-5">
        <h2 className="font-display text-lg font-semibold text-destructive">
          Danger zone
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Permanently delete your account and every transaction and budget on it.
          This cannot be undone.
        </p>
        <button
          type="button"
          onClick={() => setDeleteOpen(true)}
          className="mt-4 inline-flex items-center gap-2 rounded-full bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition hover:opacity-90"
        >
          <Trash2 className="h-4 w-4" /> Delete account
        </button>
      </div>

      <DeleteAccountModal
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={onDeleteAccount}
      />
    </div>
  )
}

function Section({ title, description, children }) {
  return (
    <div className="mt-6 rounded-2xl border border-border bg-card p-5">
      <h2 className="font-display text-lg font-semibold">{title}</h2>
      {description && (
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      )}
      <div className="mt-5">{children}</div>
    </div>
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

function SubmitButton({ submitting, label }) {
  return (
    <button
      type="submit"
      disabled={submitting}
      className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
    >
      {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
      {label}
    </button>
  )
}

function DeleteAccountModal({ open, onClose, onConfirm }) {
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)

  const close = () => {
    if (busy) return
    setPassword('')
    onClose()
  }

  const confirm = async () => {
    if (!password) {
      toast.error('Enter your password to confirm')
      return
    }
    setBusy(true)
    try {
      await onConfirm(password)
      // On success the component unmounts (navigation); no further state.
    } catch (err) {
      toast.error(err.response?.data?.error || 'Could not delete account')
      setBusy(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title="Delete account"
      size="sm"
      footer={
        <>
          <button
            type="button"
            onClick={close}
            disabled={busy}
            className="rounded-full border border-border bg-secondary px-4 py-2 text-sm transition hover:bg-accent disabled:opacity-60"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={confirm}
            disabled={busy}
            className="inline-flex items-center gap-2 rounded-full bg-destructive px-4 py-2 text-sm font-medium text-destructive-foreground transition hover:opacity-90 disabled:opacity-60"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            Delete forever
          </button>
        </>
      }
    >
      <p className="text-sm text-muted-foreground">
        This permanently deletes your account and all of its data. Enter your
        password to confirm.
      </p>
      <input
        type="password"
        autoComplete="current-password"
        placeholder="Your password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && confirm()}
        className="input mt-4"
      />
    </Modal>
  )
}
