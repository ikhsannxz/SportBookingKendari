'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export type VenueActionState = {
  error?: string
  success?: string
}

function generateSlug(name: string) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Math.floor(Math.random() * 1000)
}

export async function createVenueAction(formData: FormData): Promise<VenueActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const name = formData.get('name') as string
  const sport_type = formData.get('sport_type') as string
  const price_per_hour = parseFloat(formData.get('price_per_hour') as string)
  const description = formData.get('description') as string
  const address = formData.get('address') as string
  const city = formData.get('city') as string
  const district = formData.get('district') as string
  const latitude = formData.get('latitude') ? parseFloat(formData.get('latitude') as string) : null
  const longitude = formData.get('longitude') ? parseFloat(formData.get('longitude') as string) : null
  let status = formData.get('status') as string || 'pending'
  // Enforce new venue status
  if (status !== 'draft' && status !== 'pending') {
    status = 'pending'
  }
  
  const maintenance_reason = formData.get('maintenance_reason') ? formData.get('maintenance_reason') as string : null
  const maintenance_until = formData.get('maintenance_until') ? formData.get('maintenance_until') as string : null

  const slug = generateSlug(name)

  const facilitiesRaw = formData.get('facilities') as string
  const facilities = facilitiesRaw ? JSON.parse(facilitiesRaw) : []

  const schedulesRaw = formData.get('schedules') as string
  const schedules = schedulesRaw ? JSON.parse(schedulesRaw) : []

  const images = formData.getAll('images') as File[]
  const primaryImageIndex = parseInt(formData.get('primaryImageIndex') as string) || 0

  // 1. Insert Venue
  const { data: venue, error: venueError } = await supabase
    .from('venues')
    .insert({
      owner_id: user.id,
      name,
      slug,
      sport_type,
      price_per_hour,
      description,
      address,
      city,
      district,
      latitude,
      longitude,
      status,
      maintenance_reason,
      maintenance_until,
    })
    .select()
    .single()

  if (venueError || !venue) {
    console.error('Error creating venue:', venueError)
    return { error: venueError?.message || 'Failed to create venue' }
  }

  // 2. Insert Facilities
  if (facilities.length > 0) {
    const facilitiesData = facilities.map((f: string) => ({
      venue_id: venue.id,
      name: f
    }))
    await supabase.from('venue_facilities').insert(facilitiesData)
  }

  // 3. Insert Schedules
  if (schedules.length > 0) {
    const schedulesData = schedules.map((s: any) => ({
      venue_id: venue.id,
      day_of_week: s.day_of_week,
      open_time: s.open_time,
      close_time: s.close_time,
      is_closed: s.is_closed
    }))
    await supabase.from('schedules').insert(schedulesData)
  }

  // 4. Upload Images
  if (images && images.length > 0) {
    const uploadPromises = images.map(async (file, index) => {
      const fileExt = file.name.split('.').pop()
      const fileName = `venues/${user.id}/${venue.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('venue-images')
        .upload(fileName, file)

      if (uploadError) {
        throw new Error(`Upload failed for ${file.name}: ${uploadError.message}`)
      }
      
      const { data: publicUrlData } = supabase.storage
        .from('venue-images')
        .getPublicUrl(fileName)
        
      return {
        venue_id: venue.id,
        url: publicUrlData.publicUrl,
        is_primary: index === primaryImageIndex,
        sort_order: index
      }
    })

    try {
      const imageRecords = await Promise.all(uploadPromises)
      
      // 4. Insert venue_images records
      const { error: dbError } = await supabase.from('venue_images').insert(imageRecords)
      
      if (dbError) {
        throw new Error(`Database error: ${dbError.message}`)
      }
    } catch (error: unknown) {
      console.error('Image upload failed, rolling back:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      // Rollback: list files in this venue's folder and delete them
      const { data: filesList } = await supabase.storage.from('venue-images').list(`venues/${user.id}/${venue.id}`)
      if (filesList && filesList.length > 0) {
         const pathsToRemove = filesList.map(f => `venues/${user.id}/${venue.id}/${f.name}`)
         await supabase.storage.from('venue-images').remove(pathsToRemove)
      }
      
      // Delete venue (cascades to facilities)
      await supabase.from('venues').delete().eq('id', venue.id)
      
      return { error: errorMessage || 'Failed to upload images' }
    }
  }

  revalidatePath('/owner/venues')
  redirect('/owner/venues')
}

export async function updateVenueAction(id: string, formData: FormData): Promise<VenueActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  const name = formData.get('name') as string
  const sport_type = formData.get('sport_type') as string
  const price_per_hour = parseFloat(formData.get('price_per_hour') as string)
  const description = formData.get('description') as string
  const address = formData.get('address') as string
  const city = formData.get('city') as string
  const district = formData.get('district') as string
  const latitude = formData.get('latitude') ? parseFloat(formData.get('latitude') as string) : null
  const longitude = formData.get('longitude') ? parseFloat(formData.get('longitude') as string) : null
  
  const maintenance_reason = formData.get('maintenance_reason') ? formData.get('maintenance_reason') as string : null
  const maintenance_until = formData.get('maintenance_until') ? formData.get('maintenance_until') as string : null
  // Enforce owner status transition rules
  const { data: existingVenue } = await supabase
    .from('venues')
    .select('status')
    .eq('id', id)
    .eq('owner_id', user.id)
    .single()

  if (!existingVenue) {
    return { error: 'Venue not found or unauthorized' }
  }

  let status = existingVenue.status
  const requestedStatus = formData.get('status') as string

  if (requestedStatus) {
    const allowedTransitions: Record<string, string[]> = {
      'draft': ['draft', 'pending'],
      'pending': ['pending', 'draft'],
      'approved': ['approved', 'maintenance'],
      'maintenance': ['maintenance', 'approved'],
      'rejected': ['rejected', 'draft'],
      'suspended': ['suspended']
    }
    
    if (allowedTransitions[existingVenue.status]?.includes(requestedStatus)) {
      status = requestedStatus
    }
  }

  const facilitiesRaw = formData.get('facilities') as string
  const facilities = facilitiesRaw ? JSON.parse(facilitiesRaw) : []

  const schedulesRaw = formData.get('schedules') as string
  const schedules = schedulesRaw ? JSON.parse(schedulesRaw) : []

  // 1. Update Venue
  const { error: venueError } = await supabase
    .from('venues')
    .update({
      name,
      sport_type,
      price_per_hour,
      description,
      address,
      city,
      district,
      latitude,
      longitude,
      status,
      maintenance_reason: status === 'maintenance' ? maintenance_reason : null,
      maintenance_until: status === 'maintenance' ? maintenance_until : null,
    })
    .eq('id', id)
    .eq('owner_id', user.id) // Ensure ownership

  if (venueError) {
    console.error('Error updating venue:', venueError)
    return { error: venueError.message }
  }

  // 2. Update Facilities (Delete existing, insert new)
  await supabase.from('venue_facilities').delete().eq('venue_id', id)
  if (facilities.length > 0) {
    const facilitiesData = facilities.map((f: string) => ({
      venue_id: id,
      name: f
    }))
    await supabase.from('venue_facilities').insert(facilitiesData)
  }

  // 3. Update Schedules
  if (schedules.length > 0) {
    const schedulesData = schedules.map((s: any) => ({
      venue_id: id,
      day_of_week: s.day_of_week,
      open_time: s.open_time,
      close_time: s.close_time,
      is_closed: s.is_closed
    }))
    await supabase.from('schedules').upsert(schedulesData, { onConflict: 'venue_id, day_of_week' })
  }

  revalidatePath('/owner/venues')
  revalidatePath(`/owner/venues/${id}/edit`)
  return { success: 'Venue updated successfully' }
}

export async function deleteVenueAction(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Verify ownership
  const { data: venue } = await supabase
    .from('venues')
    .select('id')
    .eq('id', id)
    .eq('owner_id', user.id)
    .single()

  if (!venue) {
    return { error: 'Venue not found or unauthorized' }
  }

  // Fetch all images for this venue to delete from storage
  const { data: images } = await supabase
    .from('venue_images')
    .select('url')
    .eq('venue_id', id)

  if (images && images.length > 0) {
    const bucketPath = 'venue-images/'
    const filePaths = images.map(img => {
      const pathIndex = img.url.indexOf(bucketPath)
      if (pathIndex !== -1) {
        return img.url.substring(pathIndex + bucketPath.length)
      }
      return null
    }).filter(Boolean) as string[]

    if (filePaths.length > 0) {
      const { error: storageError } = await supabase.storage.from('venue-images').remove(filePaths)
      if (storageError) {
        console.error('Failed to delete storage images:', storageError)
      }
    }
  }

  // Delete the venue (database will cascade to delete venue_images, venue_facilities, schedules)
  const { error } = await supabase
    .from('venues')
    .delete()
    .eq('id', id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/owner/venues')
  return { success: 'Venue deleted successfully' }
}

export async function updateSchedulesAction(venueId: string, schedules: {day_of_week: number, open_time: string, close_time: string, is_closed: boolean}[]) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Not authenticated' }
  }

  // Verify ownership
  const { data: venue } = await supabase.from('venues').select('id').eq('id', venueId).eq('owner_id', user.id).single()
  if (!venue) return { error: 'Venue not found or unauthorized' }

  // Upsert schedules
  const schedulesToInsert = schedules.map(s => ({
    venue_id: venueId,
    day_of_week: s.day_of_week,
    open_time: s.open_time,
    close_time: s.close_time,
    is_closed: s.is_closed
  }))

  const { error } = await supabase
    .from('schedules')
    .upsert(schedulesToInsert, { onConflict: 'venue_id, day_of_week' })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/owner/schedules')
  return { success: 'Schedules updated successfully' }
}
