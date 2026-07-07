'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, CalendarDays, Heart, User } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { href: '/customer/dashboard', label: 'Home', icon: Home },
  { href: '/search', label: 'Cari', icon: Search },
  { href: '/customer/bookings', label: 'Booking', icon: CalendarDays },
  { href: '/customer/favorites', label: 'Favorit', icon: Heart },
  { href: '/customer/profile', label: 'Profil', icon: User },
]

export function CustomerBottomNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-background/95 backdrop-blur border-t safe-area-bottom">
      <div className="flex items-stretch justify-around px-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const isActive = pathname === href || pathname.startsWith(href + '/')

          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center justify-center gap-1 py-3 px-1 text-[10px] font-medium transition-colors min-w-[60px]',
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <Icon
                className={cn(
                  'h-5 w-5 transition-all',
                  isActive ? 'stroke-[2.5]' : 'stroke-[1.5]'
                )}
              />
              {label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
