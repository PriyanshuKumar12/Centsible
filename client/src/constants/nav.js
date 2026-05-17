import {
  LayoutDashboard,
  ArrowLeftRight,
  Target,
  TrendingUp,
  Settings,
} from 'lucide-react'

// Single source of truth for the primary nav — shared by the desktop
// Sidebar and the mobile drawer so they never drift apart.
export const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/budgets', label: 'Budgets', icon: Target },
  { to: '/analytics', label: 'Analytics', icon: TrendingUp },
  { to: '/settings', label: 'Settings', icon: Settings },
]
