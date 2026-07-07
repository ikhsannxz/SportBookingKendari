import { createClient } from '../server'
import { Venue, VenueFacility, VenueImage } from '@/lib/types/database'

export async function getOwnerVenues() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []

  const { data, error } = await supabase
    .from('venues')
    .select('*, venue_images(url, is_primary)')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching venues:', error)
    return []
  }

  // We map this internally because the return type Venue doesn't include the nested array explicitly
  return data as (Venue & { venue_images?: { url: string; is_primary: boolean }[] })[]
}

export async function getVenueById(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data, error } = await supabase
    .from('venues')
    .select('*')
    .eq('id', id)
    .eq('owner_id', user.id)
    .single()

  if (error) {
    console.error('Error fetching venue:', error)
    return null
  }

  return data as Venue
}

export async function getVenueBySlug(slug: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('venues')
    .select(`
      *, 
      venue_images(url, is_primary), 
      venue_facilities(name, icon),
      profiles!venues_owner_id_fkey(full_name, email, phone, avatar_url),
      schedules(day_of_week, open_time, close_time, is_closed)
    `)
    .eq('slug', slug)
    .in('status', ['approved', 'maintenance'])
    .single()

  if (error || !data) {
    return null
  }

  return data as (Venue & { 
    venue_images?: { url: string; is_primary: boolean }[],
    venue_facilities?: { name: string; icon: string | null }[],
    profiles?: { full_name: string; email: string; phone: string | null; avatar_url: string | null },
    schedules?: { day_of_week: number; open_time: string; close_time: string; is_closed: boolean }[]
  })
}

export async function getVenueFacilities(venueId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('venue_facilities')
    .select('*')
    .eq('venue_id', venueId)

  if (error) {
    console.error('Error fetching facilities:', error)
    return []
  }

  return data as VenueFacility[]
}

export async function getVenueImages(venueId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('venue_images')
    .select('*')
    .eq('venue_id', venueId)
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('Error fetching images:', error)
    return []
  }

  return data as VenueImage[]
}

export async function getOwnerDashboardStats() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return { total: 0, active: 0, pending: 0, draft: 0 }

  const { data, error } = await supabase
    .from('venues')
    .select('status')
    .eq('owner_id', user.id)

  if (error) {
    console.error('Error fetching stats:', error)
    return { total: 0, active: 0, pending: 0, draft: 0 }
  }

  return {
    total: data.length,
    active: data.filter(v => v.status === 'active' || v.status === 'approved').length,
    pending: data.filter(v => v.status === 'pending').length,
    draft: data.filter(v => v.status === 'draft').length,
  }
}

export async function getFeaturedVenues(limitCount: number = 6) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('venues')
    .select('*, venue_images(url, is_primary)')
    .in('status', ['approved', 'maintenance'])
    .order('rating_avg', { ascending: false })
    .order('review_count', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(limitCount)

  if (error) {
    console.error('Error fetching featured venues:', error)
    return []
  }

  return data as (Venue & { venue_images?: { url: string; is_primary: boolean }[] })[]
}

export type SearchFilters = {
  sport?: string
  city?: string
  minPrice?: number
  maxPrice?: number
  q?: string
  sortBy?: string
}

export async function searchVenues(filters: SearchFilters) {
  const supabase = await createClient()
  
  let query = supabase
    .from('venues')
    .select('*, venue_images(url, is_primary)')
    .in('status', ['approved', 'maintenance'])

  if (filters.sport) {
    query = query.eq('sport_type', filters.sport)
  }
  
  if (filters.city) {
    const loc = filters.city.trim()
    if (loc) {
      query = query.or(`city.ilike.%${loc}%,district.ilike.%${loc}%`)
    }
  }
  
  if (filters.minPrice !== undefined && !isNaN(filters.minPrice)) {
    query = query.gte('price_per_hour', filters.minPrice)
  }
  
  if (filters.maxPrice !== undefined && !isNaN(filters.maxPrice)) {
    query = query.lte('price_per_hour', filters.maxPrice)
  }
  if (filters.q) {
    const queryText = filters.q.trim()
    if (queryText) {
      const sportTypes = ['futsal', 'badminton', 'basketball', 'tennis']
      const tokens = queryText.split(/\s+/).filter(Boolean)
      
      tokens.forEach(token => {
        // Find which enums match the token partially in memory
        const matchedSports = sportTypes.filter(s => s.includes(token.toLowerCase()))
        
        let orString = `name.ilike.%${token}%,city.ilike.%${token}%,district.ilike.%${token}%,address.ilike.%${token}%`
        
        // If the token matches any enum values, add an IN filter for those values
        if (matchedSports.length > 0) {
          orString += `,sport_type.in.(${matchedSports.join(',')})`
        }
        
        // For each word, it must match AT LEAST ONE of these fields.
        query = query.or(orString)
      })
    }
  }

  // Sorting logic
  if (filters.sortBy === 'price_asc') {
    query = query.order('price_per_hour', { ascending: true })
  } else if (filters.sortBy === 'price_desc') {
    query = query.order('price_per_hour', { ascending: false })
  } else if (filters.sortBy === 'rating_desc') {
    query = query.order('rating_avg', { ascending: false })
  } else {
    // default (recommendation)
    query = query.order('rating_avg', { ascending: false })
  }

  const { data, error } = await query

  if (error) {
    console.error('Error searching venues:', error)
    return []
  }

  return data as (Venue & { venue_images?: { url: string; is_primary: boolean }[] })[]
}

export async function getFavoriteVenues(userId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('favorites')
    .select(`
      id,
      created_at,
      venues (
        *,
        venue_images(url, is_primary)
      )
    `)
    .eq('customer_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching favorite venues:', error)
    return []
  }

  // Map to just return the array of venues to match other interfaces, 
  // but we can attach the favorite ID if needed. We'll just return the venues here.
  return data
    .map(fav => fav.venues)
    .filter(v => v !== null) as unknown as (Venue & { venue_images?: { url: string; is_primary: boolean }[] })[]
}
