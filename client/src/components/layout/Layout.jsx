import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Sidebar from './Sidebar'
import MobileNav from './MobileNav'
import Topbar from './Topbar'

export default function Layout() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const location = useLocation()

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      <Sidebar />
      <MobileNav open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar onMenuClick={() => setMobileNavOpen(true)} />
        <main
          key={location.pathname}
          className="flex-1 overflow-x-hidden p-4 sm:p-6 lg:p-8 animate-fade-in"
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}
