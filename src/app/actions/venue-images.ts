'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function uploadVenueImageAction(venueId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'Unauthorized' }
  }

  const file = formData.get('file') as File
  if (!file) {
    return { error: 'No file provided' }
  }

  // Check if owner actually owns this venue
  const { data: venue } = await supabase
    .from('venues')
    .select('id')
    .eq('id', venueId)
    .eq('owner_id', user.id)
    .single()

  if (!venue) {
    return { error: 'Venue not found or unauthorized' }
  }

  // Generate a unique file name
  const fileExt = file.name.split('.').pop()
  const fileName = `venues/${user.id}/${venueId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
  // Upload to Supabase Storage
  const { error: uploadError } = await supabase.storage
    .from('venue-images')
    .upload(fileName, file)

  if (uploadError) {
    return { error: `Upload failed: ${uploadError.message}` }
  }

  // Get the public URL
  const { data: publicUrlData } = supabase.storage
    .from('venue-images')
    .getPublicUrl(fileName)

  // Insert into venue_images table
  const { error: dbError } = await supabase
    .from('venue_images')
    .insert({
      venue_id: venueId,
      url: publicUrlData.publicUrl,
      is_primary: false, // by default not primary, user can select it
      sort_order: 0
    })

  if (dbError) {
    // Optionally clean up the storage file if db insert fails
    await supabase.storage.from('venue-images').remove([fileName])
    return { error: `Database error: ${dbError.message}` }
  }

  // If this is the only image, make it primary
  const { data: existingImages } = await supabase
    .from('venue_images')
    .select('id')
    .eq('venue_id', venueId)

  if (existingImages && existingImages.length === 1) {
    await supabase
      .from('venue_images')
      .update({ is_primary: true })
      .eq('venue_id', venueId)
  }

  revalidatePath('/owner/venues')
  revalidatePath(`/owner/venues/${venueId}`)
  revalidatePath(`/owner/venues/${venueId}/edit`)

  return { success: 'Image uploaded successfully' }
}

export async function deleteVenueImageAction(imageId: string, venueId: string, imageUrl: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  // Check ownership
  const { data: venue } = await supabase
    .from('venues')
    .select('id')
    .eq('id', venueId)
    .eq('owner_id', user.id)
    .single()

  if (!venue) return { error: 'Venue not found or unauthorized' }

  // Extract path from public URL
  // URL format: https://[project].supabase.co/storage/v1/object/public/venue-images/[venueId]/[filename.ext]
  const bucketPath = 'venue-images/'
  const pathIndex = imageUrl.indexOf(bucketPath)

  if (pathIndex !== -1) {
    const filePath = imageUrl.substring(pathIndex + bucketPath.length)

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('venue-images')
      .remove([filePath])

    if (storageError) {
      console.error('Storage deletion failed', storageError)
      // We will still try to delete the db record
    }
  }

  // Delete from DB
  const { error: dbError } = await supabase
    .from('venue_images')
    .delete()
    .eq('id', imageId)
    .eq('venue_id', venueId)

  if (dbError) {
    return { error: dbError.message }
  }

  revalidatePath('/owner/venues')
  revalidatePath(`/owner/venues/${venueId}`)
  revalidatePath(`/owner/venues/${venueId}/edit`)

  return { success: 'Image deleted' }
}

export async function setPrimaryImageAction(imageId: string, venueId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { error: 'Unauthorized' }

  // Check ownership
  const { data: venue } = await supabase
    .from('venues')
    .select('id')
    .eq('id', venueId)
    .eq('owner_id', user.id)
    .single()

  if (!venue) return { error: 'Venue not found or unauthorized' }

  // First, set all images for this venue to not primary
  await supabase
    .from('venue_images')
    .update({ is_primary: false })
    .eq('venue_id', venueId)

  // Set the selected one to primary
  const { error } = await supabase
    .from('venue_images')
    .update({ is_primary: true })
    .eq('id', imageId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/owner/venues')
  revalidatePath(`/owner/venues/${venueId}`)
  revalidatePath(`/owner/venues/${venueId}/edit`)

  return { success: 'Primary image updated' }
}
