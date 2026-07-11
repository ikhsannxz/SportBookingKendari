import { getOwnerReviews } from '@/app/actions/reviews'
import { OwnerReviewList } from '@/components/owner/owner-review-list'
import { Star } from 'lucide-react'

export const metadata = {
  title: 'Ulasan Pelanggan | SportBook Owner',
}

export default async function OwnerReviewsPage() {
  const reviews = await getOwnerReviews()

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Star className="h-8 w-8 text-yellow-500 fill-yellow-500" />
            Ulasan Pelanggan
          </h1>
          <p className="text-muted-foreground mt-1">
            Lihat dan balas ulasan dari pelanggan yang telah menyewa venue Anda.
          </p>
        </div>
      </div>

      <OwnerReviewList initialReviews={reviews} />
    </div>
  )
}
