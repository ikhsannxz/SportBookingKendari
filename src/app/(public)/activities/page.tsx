import { createClient } from '@/lib/supabase/server'
import { EmptyState } from '@/components/ui/empty-state'
import { getActivityFeed } from '@/lib/activity/get-activity-feed'
import { ActivityTimeline } from '@/components/activity/activity-timeline'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { CalendarDays } from 'lucide-react'

export default async function ActivitiesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Guest Mode
  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8 md:py-16 max-w-4xl min-h-[calc(100vh-16rem)] flex flex-col items-center text-center">
        <div className="mb-12">
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900">Aktivitas Booking</h1>
          <p className="text-slate-500 mt-4 text-lg max-w-2xl mx-auto">
            Lihat seluruh riwayat booking, pembayaran, dan aktivitas akun Anda dalam satu tempat.
          </p>
        </div>

        <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-3xl p-8 md:p-16 shadow-sm flex flex-col items-center">
          <div className="w-24 h-24 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-6">
            <CalendarDays className="w-12 h-12" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Belum Ada Aktivitas</h2>
          <p className="text-slate-500 mb-8 max-w-md">
            Masuk untuk melihat riwayat booking dan aktivitas akun Anda.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Button asChild size="lg" className="w-full sm:w-auto px-8 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full">
              <Link href="/auth/login">Masuk</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto px-8 rounded-full text-emerald-600 border-emerald-200 hover:bg-emerald-50">
              <Link href="/search">Cari Lapangan</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Authenticated Mode
  const activities = await getActivityFeed(user.id)

  return (
    <div className="container mx-auto px-4 py-8 md:py-12 max-w-3xl min-h-[calc(100vh-16rem)]">
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Aktivitas Saya</h1>
        <p className="text-slate-500 mt-2 text-lg">
          Pantau seluruh aktivitas booking dan pembayaran Anda.
        </p>
      </div>

      {activities.length === 0 ? (
        <EmptyState
          icon="calendar"
          title="Belum Ada Aktivitas"
          description="Anda belum memiliki riwayat booking. Mulai cari venue dan lakukan booking pertama Anda."
          actionLabel="Cari Venue"
          actionHref="/search"
        />
      ) : (
        <ActivityTimeline events={activities} />
      )}
    </div>
  )
}
