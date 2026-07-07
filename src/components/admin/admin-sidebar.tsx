'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Store,
  CalendarDays,
  CreditCard,
  BarChart3,
  LogOut
} from 'lucide-react'
import { cn } from '@/lib/utils'

const adminNavItems = [
  { href: '/admin/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/users', label: 'Pengguna', icon: Users },
  { href: '/admin/venues', label: 'Venue', icon: Store },
  { href: '/admin/bookings', label: 'Booking', icon: CalendarDays },
  { href: '/admin/payments', label: 'Pembayaran', icon: CreditCard },
  { href: '/admin/reports', label: 'Laporan', icon: BarChart3 },
]

export function AdminSidebar({ className }: { className?: string }) {
  const pathname = usePathname()

  return (
    <aside className={cn('flex flex-col h-full bg-slate-950 text-slate-300 border-r border-slate-800 w-64', className)}>
      <div className="flex items-center h-16 px-6 border-b border-slate-800 shrink-0">
        <Link href="/admin/dashboard" className="flex items-center gap-2 font-bold text-xl tracking-tight text-white">
          <LayoutDashboard className="h-6 w-6 text-emerald-500" />
          <span>Admin Portal</span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-8">
        <div className="space-y-1">
          <h4 className="px-3 text-xs font-semibold uppercase text-slate-500 mb-2 tracking-wider">
            Manajemen Platform
          </h4>
          <nav className="space-y-1">
            {adminNavItems.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-400'
                      : 'text-slate-400 hover:bg-slate-900 hover:text-white'
                  )}
                >
                  <item.icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-emerald-400' : '')} />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
      
      <div className="p-4 border-t border-slate-800">
        <form action="/auth/logout" method="POST">
          <button type="submit" className="flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-slate-900 hover:text-white transition-colors">
            <LogOut className="h-4 w-4 shrink-0" />
            Keluar
          </button>
        </form>
      </div>
    </aside>
  )
}
