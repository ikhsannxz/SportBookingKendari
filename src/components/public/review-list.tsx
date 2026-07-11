import { Star, MessageSquare } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { format, parseISO } from 'date-fns'
import { id } from 'date-fns/locale'

interface ReviewListProps {
  reviews: any[]
}

export function ReviewList({ reviews }: ReviewListProps) {
  if (!reviews || reviews.length === 0) {
    return (
      <div className="bg-muted p-8 text-center rounded-lg mt-4 border border-border/50">
        <Star className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-foreground mb-1">Belum Ada Ulasan</h3>
        <p className="text-sm text-muted-foreground">
          Venue ini belum memiliki ulasan pelanggan.
        </p>
      </div>
    )
  }

  return (
    <div className="mt-6 space-y-4">
      {reviews.map((review) => (
        <Card key={review.id} className="overflow-hidden">
          <CardContent className="p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10 border border-border/50">
                  <AvatarImage src={review.profiles?.avatar_url || ''} />
                  <AvatarFallback className="bg-primary/5 text-primary font-medium">
                    {review.profiles?.full_name?.substring(0, 2).toUpperCase() || 'AN'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-sm">{review.profiles?.full_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(parseISO(review.created_at), 'd MMMM yyyy', { locale: id })}
                  </p>
                </div>
              </div>
              <div className="flex">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                  />
                ))}
              </div>
            </div>
            
            {review.comment && (
              <p className="text-sm mt-3 text-foreground/90 leading-relaxed">
                {review.comment}
              </p>
            )}

            {review.owner_reply && (
              <div className="mt-4 bg-muted/60 p-4 rounded-lg border border-border/50">
                <p className="text-xs font-semibold flex items-center gap-1.5 mb-1.5 text-primary">
                  <MessageSquare className="w-3.5 h-3.5" />
                  Balasan Pemilik
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed">{review.owner_reply}</p>
                {review.replied_at && (
                   <p className="text-[10px] text-muted-foreground mt-2">
                     {format(parseISO(review.replied_at), 'd MMM yyyy, HH:mm', { locale: id })}
                   </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
