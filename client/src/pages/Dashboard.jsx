import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Wallet, TrendingUp, PiggyBank, TrendingDown, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'
import { getSummary, getMonthly, getByCategory } from '@/api/analytics'
import { listTransactions } from '@/api/transactions'
import StatCard from '@/components/dashboard/StatCard'
import MoneyFlowChart from '@/components/dashboard/MoneyFlowChart'
import CategoryDonut from '@/components/dashboard/CategoryDonut'
import RecentTransactions from '@/components/dashboard/RecentTransactions'

export default function Dashboard() {
  const { user } = useAuth()
  const currency = user?.currency || 'INR'

  const [summary, setSummary] = useState(null)
  const [monthly, setMonthly] = useState([])
  const [byCategory, setByCategory] = useState([])
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([
      getSummary(),
      getMonthly(),
      getByCategory(),
      listTransactions({ limit: 5 }),
    ])
      .then(([s, m, c, recentList]) => {
        if (cancelled) return
        setSummary(s)
        setMonthly(m)
        setByCategory(c)
        setRecent(recentList.items)
      })
      .catch((err) => {
        if (cancelled) return
        const msg = err.response?.data?.error || 'Failed to load dashboard'
        toast.error(msg)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">
            Welcome, {user?.name?.split(' ')[0] || 'there'} 👋
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Here's how your finances look this month.
          </p>
        </div>
        <Link
          to="/transactions"
          className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition hover:opacity-90"
        >
          <Plus className="h-4 w-4" /> Add transaction
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Wallet}
          label="Balance"
          amount={summary?.balance}
          currency={currency}
          tone="primary"
          loading={loading}
        />
        <StatCard
          icon={TrendingUp}
          label="Income (this month)"
          amount={summary?.monthIncome}
          currency={currency}
          tone="success"
          loading={loading}
        />
        <StatCard
          icon={PiggyBank}
          label="Savings (this month)"
          amount={summary?.monthSavings}
          currency={currency}
          tone="info"
          loading={loading}
        />
        <StatCard
          icon={TrendingDown}
          label="Expenses (this month)"
          amount={summary?.monthExpenses}
          currency={currency}
          tone="danger"
          loading={loading}
        />
      </div>

      <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <MoneyFlowChart data={monthly} currency={currency} />
        </div>
        <div>
          <CategoryDonut data={byCategory} currency={currency} />
        </div>
      </div>

      <div className="mt-6">
        <RecentTransactions items={recent} currency={currency} />
      </div>
    </div>
  )
}
