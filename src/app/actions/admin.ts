'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleUserStatus(userId: string, currentStatus: boolean) {
  const supabase = await createClient()
  
  // Verify admin role
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
    
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
    
  if (profile?.role !== 'admin') throw new Error('Unauthorized')

  const { error } = await supabase
    .from('profiles')
    .update({ is_active: !currentStatus })
    .eq('id', userId)

  if (error) {
    console.error('Error toggling user status:', error)
    return { success: false, error: 'Failed to update user status' }
  }

  revalidatePath('/admin/users')
  return { success: true }
}

export async function suspendVenue(venueId: string) {
  return updateVenueStatus(venueId, 'suspended')
}

export async function updateVenueStatus(venueId: string, status: string) {
  const supabase = await createClient()
  
  // Verify admin role
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')
    
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
    
  if (profile?.role !== 'admin') throw new Error('Unauthorized')

  const { error } = await supabase
    .from('venues')
    .update({ status })
    .eq('id', venueId)

  if (error) {
    console.error('Error updating venue status:', error)
    return { success: false, error: 'Failed to update venue status' }
  }

  revalidatePath('/admin/venues')
  revalidatePath(`/admin/venues/${venueId}`)
  return { success: true }
}
