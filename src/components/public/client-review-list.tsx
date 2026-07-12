'use client'

import { useState } from 'react'
import { ReviewList } from './review-list'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Star } from 'lucide-react'

interface ClientReviewListProps {
  reviews: any[]
}

export function ClientReviewList({ reviews }: ClientReviewListProps) {
  const [filterRating, setFilterRating] = useState<number | null>(null)
  const [sortBy, setSortBy] = useState<string>('terbaru')

  if (!reviews || reviews.length === 0) {
    return <ReviewList reviews={[]} />
  }

  // Filter
  const filteredReviews = filterRating 
    ? reviews.filter(r => r.rating === filterRating)
    : reviews

  // Sort
  const sortedReviews = [...filteredReviews].sort((a, b) => {
    if (sortBy === 'terbaru') {
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    }
    if (sortBy === 'terlama') {
      return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    }
    if (sortBy === 'tertinggi') {
      return b.rating - a.rating
    }
    if (sortBy === 'terendah') {
      return a.rating - b.rating
    }
    return 0
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-muted/30 p-4 rounded-lg border">
        <div className="flex flex-wrap gap-2">
          <Button 
            variant={filterRating === null ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setFilterRating(null)}
            className="rounded-full"
          >
            Semua
          </Button>
          {[5, 4, 3, 2, 1].map(star => (
            <Button
              key={star}
              variant={filterRating === star ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterRating(star)}
              className="rounded-full gap-1"
            >
              {star} <Star className="w-3.5 h-3.5 fill-current" />
            </Button>
          ))}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="text-sm text-muted-foreground whitespace-nowrap">Urutkan:</span>
          <Select value={sortBy} onValueChange={(val) => val && setSortBy(val)}>
            <SelectTrigger className="w-[160px] h-9">
              <SelectValue placeholder="Pilih urutan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="terbaru">Terbaru</SelectItem>
              <SelectItem value="terlama">Terlama</SelectItem>
              <SelectItem value="tertinggi">Rating Tertinggi</SelectItem>
              <SelectItem value="terendah">Rating Terendah</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="text-sm text-muted-foreground">
        Menampilkan {sortedReviews.length} ulasan
      </div>

      <ReviewList reviews={sortedReviews} />
    </div>
  )
}
