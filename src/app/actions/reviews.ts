'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type ReviewActionState = {
  error?: string
  success?: string
}

export async function createReviewAction(formData: FormData): Promise<ReviewActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const bookingId = formData.get('booking_id') as string
  const venueId = formData.get('venue_id') as string
  const rating = parseInt(formData.get('rating') as string, 10)
  const comment = formData.get('comment') as string | null

  if (!bookingId || !venueId || isNaN(rating) || rating < 1 || rating > 5) {
    return { error: 'Invalid input parameters' }
  }

  // Check eligibility
  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select('status, customer_id, venues(owner_id, slug)')
    .eq('id', bookingId)
    .single()

  if (bookingError || !booking) {
    return { error: 'Booking not found' }
  }

  if (booking.customer_id !== user.id) {
    return { error: 'Not authorized to review this booking' }
  }

  if (booking.status !== 'completed') {
    return { error: 'Booking must be completed to leave a review' }
  }

  // Insert review
  const { error: insertError } = await supabase
    .from('reviews')
    .insert({
      booking_id: bookingId,
      venue_id: venueId,
      customer_id: user.id,
      rating,
      comment: comment?.trim() || null,
    })

  if (insertError) {
    if (insertError.code === '23505') { // unique violation
      return { error: 'You have already reviewed this booking' }
    }
    console.error('Error creating review:', insertError)
    return { error: 'Failed to submit review' }
  }

  // Owner notification
  const ownerId = (booking.venues as any).owner_id
  if (ownerId) {
    await supabase.from('notifications').insert({
      profile_id: ownerId,
      title: 'Ulasan Baru Diterima',
      message: `Anda menerima ulasan bintang ${rating} untuk booking.`,
      type: 'review_received',
      link_url: `/owner/dashboard`,
    })
  }

  revalidatePath(`/customer/bookings/${bookingId}`)
  revalidatePath(`/venues/${(booking.venues as any)?.slug || 'unknown'}`) // we'll check if we can get slug
  revalidatePath(`/venues`)
  revalidatePath('/search')
  revalidatePath('/')
  revalidatePath('/owner/analytics')
  
  return { success: 'Review submitted successfully' }
}

export async function getCustomerReview(bookingId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('booking_id', bookingId)
    .eq('customer_id', user.id)
    .maybeSingle()

  if (error) {
    console.error('Error fetching customer review:', error)
    return null
  }

  return data
}

export async function getVenueReviews(venueId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('reviews')
    .select('*, profiles(full_name, avatar_url)')
    .eq('venue_id', venueId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching venue reviews:', error)
    return []
  }

  return data
}

export async function replyReviewAction(formData: FormData): Promise<ReviewActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const reviewId = formData.get('review_id') as string
  const reply = formData.get('reply') as string
  
  if (!reviewId || !reply || !reply.trim()) {
    return { error: 'Invalid input parameters' }
  }

  // Update review with owner reply
  const { error: updateError } = await supabase
    .from('reviews')
    .update({
      owner_reply: reply.trim(),
      replied_at: new Date().toISOString(),
    })
    .eq('id', reviewId)

  if (updateError) {
    console.error('Error replying to review:', updateError)
    return { error: 'Failed to submit reply' }
  }
  
  revalidatePath(`/owner/dashboard`)
  return { success: 'Reply submitted successfully' }
}

export async function getOwnerReviews() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  const { data, error } = await supabase
    .from('reviews')
    .select('*, profiles(full_name, avatar_url), venues!inner(name, owner_id)')
    .eq('venues.owner_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching owner reviews:', error)
    return []
  }

  return data
}
