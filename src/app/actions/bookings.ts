/* eslint-disable @typescript-eslint/no-explicit-any */
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { validateBookingRequest, calculateBookingPrice } from '@/lib/booking/utils'

export type BookingActionState = {
  error?: string
  success?: string
}

export async function getVenueAvailability(venueId: string, date: string) {
  const supabase = await createClient()
  
  // Get schedule for the day of week
  const dayOfWeek = new Date(date).getDay()
  const { data: schedule } = await supabase
    .from('schedules')
    .select('*')
    .eq('venue_id', venueId)
    .eq('day_of_week', dayOfWeek)
    .single()

  if (!schedule) {
    return { isClosed: true, openTime: '00:00:00', closeTime: '00:00:00', bookings: [] }
  }

  // Get bookings for the date
  const { data: bookings } = await supabase
    .from('bookings')
    .select('start_time, end_time')
    .eq('venue_id', venueId)
    .eq('booking_date', date)
    .in('status', ['pending', 'confirmed', 'completed'])

  return {
    isClosed: schedule.is_closed,
    openTime: schedule.open_time,
    closeTime: schedule.close_time,
    bookings: bookings || []
  }
}

export async function createBookingAction(formData: FormData): Promise<BookingActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const venueId = formData.get('venue_id') as string
  const bookingDate = formData.get('booking_date') as string
  const startTime = formData.get('start_time') as string
  const durationHours = parseInt(formData.get('duration_hours') as string, 10)
  const notes = formData.get('notes') as string | null

  if (!venueId || !bookingDate || !startTime || isNaN(durationHours)) {
    return { error: 'Missing required booking fields' }
  }

  // 1. Fetch Venue details to get price_per_hour
  const { data: venue, error: venueError } = await supabase
    .from('venues')
    .select('price_per_hour, owner_id, name')
    .eq('id', venueId)
    .single()

  if (venueError || !venue) {
    return { error: 'Venue not found' }
  }

  // Business Rule: Prevent booking own venue (optional but requested to consider)
  if (venue.owner_id === user.id) {
    return { error: 'You cannot book your own venue' }
  }

  // 2. Fetch Schedule for the specific day
  const dayOfWeek = new Date(bookingDate).getDay()
  const { data: schedule } = await supabase
    .from('schedules')
    .select('*')
    .eq('venue_id', venueId)
    .eq('day_of_week', dayOfWeek)
    .single()

  if (!schedule) {
    return { error: 'Venue schedule not found for this day' }
  }

  // 3. Fetch existing bookings for this date and venue
  const { data: existingBookings } = await supabase
    .from('bookings')
    .select('start_time, end_time')
    .eq('venue_id', venueId)
    .eq('booking_date', bookingDate)
    .in('status', ['pending', 'confirmed'])

  // 4. Validate Booking Rules
  const validation = validateBookingRequest(
    startTime,
    durationHours,
    schedule.open_time,
    schedule.close_time,
    schedule.is_closed,
    existingBookings || []
  )

  if (!validation.valid || !validation.endTime) {
    return { error: validation.error || 'Invalid booking request' }
  }

  const totalPrice = calculateBookingPrice(venue.price_per_hour, durationHours)

  // 5. Insert Booking Atomically via RPC
  const { data: newBookingId, error: insertError } = await supabase
    .rpc('create_booking_atomic', {
      p_customer_id: user.id,
      p_venue_id: venueId,
      p_booking_date: bookingDate,
      p_start_time: startTime,
      p_end_time: validation.endTime,
      p_duration_hours: durationHours,
      p_total_price: totalPrice,
      p_notes: notes || null
    })

  if (insertError) {
    console.error('Error creating booking:', insertError)
    if (insertError.message.includes('overlaps')) {
      return { error: 'This time slot was just taken by someone else' }
    }
    if (insertError.message.includes('not approved')) {
      return { error: 'This venue is not available for booking' }
    }
    return { error: 'Failed to create booking' }
  }

  // Create notification for the venue owner
  const { createNotification } = await import('./notifications')
  const customerName = user.user_metadata?.full_name || 'Pelanggan'
  await createNotification({
    userId: venue.owner_id,
    type: 'booking_created',
    title: 'Booking Baru',
    message: `${customerName} melakukan booking ${venue.name}`,
    referenceId: newBookingId,
    referenceType: 'booking'
  })

  revalidatePath('/customer/bookings')
  revalidatePath('/customer/dashboard')
  revalidatePath(`/venues/${venueId}`)
  redirect('/customer/bookings')
}

