import { Star } from 'lucide-react'


interface ReviewSummaryProps {
  reviews: any[]
}

export function ReviewSummary({ reviews }: ReviewSummaryProps) {
  const totalReviews = reviews.length
  
  if (totalReviews === 0) {
    return (
      <div className="bg-muted/50 p-6 rounded-xl border flex flex-col items-center justify-center text-center">
        <Star className="w-10 h-10 text-muted-foreground/30 mb-2" />
        <p className="font-medium">Belum ada ulasan</p>
        <p className="text-sm text-muted-foreground">Jadilah yang pertama memberikan ulasan setelah bermain!</p>
      </div>
    )
  }

  const averageRating = reviews.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews
  
  const ratingDistribution = {
    5: reviews.filter(r => r.rating === 5).length,
    4: reviews.filter(r => r.rating === 4).length,
    3: reviews.filter(r => r.rating === 3).length,
    2: reviews.filter(r => r.rating === 2).length,
    1: reviews.filter(r => r.rating === 1).length,
  }

  return (
    <div className="flex flex-col md:flex-row gap-6 p-6 rounded-xl border bg-card">
      <div className="flex flex-col items-center justify-center md:w-1/3 border-b md:border-b-0 md:border-r pb-6 md:pb-0 md:pr-6">
        <div className="flex items-baseline gap-1 text-primary">
          <Star className="w-6 h-6 fill-current" />
          <span className="text-5xl font-bold tracking-tighter">{averageRating.toFixed(1)}</span>
          <span className="text-xl text-muted-foreground font-medium">/ 5.0</span>
        </div>
        <div className="flex mt-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-5 h-5 ${
                star <= Math.round(averageRating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-300'
              }`}
            />
          ))}
        </div>
        <p className="text-sm text-muted-foreground mt-2 font-medium">
          Dari {totalReviews} ulasan
        </p>
      </div>

      <div className="flex-1 flex flex-col justify-center gap-2">
        {[5, 4, 3, 2, 1].map((star) => {
          const count = ratingDistribution[star as keyof typeof ratingDistribution]
          const percentage = (count / totalReviews) * 100
          
          return (
            <div key={star} className="flex items-center gap-3 text-sm">
              <div className="flex items-center gap-1 w-12 text-muted-foreground font-medium">
                <Star className="w-3.5 h-3.5 fill-current" /> {star}
              </div>
              <div className="h-2 flex-1 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-yellow-400 rounded-full" 
                  style={{ width: `${percentage}%` }} 
                />
              </div>
              <div className="w-8 text-right text-muted-foreground font-medium">
                {count}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
