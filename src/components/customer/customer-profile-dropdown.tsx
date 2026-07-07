'use client'

import { useRouter } from 'next/navigation'
import { User, Settings, LogOut, ChevronDown } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { logoutAction } from '@/app/actions/auth'

interface CustomerProfileDropdownProps {
  fullName: string
  email: string
  avatarUrl?: string | null
  role?: string
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join('')
}

export function CustomerProfileDropdown({
  fullName,
  email,
  avatarUrl,
  role,
}: CustomerProfileDropdownProps) {
  const router = useRouter()
  const initials = getInitials(fullName || email || 'U')

  async function handleLogout() {
    await logoutAction()
    router.refresh()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button
            variant="ghost"
            className="flex items-center gap-2 h-9 px-2 hover:bg-muted rounded-lg"
          >
            <Avatar className="h-7 w-7">
              <AvatarImage src={avatarUrl ?? undefined} alt={fullName} />
              <AvatarFallback className="text-xs bg-primary/10 text-primary font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <span className="hidden md:block text-sm font-medium max-w-[120px] truncate">
              {fullName || email}
            </span>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground hidden md:block" />
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-56">
        {/* ✅ Bungkus label dengan Group */}
        <DropdownMenuGroup>
          <DropdownMenuLabel>
            <div className="flex flex-col space-y-0.5">
              <p className="text-sm font-semibold leading-none">{fullName}</p>
              <p className="text-xs leading-none text-muted-foreground">{email}</p>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuGroup>
          {role === 'admin' && (
            <DropdownMenuItem onClick={() => router.push('/admin/dashboard')} className="font-semibold text-emerald-600 focus:text-emerald-700">
              <Settings className="mr-2 h-4 w-4" />
              Admin Portal
            </DropdownMenuItem>
          )}
          <DropdownMenuItem onClick={() => router.push('/customer/profile')}>
            <User className="mr-2 h-4 w-4" />
            Profil Saya
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        <DropdownMenuItem
          className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Keluar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
