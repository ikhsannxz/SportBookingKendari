import Link from 'next/link'
import { MapPin, Star, Heart, ImageIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getFavoriteVenues } from '@/lib/supabase/queries/venues'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Image from 'next/image'
import { getVenueImage } from '@/lib/utils'
import { EmptyState } from '@/components/ui/empty-state'
import { FavoriteButton } from '@/components/customer/favorite-button'

export default async function CustomerFavoritesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/auth/login')

  const favorites = await getFavoriteVenues(user.id)

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Favorit Saya ({favorites.length})</h1>
      
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {favorites.map((venue) => {
          const primaryImage = getVenueImage(venue.venue_images)

          return (
            <Card key={venue.id} className="overflow-hidden group hover:shadow-md transition-shadow relative flex flex-col">
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
                    initialIsFavorite={true}
                    className="absolute top-2 right-2 w-8 h-8 bg-black/20 hover:bg-black/40 border border-white/20 text-white backdrop-blur-md"
                  />
                </div>
                <CardContent className="p-4 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <h3 className="font-semibold text-lg line-clamp-1">{venue.name}</h3>
                    <div className="flex items-center gap-1 text-sm font-medium shrink-0">
                      <Star className="w-3.5 h-3.5 fill-primary text-primary" />
                      <span>{venue.rating_avg > 0 ? venue.rating_avg.toFixed(1) : 'New'}</span>
                    </div>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 mr-1 shrink-0" />
                    <span className="line-clamp-1">{venue.district}, {venue.city}</span>
                  </div>
                </CardContent>
              </Link>
            </Card>
          )
        })}
      </div>

      {favorites.length === 0 && (
        <EmptyState
          icon="heart"
          title="Belum Ada Favorit"
          description="Anda belum menyimpan venue apa pun ke favorit."
          actionLabel="Eksplorasi Venue"
          actionHref="/search"
        />
      )}
    </div>
  )
}
