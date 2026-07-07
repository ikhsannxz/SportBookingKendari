import { Store, CalendarDays, Activity, Banknote, CreditCard, Clock, CheckCircle2, TrendingUp, CheckSquare } from 'lucide-react'
import { StatsCard } from '@/components/owner/stats-card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { getOwnerDashboardStats } from '@/lib/supabase/queries/venues'
import { getOwnerBookingStats } from '@/lib/supabase/queries/bookings'
import { getOwnerAnalytics } from '@/lib/supabase/queries/analytics'
import { expireUnpaidBookings } from '@/app/actions/bookings'

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

export default async function OwnerDashboardPage() {
  await expireUnpaidBookings()
  const [stats, bookingStats, analytics] = await Promise.all([
    getOwnerDashboardStats(),
    getOwnerBookingStats(),
    getOwnerAnalytics()
  ])

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8 space-y-8">
      
      {/* Header & Quick Actions */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Ringkasan Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Inilah yang terjadi dengan venue Anda hari ini.
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/owner/venues/new">Tambah Venue Baru</Link>
          </Button>
        </div>
      </div>

      {/* Primary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="Total Venue"
          value={stats.total}
          icon={Store}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
        />
        <StatsCard
          label="Aktif & Disetujui"
          value={stats.active}
          icon={Activity}
          iconBg="bg-green-100"
          iconColor="text-green-600"
        />
        <StatsCard
          label="Venue Draft"
          value={stats.draft}
          icon={CalendarDays}
          iconBg="bg-gray-100"
          iconColor="text-gray-600"
        />
        <StatsCard
          label="Menunggu Persetujuan"
          value={stats.pending}
          icon={Activity}
          iconBg="bg-amber-100"
          iconColor="text-amber-600"
        />
      </div>

      {/* Booking Metrics */}
      <h2 className="text-xl font-bold tracking-tight mt-8 mb-4">Ringkasan Booking</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <StatsCard
          label="Booking Hari Ini"
          value={bookingStats.today}
          icon={CalendarDays}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
        />
        <StatsCard
          label="Booking Menunggu"
          value={bookingStats.pending}
          icon={Activity}
          iconBg="bg-orange-100"
          iconColor="text-orange-600"
        />
      </div>

      {/* Revenue & Analytics Metrics */}
      <h2 className="text-xl font-bold tracking-tight mt-8 mb-4">Analitik Pendapatan</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <StatsCard
          label="Total Pendapatan"
          value={formatCurrency(analytics.totalRevenue)}
          icon={Banknote}
          iconBg="bg-green-100"
          iconColor="text-green-600"
        />
        <StatsCard
          label="Pendapatan Hari Ini"
          value={formatCurrency(analytics.revenueToday)}
          icon={TrendingUp}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
        />
        <StatsCard
          label="Pendapatan Bulan Ini"
          value={formatCurrency(analytics.revenueThisMonth)}
          icon={CreditCard}
          iconBg="bg-purple-100"
          iconColor="text-purple-600"
        />
        <StatsCard
          label="Rata-rata Nilai Booking"
          value={formatCurrency(analytics.averageBookingValue)}
          icon={Banknote}
          iconBg="bg-emerald-100"
          iconColor="text-emerald-600"
        />
        <StatsCard
          label="Pembayaran Terverifikasi"
          value={analytics.verifiedPayments}
          icon={CheckCircle2}
          iconBg="bg-emerald-100"
          iconColor="text-emerald-600"
        />
        <StatsCard
          label="Pembayaran Menunggu"
          value={analytics.pendingPayments}
          icon={Clock}
          iconBg="bg-orange-100"
          iconColor="text-orange-600"
        />
        <StatsCard
          label="Booking Selesai"
          value={analytics.completedBookings}
          icon={CheckSquare}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
        />
      </div>

    </div>
  )
}
