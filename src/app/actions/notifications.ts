'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createNotification({
  userId,
  type,
  title,
  message,
  referenceId,
  referenceType
}: {
  userId: string
  type: 'booking_created' | 'booking_confirmed' | 'booking_cancelled' | 'booking_completed' | 'payment_uploaded' | 'payment_verified' | 'payment_rejected' | 'venue_approved' | 'venue_rejected' | 'review_received' | 'system'
  title: string
  message: string
  referenceId?: string
  referenceType?: string
}) {
  const supabase = await createClient()

  const payload = {
    user_id: userId,
    type,
    title,
    message,
    reference_id: referenceId,
    reference_type: referenceType
  };
  
  console.log('[NOTIFICATION] Creating', payload)

  const { error } = await supabase
    .from('notifications')
    .insert(payload)

  if (error) {
    throw error
  }
  
  console.log('[NOTIFICATION] Success')
}

export async function markNotificationAsRead(notificationId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return

  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId)
    .eq('user_id', user.id)
}

export async function markAllNotificationsAsRead() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return

  await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('user_id', user.id)
    .eq('is_read', false)
}
