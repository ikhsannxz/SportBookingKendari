'use client'

import { Menu } from 'lucide-react'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { NotificationMenu } from '@/components/customer/notification-menu'
import { OwnerProfileDropdown } from './owner-profile-dropdown'
import { OwnerSidebar } from './owner-sidebar'

interface OwnerHeaderProps {
  fullName: string
  email: string
  avatarUrl?: string | null
}

function Breadcrumbs() {
  const pathname = usePathname()
  const currentSection = pathname.split('/').filter(Boolean)[1] || 'dashboard'

  // Map sections to localized titles
  const sectionTitleMap: Record<string, string> = {
    dashboard: 'Dashboard',
    venues: 'Venue Saya',
    bookings: 'Booking',
    schedules: 'Jadwal',
    analytics: 'Analitik',
    profile: 'Profil',
  }
  
  const title = sectionTitleMap[currentSection] ?? (currentSection.charAt(0).toUpperCase() + currentSection.slice(1))

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-muted-foreground hidden md:inline">Owner / </span>
      <span className="font-semibold text-lg tracking-tight">{title}</span>
    </div>
  )
}

export function OwnerHeader({ fullName, email, avatarUrl }: OwnerHeaderProps) {
  return (
    <header className="sticky top-0 z-40 h-16 flex items-center justify-between gap-4 border-b bg-background/95 backdrop-blur px-4 md:px-6 shrink-0">
      
      <div className="flex items-center gap-4">
        {/* Mobile Drawer Trigger */}
        <Sheet>
          <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden" />}>
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle mobile menu</span>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <OwnerSidebar className="w-full border-none" />
          </SheetContent>
        </Sheet>
        
        {/* Breadcrumb / Title */}
        <Breadcrumbs />
      </div>

      {/* Right actions */}
      <div className="flex items-center gap-1 md:gap-3">
        <NotificationMenu />
        <OwnerProfileDropdown
          fullName={fullName}
          email={email}
          avatarUrl={avatarUrl}
        />
      </div>
    </header>
  )
}
