import { useEffect, useState } from 'react'
import { Lightbulb } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'
import { getMonthly, getByCategory } from '@/api/analytics'
import MoneyFlowChart from '@/components/dashboard/MoneyFlowChart'
import CategoryDonut from '@/components/dashboard/CategoryDonut'

// Compare this month's total expense to last month's, using the 6-month
// series the dashboard already serves (no extra endpoint needed).
function buildInsight(monthly, byCategory) {
  if (!monthly || monthly.length < 2) return null
  const thisM = monthly[monthly.length - 1].expense
  const prevM = monthly[monthly.length - 2].expense
  const topCat = byCategory[0]?.category

  let trend
  if (prevM === 0 && thisM === 0) {
    trend = 'No expenses recorded in the last two months.'
  } else if (prevM === 0) {
    trend = 'You have expenses this month but none last month.'
  } else {
    const pct = Math.round(((thisM - prevM) / prevM) * 100)
    if (pct === 0) trend = 'Your spending is flat versus last month.'
    else
      trend = `You've spent ${Math.abs(pct)}% ${pct > 0 ? 'more' : 'less'} this month than last month.`
  }

  const top = topCat ? ` Your biggest category this month is ${topCat}.` : ''
  return trend + top
}

export default function Analytics() {
  const { user } = useAuth()
  const currency = user?.currency || 'INR'

  const [monthly, setMonthly] = useState([])
  const [byCategory, setByCategory] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    Promise.all([getMonthly(), getByCategory()])
      .then(([m, c]) => {
        if (cancelled) return
        setMonthly(m)
        setByCategory(c)
      })
      .catch((err) => {
        if (cancelled) return
        const msg = err.response?.data?.error || 'Failed to load analytics'
        toast.error(msg)
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const insight = loading ? null : buildInsight(monthly, byCategory)

  return (
    <div>
      <div>
        <h1 className="font-display text-3xl font-bold">Analytics</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Six-month trend and where your money goes.
        </p>
      </div>

      {insight && (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-border bg-card p-5">
          <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary">
            <Lightbulb className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-medium">Insight</p>
            <p className="mt-0.5 text-sm text-muted-foreground">{insight}</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="h-72 animate-pulse rounded-2xl border border-border bg-card/50 lg:col-span-2" />
          <div className="h-72 animate-pulse rounded-2xl border border-border bg-card/50" />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2">
            <MoneyFlowChart data={monthly} currency={currency} />
          </div>
          <div>
            <CategoryDonut data={byCategory} currency={currency} />
          </div>
        </div>
      )}
    </div>
  )
}
