import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

export default function PagePlaceholder({ title, subtitle }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container py-12">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> Home
        </Link>
        <h1 className="mt-8 font-display text-4xl font-bold">{title}</h1>
        {subtitle && <p className="mt-3 max-w-xl text-muted-foreground">{subtitle}</p>}
        <div className="mt-10 rounded-2xl border border-dashed border-border bg-card/50 p-12 text-center">
          <p className="text-sm text-muted-foreground">Under construction — see the project roadmap.</p>
        </div>
      </div>
    </div>
  )
}
