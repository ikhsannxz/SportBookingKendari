import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getVenueBySlug } from '@/lib/supabase/queries/venues'
import { getVenueReviews } from '@/app/actions/reviews'
import { ReviewSummary } from '@/components/public/review-summary'
import { ClientReviewList } from '@/components/public/client-review-list'

export default async function VenueReviewsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const venue = await getVenueBySlug(slug)

  if (!venue) {
    notFound()
  }

  const reviews = await getVenueReviews(venue.id)

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div>
        <Button variant="ghost" asChild className="mb-4 -ml-4">
          <Link href={`/venues/${venue.slug}`}>
            <ChevronLeft className="w-4 h-4 mr-2" />
            Kembali ke {venue.name}
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight mb-2">Ulasan Pelanggan</h1>
        <p className="text-muted-foreground">
          Semua ulasan untuk {venue.name}
        </p>
      </div>

      <ReviewSummary reviews={reviews} />
      
      <ClientReviewList reviews={reviews} />
    </div>
  )
}
