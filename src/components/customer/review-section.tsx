'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Star, MessageSquare } from 'lucide-react'
import { createReviewAction } from '@/app/actions/reviews'
import { toast } from 'sonner'

interface ReviewSectionProps {
  bookingId: string
  venueId: string
  status: string
  existingReview: any
}

export function ReviewSection({ bookingId, venueId, status, existingReview }: ReviewSectionProps) {
  const [open, setOpen] = useState(false)
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (status !== 'completed' && !existingReview) {
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) {
      toast.error('Gagal', { description: 'Silakan pilih rating (1-5 bintang).' })
      return
    }

    setIsSubmitting(true)
    const formData = new FormData()
    formData.append('booking_id', bookingId)
    formData.append('venue_id', venueId)
    formData.append('rating', rating.toString())
    formData.append('comment', comment)

    const result = await createReviewAction(formData)
    
    if (result.error) {
      toast.error('Gagal', { description: result.error })
      setIsSubmitting(false)
    } else {
      toast.success('Berhasil', { description: 'Ulasan berhasil dikirim.' })
      setOpen(false)
      // The server action revalidates the path, so it will refresh
    }
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Star className="w-5 h-5 text-primary" />
          Ulasan
        </CardTitle>
      </CardHeader>
      <CardContent>
        {existingReview ? (
          <div className="space-y-4">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${star <= existingReview.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
                />
              ))}
            </div>
            {existingReview.comment && (
              <p className="text-sm italic border-l-2 pl-3 py-1 border-muted-foreground/30">
                "{existingReview.comment}"
              </p>
            )}
            {existingReview.owner_reply && (
              <div className="mt-4 bg-muted/50 p-4 rounded-lg">
                <p className="text-sm font-semibold flex items-center gap-2 mb-2">
                  <MessageSquare className="w-4 h-4 text-primary" />
                  Balasan Pemilik
                </p>
                <p className="text-sm">{existingReview.owner_reply}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground mb-4">Bagaimana pengalaman Anda di venue ini?</p>
            <Dialog open={open} onOpenChange={setOpen}>
              <Button onClick={() => setOpen(true)}>Beri Ulasan</Button>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Beri Ulasan</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6 pt-4">
                  <div className="flex justify-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        onClick={() => setRating(star)}
                        onMouseEnter={() => setHoverRating(star)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="focus:outline-none transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-8 h-8 ${
                            star <= (hoverRating || rating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Komentar (Opsional)</label>
                    <Textarea
                      placeholder="Ceritakan pengalaman Anda..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="min-h-[100px]"
                    />
                  </div>

                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? 'Mengirim...' : 'Kirim Ulasan'}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
