export const dynamic = 'force-dynamic'
export const revalidate = 0

import Link from 'next/link'
import { Filter, MapPin, Star, ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { searchVenues } from '@/lib/supabase/queries/venues'
import Image from 'next/image'
import { getVenueImage } from '@/lib/utils'
import { SortSelect } from './sort-select'
import { EmptyState } from '@/components/ui/empty-state'
import { StatusBadge } from '@/components/ui/status-badge'
import { Search } from 'lucide-react'
import { getFavoritesAction } from '@/app/actions/favorites'
import { FavoriteButton } from '@/components/customer/favorite-button'

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const sport = typeof params.sport === 'string' ? params.sport : undefined
  const city = typeof params.city === 'string' ? params.city : undefined
  const q = typeof params.q === 'string' ? params.q : undefined
  const rawMin = typeof params.minPrice === 'string' && params.minPrice ? parseInt(params.minPrice) : undefined
  const minPrice = rawMin !== undefined && !isNaN(rawMin) ? rawMin : undefined
  
  const rawMax = typeof params.maxPrice === 'string' && params.maxPrice ? parseInt(params.maxPrice) : undefined
  const maxPrice = rawMax !== undefined && !isNaN(rawMax) ? rawMax : undefined
  const sortBy = typeof params.sortBy === 'string' ? params.sortBy : undefined

  const venues = await searchVenues({ sport, city, minPrice, maxPrice, q, sortBy })
  const favorites = await getFavoritesAction()
  const favoriteSet = new Set(favorites)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Filters Sidebar (Desktop) / Top (Mobile) */}
        <aside className="w-full lg:w-64 flex-shrink-0 space-y-6">
          <form action="/search" method="GET">
            {/* Preserve sort order when submitting filters */}
            {sortBy && <input type="hidden" name="sortBy" value={sortBy} />}
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Filter className="w-5 h-5" /> Filter
            </h2>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Kata Kunci</label>
                <Input name="q" placeholder="Cari nama venue, olahraga, atau lokasi..." defaultValue={q ?? ""} />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Cabang Olahraga</label>
                <select name="sport" className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm" defaultValue={sport || ''}>
                  <option value="">Semua Olahraga</option>
                  <option value="futsal">Futsal</option>
                  <option value="badminton">Badminton</option>
                  <option value="basketball">Basket</option>
                  <option value="tennis">Tenis</option>
                </select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Lokasi</label>
                <Input name="city" placeholder="Masukkan kota atau kecamatan" defaultValue={city ?? ""} />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Rentang Harga</label>
                <div className="flex items-center gap-2">
                  <Input name="minPrice" type="number" placeholder="Min" defaultValue={minPrice ?? ""} />
                  <span>-</span>
                  <Input name="maxPrice" type="number" placeholder="Maks" defaultValue={maxPrice ?? ""} />
                </div>
              </div>
            </div>
            <Button type="submit" className="w-full mt-6">Terapkan Filter</Button>
          </form>
        </aside>

        {/* Search Results */}
        <div className="flex-1 space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold tracking-tight">Menampilkan {venues.length} venue</h1>
            <SortSelect />
          </div>

          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {venues.map((venue) => {
              const primaryImage = getVenueImage(venue.venue_images)

              return (
                <Card key={venue.id} className="overflow-hidden group hover:shadow-md transition-shadow cursor-pointer flex flex-col">
                  <Link href={`/venues/${venue.slug}`} className="flex-1 flex flex-col">
                    <div className="aspect-[4/3] bg-muted relative flex items-center justify-center">
                      <div className="absolute inset-0 bg-primary/5 group-hover:bg-transparent transition-colors z-10" />
                      {primaryImage ? (
                        <Image unoptimized src={primaryImage} alt={venue.name} fill className="object-cover" />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-muted-foreground/30" />
                      )}
                      <FavoriteButton 
                        venueId={venue.id}
                        initialIsFavorite={favoriteSet.has(venue.id)}
                        className="absolute top-2 right-2 w-8 h-8 bg-black/20 hover:bg-black/40 border border-white/20 text-white backdrop-blur-md"
                      />
                    </div>
                    <CardContent className="p-4 flex-1 flex flex-col">
                      <div className="flex justify-between items-start mb-2 gap-2">
                        <div className="flex flex-col gap-1">
                           <h3 className="font-semibold text-lg line-clamp-1">{venue.name}</h3>
                           {venue.status === 'maintenance' && (
                             <StatusBadge status="maintenance" className="w-fit text-[10px] uppercase" />
                           )}
                        </div>
                        <div className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-0.5 rounded text-sm font-medium shrink-0">
                          <Star className="w-3.5 h-3.5 fill-current" />
                          <span>{venue.rating_avg > 0 ? venue.rating_avg.toFixed(1) : 'New'}</span>
                        </div>
                      </div>
                      <div className="flex items-center text-sm text-muted-foreground mb-2">
                        <MapPin className="w-4 h-4 mr-1 shrink-0" />
                        <span className="line-clamp-1">{venue.address}, {venue.district}</span>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-4">
                        <Badge variant="secondary" className="text-xs font-normal capitalize">{venue.sport_type}</Badge>
                      </div>
                      <div className="mt-auto pt-4 border-t flex justify-between items-end">
                        <div>
                          <span className="text-xs text-muted-foreground block">Mulai dari</span>
                          <span className="font-bold">Rp {venue.price_per_hour.toLocaleString('id-ID')}<span className="text-sm font-normal text-muted-foreground"> per jam</span></span>
                        </div>
                        <Button size="sm" variant="outline">Booking Sekarang</Button>
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              )
            })}
            
            {venues.length === 0 && (
              <div className="col-span-full">
                <EmptyState
                  icon="search"
                  title="Belum Ada Venue"
                  description="Tidak ada venue ditemukan. Coba ubah filter pencarian Anda."
                  actionLabel="Hapus Filter"
                  actionHref="/search"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
