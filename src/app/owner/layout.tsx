import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { OwnerSidebar } from '@/components/owner/owner-sidebar'
import { OwnerHeader } from '@/components/owner/owner-header'

export default async function OwnerLayout({
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

  // Fetch full profile from DB
  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, avatar_url, role')
    .eq('id', user.id)
    .single()

  // Make sure they are an owner
  if (profile?.role !== 'owner') {
    redirect('/auth/login')
  }

  const fullName = profile?.full_name || user.user_metadata?.full_name || 'Owner'
  const avatarUrl = profile?.avatar_url || null
  const email = user.email || ''

  return (
    <div className="flex h-screen overflow-hidden bg-muted/20">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <OwnerSidebar />
      </div>

      {/* Main Column */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top Header */}
        <OwnerHeader
          fullName={fullName}
          email={email}
          avatarUrl={avatarUrl}
        />

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
