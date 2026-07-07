import { getAdminStats, getAdminRecentBookings, getAdminPendingPayments, getAdminRecentVenues } from '@/lib/supabase/queries/admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Store, CalendarDays, CreditCard, Banknote, MapPin } from 'lucide-react'
import { formatCurrency, formatDate } from '@/lib/utils'

export const metadata = {
  title: 'Admin Dashboard',
}

export default async function AdminDashboardPage() {
  const stats = await getAdminStats()
  const recentBookings = await getAdminRecentBookings()
  const pendingPayments = await getAdminPendingPayments()
  const recentVenues = await getAdminRecentVenues()

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Admin Dashboard</h2>
        <p className="text-muted-foreground mt-1">Platform overview and general metrics.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pengguna</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pemilik Lapangan</CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOwners}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Venue</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVenues}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Booking</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBookings}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pendapatan</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pembayaran Pending</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pendingPayments}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Booking Terbaru */}
        <Card className="col-span-1 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base font-bold">Booking Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentBookings.length === 0 ? (
                <p className="text-sm text-slate-500">Belum ada booking.</p>
              ) : (
                recentBookings.map(b => (
                  <div key={b.id} className="flex justify-between items-center text-sm border-b pb-2 last:border-0">
                    <div>
                      <p className="font-semibold">{b.profiles?.full_name}</p>
                      <p className="text-xs text-slate-500">{b.venues?.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(b.total_price)}</p>
                      <p className="text-xs text-slate-500">{b.status}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pembayaran Pending */}
        <Card className="col-span-1 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base font-bold">Pembayaran Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingPayments.length === 0 ? (
                <p className="text-sm text-slate-500">Tidak ada pembayaran pending.</p>
              ) : (
                pendingPayments.map(p => (
                  <div key={p.id} className="flex justify-between items-center text-sm border-b pb-2 last:border-0">
                    <div>
                      <p className="font-semibold">{p.bookings?.profiles?.full_name}</p>
                      <p className="text-xs text-slate-500">{p.bookings?.venues?.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{formatCurrency(p.amount)}</p>
                      <p className="text-xs text-amber-600 font-semibold">{p.status}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Venue Terbaru */}
        <Card className="col-span-1 lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base font-bold">Venue Terbaru</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentVenues.length === 0 ? (
                <p className="text-sm text-slate-500">Belum ada venue.</p>
              ) : (
                recentVenues.map(v => (
                  <div key={v.id} className="flex justify-between items-center text-sm border-b pb-2 last:border-0">
                    <div>
                      <p className="font-semibold">{v.name}</p>
                      <p className="text-xs text-slate-500">{v.city}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{v.sport_type}</p>
                      <p className="text-xs text-slate-500">{v.status}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
