import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'
import { formatCurrency } from '@/utils/format'

// Stable per-category colors so the same category gets the same color
// across renders (and across chart vs legend).
const COLORS = {
  Food: '#10B981',
  Travel: '#3B82F6',
  Bills: '#F59E0B',
  Entertainment: '#A855F7',
  Shopping: '#EC4899',
  Health: '#06B6D4',
  Education: '#8B5CF6',
  Salary: '#22C55E',
  Freelance: '#14B8A6',
  Investment: '#F97316',
  Other: '#94A3B8',
}

export default function CategoryDonut({ data, currency }) {
  const total = data.reduce((sum, d) => sum + d.total, 0)

  return (
    <div className="rounded-2xl border border-border bg-card p-5">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-lg font-semibold">By category</h2>
        <span className="text-xs text-muted-foreground">This month</span>
      </div>

      {data.length === 0 ? (
        <div className="mt-4 grid h-64 place-items-center rounded-xl border border-dashed border-border bg-card/50 text-sm text-muted-foreground">
          No expenses this month.
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          <div className="relative h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="total"
                  nameKey="category"
                  innerRadius="65%"
                  outerRadius="100%"
                  paddingAngle={2}
                  stroke="none"
                >
                  {data.map((entry) => (
                    <Cell key={entry.category} fill={COLORS[entry.category] || '#94A3B8'} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: 12,
                    fontSize: 12,
                  }}
                  formatter={(value) => formatCurrency(value, currency)}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 grid place-items-center text-center">
              <div>
                <p className="text-xs text-muted-foreground">Total</p>
                <p className="font-display text-lg font-bold tabular-nums">
                  {formatCurrency(total, currency)}
                </p>
              </div>
            </div>
          </div>

          <ul className="space-y-2 text-sm">
            {data.map((d) => (
              <li key={d.category} className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 truncate">
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: COLORS[d.category] || '#94A3B8' }}
                  />
                  <span className="truncate">{d.category}</span>
                </span>
                <span className="tabular-nums text-muted-foreground">
                  {formatCurrency(d.total, currency)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
