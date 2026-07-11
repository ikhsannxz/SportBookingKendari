'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addFavoriteAction(venueId: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Silakan masuk terlebih dahulu untuk menyimpan venue ke favorit.', needsLogin: true }
    }

    // Since RLS is active, customer check is implicitly handled, but we can verify role just in case
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
      
    if (profile?.role !== 'customer') {
      return { error: 'Hanya pelanggan yang dapat menyimpan favorit.' }
    }

    const { error } = await supabase
      .from('favorites')
      .insert({ customer_id: user.id, venue_id: venueId })

    if (error) {
      if (error.code === '23505') { // Unique violation
        return { success: 'Venue sudah ada di favorit Anda.' }
      }
      throw error
    }

    await supabase.from('notifications').insert({
      user_id: user.id,
      type: 'system',
      title: 'Venue Ditambahkan ke Favorit',
      message: 'Venue berhasil ditambahkan ke daftar favorit Anda.',
      reference_id: venueId,
      reference_type: 'venue'
    })

    revalidatePath('/customer/favorites')
    revalidatePath('/')
    revalidatePath('/search')
    revalidatePath('/venues/[slug]', 'page')
    
    return { success: 'Venue berhasil ditambahkan ke favorit.', isFavorite: true }
  } catch (error) {
    console.error('Error adding favorite:', error)
    return { error: 'Terjadi kesalahan saat menambahkan ke favorit.' }
  }
}

export async function removeFavoriteAction(venueId: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Silakan masuk terlebih dahulu untuk menghapus venue dari favorit.', needsLogin: true }
    }

    const { error } = await supabase
      .from('favorites')
      .delete()
      .eq('customer_id', user.id)
      .eq('venue_id', venueId)

    if (error) throw error

    await supabase.from('notifications').insert({
      user_id: user.id,
      type: 'system',
      title: 'Venue Dihapus dari Favorit',
      message: 'Venue berhasil dihapus dari daftar favorit Anda.',
      reference_id: venueId,
      reference_type: 'venue'
    })

    revalidatePath('/customer/favorites')
    revalidatePath('/')
    revalidatePath('/search')
    revalidatePath('/venues/[slug]', 'page')
    
    return { success: 'Venue berhasil dihapus dari favorit.', isFavorite: false }
  } catch (error) {
    console.error('Error removing favorite:', error)
    return { error: 'Terjadi kesalahan saat menghapus dari favorit.' }
  }
}

export async function toggleFavoriteAction(venueId: string) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'Silakan masuk terlebih dahulu untuk menyimpan venue ke favorit.', needsLogin: true }
    }

    // Check if it already exists
    const { data: existing } = await supabase
      .from('favorites')
      .select('id')
      .eq('customer_id', user.id)
      .eq('venue_id', venueId)
      .single()

    if (existing) {
      return await removeFavoriteAction(venueId)
    } else {
      return await addFavoriteAction(venueId)
    }
  } catch (error) {
    console.error('Error toggling favorite:', error)
    return { error: 'Terjadi kesalahan saat mengatur favorit.' }
  }
}

export async function getFavoritesAction() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return []

    const { data, error } = await supabase
      .from('favorites')
      .select('venue_id')
      .eq('customer_id', user.id)

    if (error) throw error

    return data.map(f => f.venue_id)
  } catch (error) {
    console.error('Error fetching favorites:', error)
    return []
  }
}
