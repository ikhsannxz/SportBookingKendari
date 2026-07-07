'use client'

import { Menu, LogOut, ChevronDown } from 'lucide-react'
import { usePathname, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { AdminSidebar } from './admin-sidebar'
import { logoutAction } from '@/app/actions/auth'

interface AdminHeaderProps {
  fullName: string
  email: string
  avatarUrl?: string | null
}

function Breadcrumbs() {
  const pathname = usePathname()
  const paths = pathname.split('/').filter(Boolean)
  
  if (paths.length <= 1) return <div className="font-semibold text-lg tracking-tight">Dashboard</div>

  const currentSection = paths[1]
  const title = currentSection.charAt(0).toUpperCase() + currentSection.slice(1)

  return (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-slate-500 hidden md:inline">Admin / </span>
      <span className="font-semibold text-lg tracking-tight">{title}</span>
    </div>
  )
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('')
}

export function AdminHeader({ fullName, email, avatarUrl }: AdminHeaderProps) {
  const router = useRouter()
  const initials = getInitials(fullName || email || 'Admin')

  async function handleLogout() {
    await logoutAction()
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-40 h-16 flex items-center justify-between gap-4 border-b bg-white px-4 md:px-6 shrink-0">
      <div className="flex items-center gap-4">
        {/* Mobile Drawer Trigger */}
        <Sheet>
          <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden" />}>
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle mobile menu</span>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64 border-none bg-slate-950">
            <AdminSidebar className="w-full border-none" />
          </SheetContent>
        </Sheet>
        
        <Breadcrumbs />
      </div>

      <div className="flex items-center gap-1 md:gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                className="flex items-center gap-2 h-9 px-2 hover:bg-slate-100 rounded-lg"
              >
                <Avatar className="h-7 w-7">
                  <AvatarImage src={avatarUrl ?? undefined} alt={fullName} />
                  <AvatarFallback className="text-xs bg-emerald-100 text-emerald-700 font-semibold">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden md:block text-sm font-medium max-w-[120px] truncate">
                  {fullName || email}
                </span>
                <ChevronDown className="h-3.5 w-3.5 text-slate-500 hidden md:block" />
              </Button>
            }
          />
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuGroup>
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-0.5">
                  <p className="text-sm font-semibold leading-none">{fullName}</p>
                  <p className="text-xs leading-none text-slate-500">{email}</p>
                </div>
              </DropdownMenuLabel>
            </DropdownMenuGroup>
            
            <DropdownMenuSeparator />

            <DropdownMenuItem
              className="text-red-600 focus:text-red-600 focus:bg-red-50 cursor-pointer"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Keluar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
