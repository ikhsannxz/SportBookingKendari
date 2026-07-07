'use client'

import { useRouter } from 'next/navigation'
import { useTransition } from 'react'
import { MapPin, Star, MoreVertical, Edit, Trash2, Eye } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/ui/status-badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { deleteVenueAction } from '@/app/actions/venues'

// Use real Venue type but adapt for card
export interface VenueCardData {
  id: string
  slug: string
  name: string
  sport: string
  location: string
  price: number
  rating: number
  reviews: number
  status: string
  image: string
}

interface VenueCardProps {
  venue: VenueCardData
}

export function VenueCard({ venue }: VenueCardProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this venue? This action cannot be undone.')) {
      startTransition(async () => {
        const result = await deleteVenueAction(venue.id)
        if (result.error) {
          alert('Error deleting venue: ' + result.error)
        } else {
          alert('Venue deleted successfully.')
        }
      })
    }
  }

  const formatRupiah = (number: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number)
  }

  return (
    <Card className={`overflow-hidden group hover:shadow-md transition-shadow ${isPending ? 'opacity-50' : ''}`}>
      <div className="flex flex-col sm:flex-row h-full">
        {/* Image */}
        <div className="relative h-48 sm:h-auto sm:w-64 bg-muted shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={venue.image}
            alt={venue.name}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute top-3 left-3 flex gap-2">
            <Badge className="bg-white/90 text-black hover:bg-white border-none shadow-sm backdrop-blur-md capitalize">
              {venue.sport}
            </Badge>
          </div>
          <div className="absolute top-3 right-3">
            <StatusBadge status={venue.status} />
          </div>
        </div>

        {/* Content */}
        <CardContent className="p-5 flex-1 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-2">
              <div>
                <h3 className="font-bold text-lg leading-tight mb-1">{venue.name}</h3>
                <div className="flex items-center text-sm text-muted-foreground gap-1.5">
                  <MapPin className="w-3.5 h-3.5" />
                  {venue.location}
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-8 w-8 -mr-2" disabled={isPending} />}>
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => router.push(`/venues/${venue.slug}`)}>
                    <Eye className="mr-2 h-4 w-4" /> View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push(`/owner/venues/${venue.id}/edit`)}>
                    <Edit className="mr-2 h-4 w-4" /> Edit Venue
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    variant="destructive"
                    className="cursor-pointer text-destructive focus:bg-destructive/10"
                    onClick={handleDelete}
                  >
                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            <div className="flex items-center gap-1.5 text-sm font-medium mt-3">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>{venue.rating}</span>
              <span className="text-muted-foreground font-normal">({venue.reviews} reviews)</span>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t flex justify-between items-center">
            <div>
              <span className="font-bold text-lg">{formatRupiah(venue.price)}</span>
              <span className="text-xs text-muted-foreground font-medium"> / hr</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push(`/owner/schedules?venue=${venue.id}`)}
              disabled={isPending}
            >
              Schedules
            </Button>
          </div>
        </CardContent>
      </div>
    </Card>
  )
}
