import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ProfileHeader } from '@/components/profile/profile-header'
import { ProfileForm } from '@/components/profile/profile-form'
import { SecurityForm } from '@/components/profile/security-form'
import { CustomerStats } from '@/components/profile/customer-stats'
import { ActivityList } from '@/components/profile/activity-list'
import { getProfileStats, getRecentCustomerBookings } from '@/lib/supabase/queries/profile'

export default async function CustomerProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/auth/login')
  }

  const stats = await getProfileStats(user.id, 'customer') as { totalBookings: number; completedBookings: number; totalSpent: number }
  const recentBookings = await getRecentCustomerBookings(user.id)

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Akun Saya</h1>
        <p className="text-muted-foreground mt-1">
          Kelola profil dan preferensi akun Anda.
        </p>
      </div>

      <ProfileHeader profile={profile} />

      <Tabs defaultValue="profil" className="w-full">
        <TabsList className="w-full justify-start border-b rounded-none bg-transparent h-auto p-0 space-x-6 overflow-x-auto">
          <TabsTrigger 
            value="profil" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-2 py-3"
          >
            Profil
          </TabsTrigger>
          <TabsTrigger 
            value="keamanan" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-2 py-3"
          >
            Keamanan
          </TabsTrigger>
          <TabsTrigger 
            value="aktivitas" 
            className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-2 py-3"
          >
            Aktivitas
          </TabsTrigger>
        </TabsList>
        
        <div className="pt-6">
          <TabsContent value="profil" className="mt-0">
            <ProfileForm profile={profile} />
          </TabsContent>
          
          <TabsContent value="keamanan" className="mt-0">
            <SecurityForm />
          </TabsContent>
          
          <TabsContent value="aktivitas" className="mt-0 space-y-6">
            <CustomerStats stats={stats || { totalBookings: 0, completedBookings: 0, totalSpent: 0 }} />
            <ActivityList role="customer" recentBookings={recentBookings || []} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}

