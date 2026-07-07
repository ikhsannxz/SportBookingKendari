/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Upload a payment proof and link it to a booking.
 * Expects a FormData object containing 'booking_id' and 'file'.
 */
export async function uploadPaymentProofAction(prevState: any, formData: FormData) {
  console.log("===== PAYMENT ACTION CALLED =====");

  const bookingId = formData.get("booking_id");
  const file = formData.get("file");

  console.log("bookingId =", bookingId);
  console.log("file =", file);

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Unauthorized' }
    }

    const bookingId = formData.get('booking_id') as string
    const file = formData.get('file') as File


    if (!bookingId || !file || file.size === 0) {
      return { error: 'Missing booking ID or valid file' }
    }

    // Validation: 5MB limit
    if (file.size > 5 * 1024 * 1024) {
      return { error: 'File size exceeds 5MB limit' }
    }

    // Validation: Type check
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      return { error: 'Invalid file type. Only JPG, PNG, and PDF are allowed.' }
    }

    // 1. Fetch the payment record to get its ID, or to see if we need to clean up old proof
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('id, proof_url, status')
      .eq('booking_id', bookingId)
      .single()

    if (paymentError || !payment) {
      return { error: 'Payment record not found for this booking.' }
    }

    if (payment.status === 'verified') {
      return { error: 'Payment is already verified. Cannot re-upload.' }
    }

    // 2. Upload file to Storage
    const timestamp = new Date().getTime()
    const extension = file.name.split('.').pop()
    const filename = `proof_${timestamp}.${extension}`
    const filepath = `${user.id}/${bookingId}/${filename}`

    const fileBuffer = await file.arrayBuffer()

    const { data: uploadData, error: uploadError } = await supabase
      .storage
      .from('payment-proofs')
      .upload(filepath, fileBuffer, {
        contentType: file.type,
        upsert: false
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return { error: 'Failed to upload file to storage.' }
    }

    // Get public URL
    const { data: { publicUrl } } = supabase
      .storage
      .from('payment-proofs')
      .getPublicUrl(filepath)

    // 3. Delete old file if it exists
    if (payment.proof_url) {
      try {
        const urlParts = payment.proof_url.split('/payment-proofs/')
        if (urlParts.length > 1) {
          const oldPath = urlParts[1].split('?')[0]
          await supabase.storage.from('payment-proofs').remove([oldPath])
        }
      } catch (err) {
        console.error('Failed to remove old proof, skipping...', err)
      }
    }

    // Get signed URL (bucket is private, so public URL won't work)
    const { data: signedUrlData, error: signedUrlError } = await supabase
      .storage
      .from('payment-proofs')
      .createSignedUrl(filepath, 60 * 60 * 24 * 365) // 1 year expiry

    if (signedUrlError) {
      console.error('Failed to generate signed URL:', signedUrlError)
      return { error: 'Failed to process payment proof.' }
    }

    // 4. Update the payment record
    const { error: updateError } = await supabase
      .from('payments')
      .update({
        proof_url: signedUrlData.signedUrl,
        status: 'pending',
        rejection_reason: null
      })
      .eq('id', payment.id)

    if (updateError) {
      return { error: 'Failed to update payment record.' }
    }

    revalidatePath(`/customer/bookings/${bookingId}`)
    revalidatePath('/customer/dashboard')
    return { success: 'Payment proof uploaded successfully!' }

  } catch (error: any) {
    console.error('uploadPaymentProofAction error:', error)
    return { error: error.message || 'An unexpected error occurred' }
  }
}

/**
 * Verify a payment (Owner Action)
 */
export async function verifyPaymentAction(paymentId: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Unauthorized' }
    }

    // Update payment
    const { data: payment, error: updateError } = await supabase
      .from('payments')
      .update({
        status: 'verified',
        verified_by: user.id,
        verified_at: new Date().toISOString(),
        rejection_reason: null
      })
      .eq('id', paymentId)
      .select('booking_id')
      .single()

    if (updateError || !payment) {
      return { error: 'Failed to verify payment.' }
    }

    // Update booking
    const { data: updatedBooking, error: bookingError } = await supabase
      .from('bookings')
      .update({ status: 'confirmed' })
      .eq('id', payment.booking_id)
      .select('customer_id')
      .single()

    if (bookingError) {
      return { error: 'Failed to update booking status.' }
    }

    if (updatedBooking) {
      const { createNotification } = await import('./notifications')
      await createNotification({
        userId: updatedBooking.customer_id,
        type: 'payment_verified',
        title: 'Pembayaran Diverifikasi',
        message: 'Pembayaran Anda telah diverifikasi dan booking dikonfirmasi.',
        referenceId: paymentId,
        referenceType: 'payment'
      })
    }

    revalidatePath(`/owner/payments/${paymentId}`)
    revalidatePath('/owner/payments')
    revalidatePath(`/owner/bookings/${payment.booking_id}`)
    revalidatePath('/owner/analytics')
    revalidatePath('/customer/bookings')
    revalidatePath(`/customer/bookings/${payment.booking_id}`)
    revalidatePath('/customer/dashboard')
    return { success: 'Payment verified and booking confirmed!' }

  } catch (error: any) {
    console.error('verifyPaymentAction error:', error)
    return { error: error.message || 'An unexpected error occurred' }
  }
}

/**
 * Reject a payment (Owner Action)
 */
export async function rejectPaymentAction(paymentId: string, reason: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Unauthorized' }
    }

    if (!reason || reason.trim() === '') {
      return { error: 'Rejection reason is required.' }
    }

    const { data: payment, error: updateError } = await supabase
      .from('payments')
      .update({
        status: 'rejected',
        rejection_reason: reason.trim(),
        verified_by: user.id,
        verified_at: new Date().toISOString()
      })
      .eq('id', paymentId)
      .select('booking_id')
      .single()

    if (updateError || !payment) {
      return { error: 'Failed to reject payment.' }
    }

    // Technical Debt: Instead of a new 'awaiting_reupload' state, we reset the booking's
    // created_at timestamp. This gives the customer a fresh 20-minute window
    // to re-upload before the expireUnpaidBookings cron job expires it.
    const { data: updatedBooking, error: bookingUpdateError } = await supabase
      .from('bookings')
      .update({ created_at: new Date().toISOString() })
      .eq('id', payment.booking_id)
      .select('customer_id')
      .single()

    if (bookingUpdateError) {
      console.error('Failed to reset booking created_at timer:', bookingUpdateError)
      // We don't fail the entire action here, but it's noted.
    }

    if (updatedBooking) {
      const { createNotification } = await import('./notifications')
      await createNotification({
        userId: updatedBooking.customer_id,
        type: 'payment_rejected',
        title: 'Pembayaran Ditolak',
        message: `Bukti pembayaran Anda ditolak. Silakan upload ulang bukti pembayaran dalam 20 menit.\nAlasan: ${reason.trim()}`,
        referenceId: paymentId,
        referenceType: 'payment'
      })
    }

    // Keep booking status as pending so customer can re-upload
    revalidatePath(`/owner/payments/${paymentId}`)
    revalidatePath('/owner/payments')
    revalidatePath(`/owner/bookings/${payment.booking_id}`)
    revalidatePath('/customer/bookings')
    revalidatePath(`/customer/bookings/${payment.booking_id}`)
    revalidatePath('/customer/dashboard')
    return { success: 'Payment rejected successfully.' }

  } catch (error: any) {
    console.error('rejectPaymentAction error:', error)
    return { error: error.message || 'An unexpected error occurred' }
  }
}
