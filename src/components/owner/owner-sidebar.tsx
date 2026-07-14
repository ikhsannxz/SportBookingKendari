'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  CalendarDays,
  Clock,
  BarChart3,
  User,
  Store,
  Star
} from 'lucide-react'
import { cn } from '@/lib/utils'

const ownerNavItems = [
  { href: '/owner/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/owner/venues', label: 'Venue Saya', icon: Store },
  { href: '/owner/bookings', label: 'Booking', icon: CalendarDays },
  { href: '/owner/schedules', label: 'Jadwal', icon: Clock },
  { href: '/owner/reviews', label: 'Ulasan', icon: Star },
  { href: '/owner/analytics', label: 'Analitik', icon: BarChart3 },
]

const accountItems = [
  { href: '/owner/profile', label: 'Profil', icon: User },
]

export function OwnerSidebar({ className }: { className?: string }) {
  const pathname = usePathname()

  return (
    <aside className={cn('flex flex-col h-full bg-background border-r w-64', className)}>
      <div className="flex items-center h-16 px-6 border-b shrink-0">
        <Link href="/owner/dashboard" className="flex items-center gap-2 font-bold text-xl tracking-tight text-primary">
          <Store className="h-6 w-6 text-primary" />
          <span>Owner Portal</span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-8">
        <div className="space-y-1">
          <h4 className="px-3 text-xs font-semibold uppercase text-muted-foreground mb-2 tracking-wider">
            Management
          </h4>
          <nav className="space-y-1">
            {ownerNavItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <item.icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-primary' : '')} />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>

        <div className="space-y-1">
          <h4 className="px-3 text-xs font-semibold uppercase text-muted-foreground mb-2 tracking-wider">
            Account
          </h4>
          <nav className="space-y-1">
            {accountItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-primary/10 text-primary'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <item.icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-primary' : '')} />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </aside>
  )
}
