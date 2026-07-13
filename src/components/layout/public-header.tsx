import Link from 'next/link'
import { Menu, User, Heart, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet'
import { createClient } from '@/lib/supabase/server'
import { NotificationMenu } from '@/components/customer/notification-menu'
import { CustomerProfileDropdown } from '@/components/customer/customer-profile-dropdown'

export async function PublicHeader() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let profile = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('full_name, avatar_url, role')
      .eq('id', user.id)
      .single()
    profile = data
  }

  const fullName = profile?.full_name || user?.user_metadata?.full_name || ''
  const avatarUrl = profile?.avatar_url || null
  const email = user?.email || ''
  const isCustomer = profile?.role === 'customer' || (user && !profile?.role)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200/80 bg-white/95 backdrop-blur-md shadow-sm transition-all duration-300">
      <div className="container mx-auto flex h-20 items-center justify-between px-4 md:px-8">
        
        {/* Left Section: Logo & Mobile Menu */}
        <div className="flex items-center gap-4">
          {/* Mobile Hamburger Menu */}
          <Sheet>
            <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden text-slate-700 hover:bg-slate-100" />}>
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle navigation menu</span>
            </SheetTrigger>
            <SheetContent side="left" className="w-[300px] bg-white border-r-0">
              <div className="flex flex-col h-full">
                <div className="px-2 pt-4 pb-6 border-b border-slate-100">
                  <Link href={user ? "/customer/dashboard" : "/"} className="flex items-center gap-2">
                    <span className="text-2xl font-black tracking-tighter text-emerald-600">SportBook.</span>
                  </Link>
                </div>
                <nav className="flex flex-col gap-2 py-6 flex-1">
                  <Link href={user ? "/customer/dashboard" : "/"} className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-slate-50 text-slate-700 font-semibold transition-colors">
                    Beranda <ChevronRight className="w-4 h-4 text-slate-400" />
                  </Link>
                  <Link href="/search" className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-slate-50 text-slate-700 font-semibold transition-colors">
                    Cari Lapangan <ChevronRight className="w-4 h-4 text-slate-400" />
                  </Link>

                  <Link href="/activities" className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-slate-50 text-slate-700 font-semibold transition-colors">
                    Aktivitas <ChevronRight className="w-4 h-4 text-slate-400" />
                  </Link>
                  <Link href="/about" className="flex items-center justify-between px-4 py-3 rounded-xl hover:bg-slate-50 text-slate-700 font-semibold transition-colors">
                    Tentang Kami <ChevronRight className="w-4 h-4 text-slate-400" />
                  </Link>
                </nav>
                {!user && (
                  <div className="border-t border-slate-100 pt-6 pb-4 flex flex-col gap-3">
                    <Button variant="outline" className="w-full justify-center rounded-xl h-12 text-base font-bold border-slate-200 text-slate-700 hover:bg-slate-50" asChild>
                      <Link href="/auth/login">Masuk</Link>
                    </Button>
                    <Button className="w-full justify-center rounded-xl h-12 text-base font-bold bg-emerald-700 hover:bg-emerald-800 text-white" asChild>
                      <Link href="/auth/register">Daftar</Link>
                    </Button>
                  </div>
                )}
              </div>
            </SheetContent>
          </Sheet>

          {/* Logo */}
          <Link href={user ? "/customer/dashboard" : "/"} className="flex items-center gap-2">
            <span className="text-2xl md:text-3xl font-black tracking-tighter text-emerald-600">SportBook<span className="text-slate-900">.</span></span>
          </Link>
        </div>

        {/* Center Section: Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <Link href={user ? "/customer/dashboard" : "/"} className="text-[15px] font-semibold text-slate-600 hover:text-emerald-600 transition-colors">
            Beranda
          </Link>
          <Link href="/search" className="text-[15px] font-semibold text-slate-600 hover:text-emerald-600 transition-colors">
            Cari Lapangan
          </Link>

          <Link href="/activities" className="text-[15px] font-semibold text-slate-600 hover:text-emerald-600 transition-colors">
            Aktivitas
          </Link>
          <Link href="/about" className="text-[15px] font-semibold text-slate-600 hover:text-emerald-600 transition-colors">
            Tentang Kami
          </Link>
        </div>

        {/* Right Section: Auth & Profile */}
        <div className="flex items-center justify-end gap-2">
          {!user ? (
            <>
              <div className="hidden md:flex items-center gap-3">
                <Button variant="ghost" className="rounded-full font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100" asChild>
                  <Link href="/auth/login">Masuk</Link>
                </Button>
                <Button className="rounded-full font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm" asChild>
                  <Link href="/auth/register">Daftar</Link>
                </Button>
              </div>
              <Button variant="ghost" size="icon" className="md:hidden text-slate-700" asChild>
                <Link href="/auth/login">
                  <User className="h-6 w-6" />
                  <span className="sr-only">User profile</span>
                </Link>
              </Button>
            </>
          ) : (
            <>
              {isCustomer && (
                <>
                  <Button variant="ghost" size="icon" asChild className="hidden md:inline-flex rounded-full text-slate-600 hover:text-emerald-600 hover:bg-emerald-50">
                    <Link href="/customer/favorites">
                      <Heart className="h-5 w-5" />
                    </Link>
                  </Button>
                  <NotificationMenu />
                </>
              )}
              <CustomerProfileDropdown
                fullName={fullName}
                email={email}
                avatarUrl={avatarUrl}
                role={profile?.role}
              />
            </>
          )}
        </div>
        
      </div>
    </header>
  )
}
