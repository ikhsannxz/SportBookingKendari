import Link from 'next/link'
import { Plus, Search, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { VenueCard, type VenueCardData } from '@/components/owner/venue-card'
import { EmptyState } from '@/components/ui/empty-state'
import { Store } from 'lucide-react'
import { getOwnerVenues } from '@/lib/supabase/queries/venues'
import { getVenueImage } from '@/lib/utils'

export default async function OwnerVenuesPage() {
  const venues = await getOwnerVenues()

  // Map database venues to the format expected by VenueCard
  const mappedVenues: VenueCardData[] = venues.map(v => {
    const imageUrl = getVenueImage(v.venue_images)

    return {
      id: v.id,
      slug: v.slug,
      name: v.name,
      sport: v.sport_type,
      location: `${v.district || ''}, ${v.city}`.replace(/^, /, ''),
      price: v.price_per_hour,
      rating: v.rating_avg,
      reviews: v.review_count,
      status: v.status,
      image: imageUrl,
    }
  })

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Venue Saya</h1>
          <p className="text-muted-foreground">Kelola venue dan fasilitas olahraga Anda.</p>
        </div>
        <Button asChild>
          <Link href="/owner/venues/new">
            <Plus className="h-4 w-4 mr-2" /> Tambah Venue
          </Link>
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Cari venue..." 
            className="pl-9 w-full bg-background"
          />
        </div>
        <Button variant="outline" className="w-full sm:w-auto">
          <Filter className="h-4 w-4 mr-2" /> Filter
        </Button>
      </div>

      {/* Venue List */}
      {mappedVenues.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {mappedVenues.map(venue => (
            <VenueCard key={venue.id} venue={venue} />
          ))}
        </div>
      ) : (
        <EmptyState
          icon="store"
          title="Belum Ada Venue"
          description="Anda belum menambahkan venue olahraga."
          actionLabel="Tambah Venue Pertama Anda"
          actionHref="/owner/venues/new"
        />
      )}
    </div>
  )
}
