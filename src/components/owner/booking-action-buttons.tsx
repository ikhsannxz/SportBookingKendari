'use client'

import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, CheckCircle2, XCircle, CheckSquare } from 'lucide-react'
import { updateBookingStatusAction } from '@/app/actions/bookings'
import { toast } from 'sonner'

interface BookingActionButtonsProps {
  bookingId: string
  currentStatus: string
}

export function BookingActionButtons({ bookingId, currentStatus }: BookingActionButtonsProps) {
  const [isPending, startTransition] = useTransition()

  const handleUpdateStatus = (newStatus: 'confirmed' | 'rejected' | 'completed') => {
    startTransition(async () => {
      const result = await updateBookingStatusAction(bookingId, newStatus)
      if (result.error) {
        toast.error(result.error)
      } else if (result.success) {
        toast.success(result.success)
      }
    })
  }

  // If status is completed or cancelled, no further actions can be taken.
  if (currentStatus === 'completed' || currentStatus === 'cancelled') {
    return null
  }

  return (
    <Card className="border-primary/20 shadow-md">
      <CardHeader className="bg-primary/5 pb-4">
        <CardTitle className="text-lg">Manage Booking</CardTitle>
      </CardHeader>
      <CardContent className="pt-4 space-y-3">
        {currentStatus === 'pending' && (
          <>
            <Button 
              className="w-full bg-emerald-600 hover:bg-emerald-700 h-12 text-base"
              onClick={() => handleUpdateStatus('confirmed')}
              disabled={isPending}
            >
              {isPending ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <CheckCircle2 className="w-5 h-5 mr-2" />}
              Confirm Booking
            </Button>
            <Button 
              variant="outline" 
              className="w-full text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 h-12 text-base"
              onClick={() => handleUpdateStatus('rejected')}
              disabled={isPending}
            >
              {isPending ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <XCircle className="w-5 h-5 mr-2" />}
              Reject & Cancel
            </Button>
          </>
        )}
        
        {currentStatus === 'confirmed' && (
          <Button 
            className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-base"
            onClick={() => handleUpdateStatus('completed')}
            disabled={isPending}
          >
            {isPending ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <CheckSquare className="w-5 h-5 mr-2" />}
            Mark as Completed
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
