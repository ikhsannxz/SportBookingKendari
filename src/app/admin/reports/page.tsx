import { getAdminReports } from '@/lib/supabase/queries/admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils'
import { Trophy, Activity, Target } from 'lucide-react'

export const metadata = {
  title: 'Laporan Analitik - Admin',
}

export default async function AdminReportsPage() {
  const reports = await getAdminReports()

  if (!reports) {
    return <div className="p-8">Gagal memuat laporan.</div>
  }

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Laporan Analitik</h2>
        <p className="text-muted-foreground mt-1">Performa platform dan tren transaksi keseluruhan.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Venue</CardTitle>
            <Trophy className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold truncate">{reports.topVenueName}</div>
            <p className="text-xs text-muted-foreground mt-1">Berdasarkan total booking</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Olahraga Terpopuler</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold capitalize">{reports.mostBookedSport}</div>
            <p className="text-xs text-muted-foreground mt-1">Berdasarkan jumlah transaksi</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mitra Teraktif</CardTitle>
            <Target className="h-4 w-4 text-rose-500" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold truncate">{reports.mostActiveOwner}</div>
            <p className="text-xs text-muted-foreground mt-1">Pemilik dengan venue terbanyak dibooking</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Distribusi Venue (Berdasarkan Olahraga)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reports.venueDistribution.map((item) => (
                <div key={item.name} className="flex items-center justify-between">
                  <span className="capitalize font-medium">{item.name}</span>
                  <span className="text-muted-foreground">{item.value} venue</span>
                </div>
              ))}
              {reports.venueDistribution.length === 0 && (
                <div className="text-sm text-slate-500">Tidak ada data distribusi.</div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Tren Booking (7 Hari Terakhir)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reports.trendData.map((item) => (
                <div key={item.date} className="flex items-center justify-between border-b pb-2 last:border-0">
                  <span className="text-sm">{item.date}</span>
                  <div className="text-right">
                    <div className="font-medium">{item.bookings} Booking</div>
                    <div className="text-xs text-emerald-600 font-semibold">{formatCurrency(item.revenue)}</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
