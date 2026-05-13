import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'
import { formatCurrency } from '@/utils/format'

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function shortMonth(key) {
  // 'YYYY-MM' → 'Mmm'
  const m = Number(key.slice(5, 7)) - 1
  return MONTH_NAMES[m] || key
}

function compactCurrency(value, currency) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value || 0)
}

export default function MoneyFlowChart({ data, currency }) {
  const chartData = data.map((d) => ({ ...d, label: shortMonth(d.month) }))
  const allZero = chartData.every((d) => !d.income && !d.expense)

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">Money flow</h2>
        <span className="text-xs text-muted-foreground">Last 6 months</span>
      </div>

      {allZero ? (
        <div className="mt-4 grid h-64 place-items-center rounded-xl border border-dashed border-border bg-card/50 text-sm text-muted-foreground">
          No activity yet — add a transaction to see the trend.
        </div>
      ) : (
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="label"
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                stroke="hsl(var(--muted-foreground))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v) => compactCurrency(v, currency)}
              />
              <Tooltip
                cursor={{ fill: 'hsl(var(--accent))', opacity: 0.4 }}
                contentStyle={{
                  backgroundColor: 'hsl(var(--popover))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: 12,
                  fontSize: 12,
                }}
                formatter={(value, name) => [formatCurrency(value, currency), name === 'income' ? 'Income' : 'Expense']}
              />
              <Legend
                iconType="circle"
                wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
                formatter={(v) => (v === 'income' ? 'Income' : 'Expense')}
              />
              <Bar dataKey="income" fill="#10B981" radius={[6, 6, 0, 0]} maxBarSize={32} />
              <Bar dataKey="expense" fill="#EF4444" radius={[6, 6, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}
