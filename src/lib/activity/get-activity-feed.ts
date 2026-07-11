import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

export type ActivityEventType = 
  | 'booking_created' 
  | 'payment_uploaded' 
  | 'payment_verified' 
  | 'payment_rejected' 
  | 'booking_completed' 
  | 'booking_cancelled' 
  | 'review_submitted'

export interface ActivityEvent {
  id: string
  type: ActivityEventType
  date: Date
  venueName: string
  bookingId: string
  bookingDetails: {
    date: string
    time: string
  }
  status?: string
}

export async function getActivityFeed(userId: string): Promise<ActivityEvent[]> {
  const supabase = await createClient()

  // Fetch bookings with venues, payments, and reviews
  const { data: bookings, error } = await supabase
    .from('bookings')
    .select(`
      id, created_at, updated_at, status, booking_date, start_time, end_time,
      venues ( name ),
      payments ( id, created_at, updated_at, verified_at, status ),
      reviews ( id, created_at )
    `)
    .eq('customer_id', userId)

  if (error || !bookings) {
    console.error('Error fetching activity feed:', error)
    return []
  }

  const events: ActivityEvent[] = []

  bookings.forEach((booking: any) => {
    const venueName = booking.venues?.name || 'Unknown Venue'
    
    // Format booking details
    const bDate = new Date(booking.booking_date)
    const formattedDate = format(bDate, 'd MMMM yyyy', { locale: id })
    const timeStr = `${booking.start_time.slice(0,5)} - ${booking.end_time.slice(0,5)}`

    const bookingDetails = {
      date: formattedDate,
      time: timeStr
    }

    // 1. Booking Created
    events.push({
      id: `booking-${booking.id}-created`,
      type: 'booking_created',
      date: new Date(booking.created_at),
      venueName,
      bookingId: booking.id,
      bookingDetails,
      status: 'unpaid' // Use 'unpaid' to map to Menunggu Pembayaran
    })

    // 2. Booking Completed
    if (booking.status === 'completed') {
      events.push({
        id: `booking-${booking.id}-completed`,
        type: 'booking_completed',
        date: new Date(booking.updated_at),
        venueName,
        bookingId: booking.id,
        bookingDetails,
        status: 'completed'
      })
    }

    // 3. Booking Cancelled
    if (booking.status === 'cancelled') {
      events.push({
        id: `booking-${booking.id}-cancelled`,
        type: 'booking_cancelled',
        date: new Date(booking.updated_at),
        venueName,
        bookingId: booking.id,
        bookingDetails,
        status: 'cancelled'
      })
    }

    // 4. Payments
    if (booking.payments && Array.isArray(booking.payments)) {
      booking.payments.forEach((payment: any) => {
        // Payment Uploaded
        events.push({
          id: `payment-${payment.id}-uploaded`,
          type: 'payment_uploaded',
          date: new Date(payment.created_at),
          venueName,
          bookingId: booking.id,
          bookingDetails,
          status: 'pending' // 'pending' maps to 'Menunggu Verifikasi'
        })

        // Payment Verified
        if (payment.status === 'verified') {
          events.push({
            id: `payment-${payment.id}-verified`,
            type: 'payment_verified',
            date: payment.verified_at ? new Date(payment.verified_at) : new Date(payment.updated_at),
            venueName,
            bookingId: booking.id,
            bookingDetails,
            status: 'verified'
          })
        }

        // Payment Rejected
        if (payment.status === 'rejected') {
          events.push({
            id: `payment-${payment.id}-rejected`,
            type: 'payment_rejected',
            date: new Date(payment.updated_at),
            venueName,
            bookingId: booking.id,
            bookingDetails,
            status: 'rejected'
          })
        }
      })
    }

    // 5. Review
    if (booking.reviews) {
      // In case reviews is returned as an array or object
      const reviewArray = Array.isArray(booking.reviews) ? booking.reviews : [booking.reviews]
      reviewArray.forEach((review: any) => {
        events.push({
          id: `review-${review.id}-submitted`,
          type: 'review_submitted',
          date: new Date(review.created_at),
          venueName,
          bookingId: booking.id,
          bookingDetails
        })
      })
    }
  })

  // Sort descending by date
  events.sort((a, b) => b.date.getTime() - a.date.getTime())

  return events
}
