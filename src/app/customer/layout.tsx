import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PublicHeader } from '@/components/layout/public-header'
import { CustomerBottomNav } from '@/components/customer/customer-bottom-nav'

export default async function CustomerLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/auth/login')
  }

  return (
    <div className="flex flex-col min-h-screen bg-muted/20">
      {/* Shared Public Header automatically adapts to auth state */}
      <PublicHeader />

      {/* Main Content — pb-20 for mobile bottom nav clearance */}
      <main className="flex-1 pb-20 md:pb-0">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <CustomerBottomNav />
    </div>
  )
}
