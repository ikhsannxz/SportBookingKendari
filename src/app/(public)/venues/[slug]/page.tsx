import { notFound } from 'next/navigation'
import { format, parseISO } from 'date-fns'
import { id } from 'date-fns/locale'
import Image from 'next/image'
import { MapPin, Star, Check, ExternalLink } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { getVenueBySlug } from '@/lib/supabase/queries/venues'
import { BookingWidget } from '@/components/public/booking-widget'
import { getVenueImage, translateFacility, getGoogleMapsUrl } from '@/lib/utils'
import { getFavoritesAction } from '@/app/actions/favorites'
import { FavoriteButton } from '@/components/customer/favorite-button'
import { ReviewList } from '@/components/public/review-list'
import { ReviewSummary } from '@/components/public/review-summary'
import { getVenueReviews } from '@/app/actions/reviews'
import Link from 'next/link'

export default async function VenueDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const venue = await getVenueBySlug(slug)

  if (!venue) {
    notFound()
  }

  const primaryImage = getVenueImage(venue.venue_images)
  const otherImages = venue.venue_images?.filter(img => img.url !== primaryImage).slice(0, 4) || []
  const favorites = await getFavoritesAction()
  const isFavorite = favorites.includes(venue.id)
  const reviews = await getVenueReviews(venue.id)

  return (
    <div className="container mx-auto px-4 py-8">
      {venue.status === 'maintenance' && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-6 rounded-md">
          <p className="font-bold text-lg mb-1 flex items-center gap-2">⚠️ Venue Sedang Dalam Perawatan</p>
          {(venue.maintenance_reason || venue.maintenance_until) && (
            <div className="mt-3 text-sm space-y-1">
              {venue.maintenance_reason && (
                <p><span className="font-semibold">Alasan:</span> {venue.maintenance_reason}</p>
              )}
              {venue.maintenance_until && (
                <p><span className="font-semibold">Estimasi Selesai:</span> {format(parseISO(venue.maintenance_until), 'd MMMM yyyy', { locale: id })}</p>
              )}
            </div>
          )}
          {!venue.maintenance_reason && !venue.maintenance_until && (
             <p className="font-medium mt-2">Pemesanan sementara tidak tersedia.</p>
          )}
        </div>
      )}
      {/* Title & Meta */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-2">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">{venue.name}</h1>
          <FavoriteButton venueId={venue.id} initialIsFavorite={isFavorite} variant="text" />
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1 text-primary font-medium">
            <Star className="w-4 h-4 fill-current" />
            <span>{venue.rating_avg > 0 ? venue.rating_avg.toFixed(1) : 'Baru'} ({venue.review_count} ulasan)</span>
          </div>
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4" />
            <span>{venue.address}, {venue.district}, {venue.city}</span>
          </div>
          <Badge variant="secondary" className="capitalize">{venue.sport_type}</Badge>
        </div>
      </div>

      {/* Image Gallery */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-10 h-[300px] sm:h-[400px] rounded-2xl overflow-hidden">
        <div className="md:col-span-2 bg-muted relative h-full">
           {primaryImage ? (
             <Image unoptimized src={primaryImage} alt={venue.name} fill className="object-cover" />
           ) : (
             <div className="absolute inset-0 flex items-center justify-center">Tidak Ada Gambar</div>
           )}
        </div>
        
        {/* Additional Images (up to 4) */}
        <div className="hidden md:grid grid-rows-2 gap-2 h-full">
           <div className="bg-muted relative">
             {otherImages[0] && <Image unoptimized src={otherImages[0].url} alt={venue.name} fill className="object-cover" />}
           </div>
           <div className="bg-muted relative">
             {otherImages[1] && <Image unoptimized src={otherImages[1].url} alt={venue.name} fill className="object-cover" />}
           </div>
        </div>
        <div className="hidden md:grid grid-rows-2 gap-2 h-full">
           <div className="bg-muted relative">
             {otherImages[2] && <Image unoptimized src={otherImages[2].url} alt={venue.name} fill className="object-cover" />}
           </div>
           <div className="bg-muted relative">
             {otherImages[3] && <Image unoptimized src={otherImages[3].url} alt={venue.name} fill className="object-cover" />}
           </div>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-10 relative">
        {/* Main Content */}
        <div className="flex-1 space-y-8">
          <section>
            <h2 className="text-2xl font-bold mb-4">Tentang Venue Ini</h2>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-muted overflow-hidden relative shrink-0">
                {venue.profiles?.avatar_url ? (
                  <Image unoptimized src={venue.profiles.avatar_url} alt={venue.profiles.full_name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-semibold">
                    {venue.profiles?.full_name?.substring(0, 2).toUpperCase() || 'O'}
                  </div>
                )}
              </div>
              <div>
                <p className="font-medium leading-none">Dikelola oleh {venue.profiles?.full_name || 'Pemilik'}</p>
                <p className="text-sm text-muted-foreground mt-1">Pemilik</p>
              </div>
            </div>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {venue.description || 'Belum ada deskripsi untuk venue ini.'}
            </p>
          </section>

          <Separator />

          <section>
            <h2 className="text-2xl font-bold mb-4">Fasilitas</h2>
            {venue.venue_facilities && venue.venue_facilities.length > 0 ? (
              <div className="grid grid-cols-2 gap-4">
                {venue.venue_facilities.map((fac) => (
                  <div key={fac.name} className="flex items-center gap-2">
                    <Check className="w-5 h-5 text-green-500 shrink-0" />
                    <span>{translateFacility(fac.name)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">Belum ada fasilitas.</p>
            )}
          </section>

          <Separator />

          <section>
            <h2 className="text-2xl font-bold mb-4">Jam Operasional</h2>
            <div className="grid gap-2 text-sm max-w-sm">
              {['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'].map((dayName, idx) => {
                const daySchedule = venue.schedules?.find(s => s.day_of_week === idx)
                return (
                  <div key={dayName} className="flex justify-between items-center py-2 border-b last:border-0">
                    <span className="font-medium">{dayName}</span>
                    {daySchedule && !daySchedule.is_closed ? (
                      <span className="text-muted-foreground">{daySchedule.open_time.substring(0,5)} - {daySchedule.close_time.substring(0,5)}</span>
                    ) : (
                      <span className="text-red-500 font-medium">Tutup</span>
                    )}
                  </div>
                )
              })}
            </div>
          </section>

          <Separator />

          <section>
            <h2 className="text-2xl font-bold mb-4">Lokasi Venue</h2>
            <div className="flex flex-col gap-3">
              <div className="flex items-start gap-2">
                <MapPin className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="font-medium text-lg">{venue.address}</p>
                  <p className="text-muted-foreground">{venue.district}, {venue.city}</p>
                </div>
              </div>
              
              {(() => {
                const mapsUrl = getGoogleMapsUrl(venue)
                if (mapsUrl) {
                  return (
                    <Button variant="outline" className="w-fit gap-2 mt-2" asChild>
                      <a href={mapsUrl} target="_blank" rel="noopener noreferrer">
                        <MapPin className="w-4 h-4" />
                        Buka di Google Maps
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </Button>
                  )
                }
                return null
              })()}
            </div>
          </section>

          <Separator />

          <section>
            <h2 className="text-2xl font-bold mb-4">Ulasan Pelanggan</h2>
            <div className="space-y-6">
              <ReviewSummary reviews={reviews} />
              <ReviewList reviews={reviews.slice(0, 3)} />
              {reviews.length > 3 && (
                <div className="flex justify-center pt-2">
                  <Button variant="outline" asChild className="w-full sm:w-auto">
                    <Link href={`/venues/${venue.slug}/reviews`}>
                      Lihat Semua Ulasan
                    </Link>
                  </Button>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Sticky Booking Widget */}
        <div className="w-full lg:w-[380px]">
          <BookingWidget venueId={venue.id} pricePerHour={venue.price_per_hour} status={venue.status} />
        </div>
      </div>
    </div>
  )
}
