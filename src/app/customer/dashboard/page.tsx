/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from 'next/link'
import { redirect } from 'next/navigation'
import {
  CalendarDays,
  Heart,
  Search,
  MapPin,
  Zap,
  Activity,
  CreditCard,
  CheckCircle2,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/ui/status-badge'
import { Card, CardContent } from '@/components/ui/card'
import { StatsCard } from '@/components/customer/stats-card'
import { DashboardCard, type DashboardCardItem } from '@/components/customer/dashboard-card'
import { getCustomerDashboardStats, getCustomerBookings } from '@/lib/supabase/queries/bookings'
import { getFeaturedVenues } from '@/lib/supabase/queries/venues'
import { format } from 'date-fns'
import { getVenueImage } from '@/lib/utils'
import { expireUnpaidBookings } from '@/app/actions/bookings'
import { EmptyState } from '@/components/ui/empty-state'

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getFirstName(fullName: string): string {
  return fullName.split(' ')[0] || 'there'
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function CustomerDashboardPage() {
  await expireUnpaidBookings()
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const fullName = profile?.full_name || user.user_metadata?.full_name || 'Customer'
  const firstName = getFirstName(fullName)

  const [stats, dbRecommendedVenues, allBookings] = await Promise.all([
    getCustomerDashboardStats(),
    getFeaturedVenues(4),
    getCustomerBookings()
  ])

  const popularSports = [
    { name: 'Futsal', icon: Activity, color: 'bg-emerald-100 text-emerald-600' },
    { name: 'Badminton', icon: Zap, color: 'bg-blue-100 text-blue-600' },
    { name: 'Basketball', icon: Zap, color: 'bg-orange-100 text-orange-600' },
    { name: 'Tennis', icon: Activity, color: 'bg-purple-100 text-purple-600' },
  ]

  const recommendedVenues: DashboardCardItem[] = dbRecommendedVenues.map(v => ({
    id: v.id,
    title: v.name,
    subtitle: `${v.sport_type} · ${v.district}`,
    meta: `${v.rating_avg} ★`,
    image: getVenueImage(v.venue_images),
    initials: v.name.substring(0, 2).toUpperCase(),
    href: `/venues/${v.slug}`,
  }))

  const recentBookings: DashboardCardItem[] = allBookings.slice(0, 4).map(b => ({
    id: b.id,
    title: (b.venues as any).name,
    subtitle: format(new Date(b.booking_date), 'MMM dd, yyyy'),
    meta: b.status,
    image: getVenueImage((b.venues as any).venue_images),
    initials: (b.venues as any).name.substring(0, 2).toUpperCase(),
    href: `/customer/bookings/${b.id}`,
  }))

  // Fetch the next upcoming booking
  const today = new Date().toISOString().split('T')[0]
  const { data: upcomingBookings } = await supabase
    .from('bookings')
    .select('id, booking_date, start_time, end_time, status, venues(name, district, city, sport_type, venue_images(url, is_primary)), payments(id, status, proof_url)')
    .eq('customer_id', user.id)
    .in('status', ['pending', 'confirmed'])
    .gte('booking_date', today)
    .order('booking_date', { ascending: true })
    .order('start_time', { ascending: true })
    .limit(1)

  const nextBooking = upcomingBookings?.[0]
  
  console.log('Dashboard Booking:', nextBooking)
  console.log('Dashboard Payment:', nextBooking?.payments)

  const venue: any = nextBooking?.venues
  const nextBookingImage = getVenueImage(venue?.venue_images)
  
  // Ensure we get the status from the first payment in the array if it's an array, or directly if it's an object
  const paymentStatus = Array.isArray(nextBooking?.payments) 
    ? nextBooking?.payments[0]?.status 
    : (nextBooking?.payments as any)?.status

  return (
    <div className="container max-w-6xl mx-auto px-4 py-6 md:py-8 space-y-8">
      
      {/* ── Hero Section (Airbnb/Traveloka Style) ────────────────────────── */}
      <section className="relative rounded-3xl bg-primary overflow-hidden px-6 py-10 md:py-16 text-primary-foreground shadow-lg">
        {/* Abstract background blobs */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4" />
        
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-3xl md:text-5xl font-bold tracking-tight mb-2">
            Selamat Datang Kembali, {firstName}!
          </h1>
          <p className="text-primary-foreground/80 text-base md:text-lg mb-8">
            Mau main di mana hari ini?
          </p>

          {/* Search Card */}
          <div className="bg-background rounded-2xl p-2 md:p-3 shadow-xl flex flex-col md:flex-row gap-3">
            <div className="relative flex-1 flex items-center">
              <Search className="absolute left-3 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Cari olahraga, venue, atau lokasi..."
                className="pl-10 h-12 md:h-14 border-none text-foreground text-base shadow-none focus-visible:ring-0 bg-transparent"
              />
            </div>
            <Button size="lg" asChild className="h-12 md:h-14 rounded-xl px-8 text-base shrink-0">
              <Link href="/search">Booking Venue</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* ── Quick Actions (Mobile First) ──────────────────────────────────── */}
      <section className="grid grid-cols-3 gap-3 md:hidden">
        <Link href="/search" className="flex flex-col items-center gap-2 p-4 bg-background rounded-2xl shadow-sm hover:bg-muted/50 transition-colors">
          <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
            <Search className="w-5 h-5" />
          </div>
          <span className="text-xs font-medium text-center">Cari Venue</span>
        </Link>
        <Link href="/customer/bookings" className="flex flex-col items-center gap-2 p-4 bg-background rounded-2xl shadow-sm hover:bg-muted/50 transition-colors">
          <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <CalendarDays className="w-5 h-5" />
          </div>
          <span className="text-xs font-medium text-center">Booking Saya</span>
        </Link>
        <Link href="/customer/favorites" className="flex flex-col items-center gap-2 p-4 bg-background rounded-2xl shadow-sm hover:bg-muted/50 transition-colors">
          <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center">
            <Heart className="w-5 h-5" />
          </div>
          <span className="text-xs font-medium text-center">Favorit</span>
        </Link>
      </section>

      {/* ── Main Dashboard Content ────────────────────────────────────────── */}
      <div className="grid md:grid-cols-12 gap-8">
        
        {/* Left Column (Stats & Upcoming) */}
        <div className="md:col-span-8 space-y-8">
          
          {/* Stats Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              label="Booking Mendatang"
              value={stats.upcoming}
              icon={CalendarDays}
              iconBg="bg-blue-50"
              iconColor="text-blue-600"
            />
            <StatsCard
              label="Booking Selesai"
              value={stats.completed}
              icon={CheckCircle2}
              iconBg="bg-emerald-50"
              iconColor="text-emerald-600"
            />
            <StatsCard
              label="Favorit"
              value={(stats as any).favorites || 0}
              icon={Heart}
              iconBg="bg-rose-50"
              iconColor="text-rose-500"
            />
            <StatsCard
              label="Total Pengeluaran"
              value={`Rp ${(stats as any).totalSpent?.toLocaleString('id-ID') || 0}`}
              icon={CreditCard}
              iconBg="bg-amber-50"
              iconColor="text-amber-600"
            />
          </div>

          {/* Upcoming Booking Prominent Card */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold tracking-tight">Pertandingan Selanjutnya</h2>
              <Button variant="link" asChild className="h-auto p-0">
                <Link href="/customer/bookings">Lihat Semua</Link>
              </Button>
            </div>
            {nextBooking ? (
              <Card className="overflow-hidden border-primary/20 shadow-md">
                <div className="flex flex-col sm:flex-row">
                  {/* Image */}
                  <div className="h-48 sm:h-auto sm:w-1/3 bg-muted relative">
                    {nextBookingImage ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={nextBookingImage}
                        alt={venue?.name}
                        className="absolute inset-0 w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center bg-muted text-muted-foreground">Tidak Ada Gambar</div>
                    )}
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-white/90 text-black hover:bg-white border-none shadow-sm backdrop-blur-md capitalize">
                        {venue?.sport_type}
                      </Badge>
                    </div>
                  </div>
                  {/* Content */}
                  <CardContent className="p-6 flex-1 flex flex-col justify-center bg-card">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-2xl font-bold mb-1">{venue?.name}</h3>
                        <p className="text-muted-foreground flex items-center gap-1.5">
                          <MapPin className="w-4 h-4" /> {venue?.district}, {venue?.city}
                        </p>
                      </div>
                      <div className="flex flex-col gap-2 items-end">
                        <StatusBadge status={nextBooking.status} />
                        {paymentStatus && (
                          <StatusBadge status={paymentStatus} />
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-6 p-4 rounded-2xl bg-muted/50">
                      <div>
                        <p className="text-xs text-muted-foreground font-medium mb-1 uppercase tracking-wider">Tanggal</p>
                        <p className="font-semibold">{format(new Date(nextBooking.booking_date), 'dd MMM yyyy')}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium mb-1 uppercase tracking-wider">Waktu</p>
                        <p className="font-semibold">{nextBooking.start_time.substring(0, 5)} - {nextBooking.end_time.substring(0, 5)}</p>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 mt-auto">
                      <Button className="flex-1" asChild>
                        <Link href={`/customer/bookings`}>Lihat Detail</Link>
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <MapPin className="w-4 h-4 mr-2" /> Dapatkan Arah
                      </Button>
                    </div>
                  </CardContent>
                </div>
              </Card>
            ) : (
              <EmptyState
                icon="calendar"
                title="Belum Ada Booking"
                description="Anda belum memiliki pertandingan yang dijadwalkan."
                actionLabel="Booking Venue"
                actionHref="/search"
              />
            )}
          </section>

          {/* Popular Sports Categories */}
          <section>
            <h2 className="text-xl font-bold tracking-tight mb-4">Eksplorasi per Olahraga</h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {popularSports.map((sport) => (
                <Link
                  key={sport.name}
                  href={`/search?sport=${sport.name.toLowerCase()}`}
                  className="flex flex-col items-center justify-center p-6 bg-background rounded-2xl border hover:border-primary hover:shadow-md transition-all group"
                >
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-3 ${sport.color} group-hover:scale-110 transition-transform`}>
                    <sport.icon className="w-6 h-6" />
                  </div>
                  <span className="font-semibold">{sport.name}</span>
                </Link>
              ))}
            </div>
          </section>

        </div>

        {/* Right Column (Sidebars) */}
        <div className="md:col-span-4 space-y-8">
          
          {/* Quick Actions (Desktop) */}
          <div className="hidden md:flex flex-col gap-3">
            <Button variant="secondary" className="w-full justify-start h-12 rounded-xl" asChild>
              <Link href="/customer/bookings">
                <CalendarDays className="w-5 h-5 mr-3 text-blue-600" />
                Booking Saya
              </Link>
            </Button>
            <Button variant="secondary" className="w-full justify-start h-12 rounded-xl" asChild>
              <Link href="/customer/favorites">
                <Heart className="w-5 h-5 mr-3 text-rose-500" />
                Favorit Tersimpan
              </Link>
            </Button>
          </div>

          <div className="space-y-6">
          {/* Recommended Venues */}
          <DashboardCard
            title="Rekomendasi Venue"
            description="Pilihan khusus untuk Anda"
            items={recommendedVenues}
            emptyIcon={Zap}
            emptyTitle="Belum Ada Rekomendasi"
            emptyDescription="Booking beberapa venue untuk mendapatkan saran personal."
            viewAllHref="/search"
            className="shadow-sm border"
          />

          {/* Recent Bookings */}
          <DashboardCard
            title="Booking Terbaru"
            items={recentBookings}
            emptyIcon={CalendarDays}
            emptyTitle="Belum Ada Booking"
            emptyDescription="Riwayat booking Anda akan muncul di sini."
            viewAllHref="/customer/bookings"
            className="shadow-sm border bg-muted/10"
          />
        </div>
        </div>
      </div>
    </div>
  )
}