export async function cancelBookingAction(bookingId: string): Promise<BookingActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  // Customer can only cancel pending or confirmed bookings
  // Let's first fetch the booking to validate the transition
  const { data: booking, error: fetchError } = await supabase
    .from('bookings')
    .select('status')
    .eq('id', bookingId)
    .eq('customer_id', user.id)
    .single()

  if (fetchError || !booking) {
    return { error: 'Booking not found' }
  }

  if (booking.status !== 'pending' && booking.status !== 'confirmed') {
    return { error: `Cannot cancel a ${booking.status} booking` }
  }

  const { error } = await supabase
    .from('bookings')
    .update({ status: 'cancelled' })
    .eq('id', bookingId)

  if (error) {
    return { error: error.message }
  }

  // Also update payment status to rejected
  await supabase
    .from('payments')
    .update({ status: 'rejected' })
    .eq('booking_id', bookingId)

  revalidatePath('/customer/bookings')
  revalidatePath('/customer/dashboard')
  return { success: 'Booking cancelled successfully' }
}

export async function updateBookingStatusAction(
  bookingId: string, 
  newStatus: 'confirmed' | 'rejected' | 'completed' | 'cancelled'
): Promise<BookingActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  // Only the owner of the venue can update the status
  const { data: booking, error: fetchError } = await supabase
    .from('bookings')
    .select('status, venue_id, venues!inner(owner_id)')
    .eq('id', bookingId)
    .single()

  if (fetchError || !booking || (booking.venues as any).owner_id !== user.id) {
    return { error: 'Booking not found or unauthorized' }
  }

  // Validate state transitions
  const currentStatus = booking.status
  let isValidTransition = false

  if (currentStatus === 'pending') {
    if (newStatus === 'confirmed' || newStatus === 'rejected' || newStatus === 'cancelled') isValidTransition = true
  } else if (currentStatus === 'confirmed') {
    if (newStatus === 'completed' || newStatus === 'rejected' || newStatus === 'cancelled') isValidTransition = true // Allow rejecting a confirmed booking as an owner cancellation
  }

  if (!isValidTransition) {
    return { error: `Invalid transition from ${currentStatus} to ${newStatus}` }
  }

  const dbStatus = newStatus === 'rejected' ? 'cancelled' : newStatus

  const { error } = await supabase
    .from('bookings')
    .update({ status: dbStatus })
    .eq('id', bookingId)
    .select('customer_id') // We need to fetch customer_id to notify them
    .single()

  if (error) {
    return { error: error.message }
  }

  // Sync payment status
  let paymentStatusUpdate = null;
  if (dbStatus === 'completed') {
    paymentStatusUpdate = 'verified';
  } else if (dbStatus === 'cancelled') {
    paymentStatusUpdate = 'rejected';
  }

  if (paymentStatusUpdate) {
    await supabase
      .from('payments')
      .update({ status: paymentStatusUpdate })
      .eq('booking_id', bookingId)
  }

  // Create notification for the customer
  const { data: updatedBooking } = await supabase
    .from('bookings')
    .select('customer_id, booking_code, venues(name)')
    .eq('id', bookingId)
    .single()

  if (updatedBooking) {
    const { createNotification } = await import('./notifications')
    const venueName = (updatedBooking.venues as any).name;
    const bookingCode = updatedBooking.booking_code;
    const statusText = dbStatus === 'completed' ? 'Selesai' : dbStatus === 'cancelled' ? 'Dibatalkan' : dbStatus === 'confirmed' ? 'Dikonfirmasi' : dbStatus;
    
    await createNotification({
      userId: updatedBooking.customer_id,
      type: `booking_${dbStatus}` as 'booking_confirmed' | 'booking_cancelled' | 'booking_completed',
      title: `Booking ${statusText}`,
      message: `Status pesanan Anda (${bookingCode}) di ${venueName} telah diubah menjadi ${statusText}.`,
      referenceId: bookingId,
      referenceType: 'booking'
    })
  }

  revalidatePath('/owner/bookings')
  revalidatePath('/owner/dashboard')
  return { success: `Booking marked as ${dbStatus}` }
}

export async function expireUnpaidBookings() {
  const supabase = await createClient()

  const twentyMinutesAgo = new Date(Date.now() - 20 * 60 * 1000).toISOString()

  const { data: bookingsToExpire } = await supabase
    .from('bookings')
    .select('id, payments(id, status)')
    .eq('status', 'pending')
    .lte('created_at', twentyMinutesAgo)

  if (!bookingsToExpire || bookingsToExpire.length === 0) return

  const toExpire = bookingsToExpire.filter(b => {
    const payment = Array.isArray(b.payments) ? b.payments[0] : (b.payments as any)
    return payment && ['unpaid', 'rejected'].includes(payment.status)
  })

  if (toExpire.length === 0) return

  const bookingIds = toExpire.map(b => b.id)
  const paymentIds = toExpire.map(b => {
    const payment = Array.isArray(b.payments) ? b.payments[0] : (b.payments as any)
    return payment.id
  })

  if (bookingIds.length > 0) {
    await supabase
      .from('bookings')
      .update({ status: 'expired' })
      .in('id', bookingIds)

    await supabase
      .from('payments')
      .update({ status: 'expired' })
      .in('id', paymentIds)
      
    console.log(`[AUTO EXPIRE] Expired ${bookingIds.length} bookings:`, bookingIds.join(', '))
  }
}
