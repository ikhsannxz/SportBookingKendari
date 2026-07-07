'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Calendar, Heart, User } from 'lucide-react'
import { cn } from '@/lib/utils'

export function MobileBottomNav() {
  const pathname = usePathname()

  const navItems = [
    { name: 'Home', href: '/customer/dashboard', icon: Home },
    { name: 'Bookings', href: '/customer/bookings', icon: Calendar },
    { name: 'Favorites', href: '/customer/favorites', icon: Heart },
    { name: 'Profile', href: '/customer/profile', icon: User },
  ]

  return (
    <nav className="fixed bottom-0 z-50 w-full border-t bg-background pb-safe md:hidden">
      <div className="flex h-16 items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center w-full h-full space-y-1 text-muted-foreground transition-colors hover:text-primary",
                isActive && "text-primary"
              )}
            >
              <Icon className={cn("w-6 h-6", isActive && "fill-primary/20")} />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
