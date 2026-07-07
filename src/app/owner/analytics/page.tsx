/* eslint-disable @typescript-eslint/no-explicit-any */
import { Star, Store, Activity, CalendarDays, Ban, MessageSquare, CreditCard, Banknote, Clock, CheckCircle2 } from 'lucide-react'
import { StatsCard } from '@/components/owner/stats-card'
import { getOwnerVenueAnalytics, getOwnerChartData } from '@/lib/supabase/queries/analytics'
import { getOwnerPayments } from '@/lib/supabase/queries/payments'
import { AnalyticsCharts } from '@/components/owner/analytics-charts'

export default async function OwnerAnalyticsPage() {
  const stats = await getOwnerVenueAnalytics()
  const payments = await getOwnerPayments()
  const chartData = await getOwnerChartData()

  const pendingPayments = payments.filter((p: any) => p.status === 'pending').length
  const verifiedPayments = payments.filter((p: any) => p.status === 'verified').length

  const today = new Date().toISOString().split('T')[0]
  const currentMonth = today.substring(0, 7)

  const todaysRevenue = payments
    .filter((p: any) => p.status === 'verified' && p.created_at.startsWith(today))
    .reduce((sum: number, p: any) => sum + Number(p.amount), 0)

  const monthlyRevenue = payments
    .filter((p: any) => p.status === 'verified' && p.created_at.startsWith(currentMonth))
    .reduce((sum: number, p: any) => sum + Number(p.amount), 0)

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analitik</h1>
        <p className="text-muted-foreground mt-1">
          Wawasan terperinci mengenai performa bisnis Anda.
        </p>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          label="Total Venue"
          value={stats.total}
          icon={Store}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
        />
        <StatsCard
          label="Venue Disetujui"
          value={stats.active}
          icon={Activity}
          iconBg="bg-green-100"
          iconColor="text-green-600"
        />
        <StatsCard
          label="Venue Menunggu"
          value={stats.pending}
          icon={CalendarDays}
          iconBg="bg-amber-100"
          iconColor="text-amber-600"
        />
        <StatsCard
          label="Venue Ditolak"
          value={stats.rejected}
          icon={Ban}
          iconBg="bg-red-100"
          iconColor="text-red-600"
        />
        <StatsCard
          label="Venue Draft"
          value={stats.draft}
          icon={Store}
          iconBg="bg-gray-100"
          iconColor="text-gray-600"
        />
        <StatsCard
          label="Rata-rata Rating"
          value={stats.avgRating.toFixed(1)}
          icon={Star}
          iconBg="bg-amber-100"
          iconColor="text-amber-500"
        />
        <StatsCard
          label="Total Ulasan"
          value={stats.totalReviews}
          icon={MessageSquare}
          iconBg="bg-blue-100"
          iconColor="text-blue-600"
        />
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold tracking-tight mb-4">Pembayaran & Pendapatan</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            label="Pembayaran Menunggu"
            value={pendingPayments}
            icon={Clock}
            iconBg="bg-orange-100"
            iconColor="text-orange-600"
          />
          <StatsCard
            label="Pembayaran Terverifikasi"
            value={verifiedPayments}
            icon={CheckCircle2}
            iconBg="bg-emerald-100"
            iconColor="text-emerald-600"
          />
          <StatsCard
            label="Pendapatan Hari Ini"
            value={`Rp ${todaysRevenue.toLocaleString('id-ID')}`}
            icon={Banknote}
            iconBg="bg-blue-100"
            iconColor="text-blue-600"
          />
          <StatsCard
            label="Pendapatan Bulanan"
            value={`Rp ${monthlyRevenue.toLocaleString('id-ID')}`}
            icon={CreditCard}
            iconBg="bg-purple-100"
            iconColor="text-purple-600"
          />
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold tracking-tight mb-4">Ringkasan Total</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatsCard
            label="Total Pendapatan"
            value={`Rp ${chartData.totalRevenue.toLocaleString('id-ID')}`}
            icon={Banknote}
            iconBg="bg-green-100"
            iconColor="text-green-600"
          />
          <StatsCard
            label="Total Booking"
            value={chartData.totalBookings}
            icon={CalendarDays}
            iconBg="bg-blue-100"
            iconColor="text-blue-600"
          />
          <StatsCard
            label="Booking Bulan Ini"
            value={chartData.bookingsThisMonth}
            icon={Activity}
            iconBg="bg-purple-100"
            iconColor="text-purple-600"
          />
        </div>
      </div>

      <AnalyticsCharts 
        monthlyBookingData={chartData.monthlyBookingData} 
        monthlyRevenueData={chartData.monthlyRevenueData} 
      />

    </div>
  )
}
