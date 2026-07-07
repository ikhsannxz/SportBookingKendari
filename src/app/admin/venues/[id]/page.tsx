import { getAdminVenueById } from '@/lib/supabase/queries/admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, MapPin, Store, User, Phone, CheckCircle2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import Image from 'next/image'
import { VenueActionButtons } from '../venue-action-buttons'

export const metadata = {
  title: 'Detail Venue - Admin',
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function AdminVenueDetailPage({ params }: PageProps) {
  const { id } = await params
  const venue = await getAdminVenueById(id)

  if (!venue) {
    notFound()
  }

  const primaryImage = venue.venue_images?.find((img: any) => img.is_primary)
  const fallbackImage = venue.venue_images?.[0]
  const displayImage = primaryImage?.url || fallbackImage?.url || 'https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=1200&auto=format&fit=crop&q=80'

  return (
    <div className="p-6 md:p-8 space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/admin/venues">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Detail Venue</h2>
            <p className="text-muted-foreground mt-1 text-sm">Lihat informasi lengkap fasilitas olahraga.</p>
          </div>
        </div>
        <div className="w-[300px]">
          <VenueActionButtons venueId={venue.id} venueName={venue.name} status={venue.status} />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Gambar Venue */}
        <Card className="md:col-span-3 overflow-hidden border-0 shadow-sm rounded-xl">
          <div className="relative h-[300px] md:h-[400px] w-full bg-slate-100">
            <Image
              src={displayImage}
              alt={venue.name}
              fill
              className="object-cover"
            />
            <div className="absolute top-4 right-4">
              <Badge variant="secondary" className="bg-white/90 text-black border-0 shadow-sm font-semibold capitalize text-sm px-3 py-1">
                Status: {venue.status}
              </Badge>
            </div>
          </div>
        </Card>

        {/* Informasi Utama */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Informasi Venue</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className="text-xl font-bold">{venue.name}</h3>
              <p className="text-muted-foreground text-sm mt-1 max-w-xl">{venue.description || 'Tidak ada deskripsi.'}</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground uppercase font-semibold">Tipe Olahraga</span>
                <div className="flex items-center gap-2">
                  <Store className="h-4 w-4 text-emerald-600" />
                  <span className="font-medium capitalize">{venue.sport_type}</span>
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground uppercase font-semibold">Harga Sewa / Jam</span>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-emerald-600 text-lg">{formatCurrency(venue.price_per_hour)}</span>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs text-muted-foreground uppercase font-semibold">Alamat Lengkap</span>
              <div className="flex items-start gap-2 text-sm">
                <MapPin className="h-4 w-4 text-rose-500 shrink-0 mt-0.5" />
                <span>
                  {venue.address}<br />
                  {venue.district}, {venue.city}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-xs text-muted-foreground uppercase font-semibold">Fasilitas</span>
              <div className="flex flex-wrap gap-2">
                {venue.venue_facilities && venue.venue_facilities.length > 0 ? (
                  venue.venue_facilities.map((fac: any) => (
                    <Badge key={fac.id} variant="outline" className="bg-slate-50">
                      <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-500" />
                      {fac.name}
                    </Badge>
                  ))
                ) : (
                  <span className="text-sm text-slate-500">Tidak ada data fasilitas.</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Informasi Owner & Jadwal */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informasi Mitra (Owner)</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-100 p-2 rounded-full text-blue-600">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-sm">{venue.profiles?.full_name || 'Tidak ada nama'}</p>
                  <p className="text-xs text-muted-foreground">{venue.profiles?.email}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-full text-green-600">
                  <Phone className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-sm">{venue.profiles?.phone || 'Tidak ada nomor telepon'}</p>
                  <p className="text-xs text-muted-foreground">Kontak Owner</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Jadwal Operasional</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                {venue.schedules && venue.schedules.length > 0 ? (
                  venue.schedules.map((oh: any) => {
                    const DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']
                    const dayName = typeof oh.day_of_week === 'number' ? DAYS[oh.day_of_week] : oh.day_of_week
                    return (
                      <div key={oh.id} className="flex justify-between items-center border-b pb-1 last:border-0 last:pb-0">
                        <span className="capitalize font-medium w-16">{dayName}</span>
                        {oh.is_closed ? (
                          <span className="text-rose-500 font-semibold text-xs">Tutup</span>
                        ) : (
                          <span className="text-slate-600">
                            {oh.open_time.slice(0, 5)} - {oh.close_time.slice(0, 5)}
                          </span>
                        )}
                      </div>
                    )
                  })
                ) : (
                  <p className="text-slate-500">Jadwal belum diatur.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
