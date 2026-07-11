'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Star, MessageSquare } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { format, parseISO } from 'date-fns'
import { id } from 'date-fns/locale'
import { replyReviewAction } from '@/app/actions/reviews'
import { toast } from 'sonner'
import { EmptyState } from '@/components/ui/empty-state'

interface OwnerReviewListProps {
  initialReviews: any[]
}

export function OwnerReviewList({ initialReviews }: OwnerReviewListProps) {
  const [reviews, setReviews] = useState(initialReviews)
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleReplySubmit = async (reviewId: string) => {
    if (!replyText.trim()) return

    setIsSubmitting(true)
    const formData = new FormData()
    formData.append('review_id', reviewId)
    formData.append('reply', replyText)

    const result = await replyReviewAction(formData)
    
    if (result.error) {
      toast.error('Gagal', { description: result.error })
    } else {
      toast.success('Berhasil', { description: 'Balasan berhasil dikirim.' })
      
      // Update local state
      setReviews(reviews.map(r => 
        r.id === reviewId 
          ? { ...r, owner_reply: replyText.trim(), replied_at: new Date().toISOString() } 
          : r
      ))
      
      setReplyingTo(null)
      setReplyText('')
    }
    setIsSubmitting(false)
  }

  if (reviews.length === 0) {
    return (
      <EmptyState
        icon="store"
        title="Belum Ada Ulasan"
        description="Venue Anda belum menerima ulasan dari pelanggan."
      />
    )
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <Card key={review.id} className="overflow-hidden">
          <CardContent className="p-5">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-4 gap-4">
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
                    {format(parseISO(review.created_at), 'd MMMM yyyy, HH:mm', { locale: id })}
                  </p>
                </div>
              </div>
              <div className="flex flex-col items-start sm:items-end gap-1">
                 <div className="flex">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={`w-4 h-4 ${star <= review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">Venue: <span className="font-medium text-foreground">{review.venues?.name}</span></p>
              </div>
            </div>
            
            {review.comment && (
              <p className="text-sm mt-2 text-foreground/90 leading-relaxed">
                "{review.comment}"
              </p>
            )}

            {review.owner_reply ? (
              <div className="mt-4 bg-muted/60 p-4 rounded-lg border border-border/50">
                <div className="flex items-center justify-between mb-1.5">
                   <p className="text-xs font-semibold flex items-center gap-1.5 text-primary">
                     <MessageSquare className="w-3.5 h-3.5" />
                     Balasan Anda
                   </p>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{review.owner_reply}</p>
                {review.replied_at && (
                   <p className="text-[10px] text-muted-foreground mt-2">
                     Dibalas pada: {format(parseISO(review.replied_at), 'd MMM yyyy, HH:mm', { locale: id })}
                   </p>
                )}
              </div>
            ) : (
              <div className="mt-4">
                {replyingTo === review.id ? (
                  <div className="space-y-3 bg-muted/30 p-4 rounded-lg border border-border/50">
                    <Textarea 
                      placeholder="Tulis balasan Anda di sini..." 
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      className="min-h-[100px] bg-background"
                      autoFocus
                    />
                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          setReplyingTo(null)
                          setReplyText('')
                        }}
                        disabled={isSubmitting}
                      >
                        Batal
                      </Button>
                      <Button 
                        size="sm" 
                        onClick={() => handleReplySubmit(review.id)}
                        disabled={isSubmitting || !replyText.trim()}
                      >
                        {isSubmitting ? 'Mengirim...' : 'Kirim Balasan'}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full sm:w-auto flex items-center gap-2"
                    onClick={() => setReplyingTo(review.id)}
                  >
                    <MessageSquare className="w-4 h-4" />
                    Balas Ulasan
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
