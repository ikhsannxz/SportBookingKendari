import { createClient } from '../server'
import { Profile } from '@/lib/types/database'

export async function getProfileStats(userId: string, role: string) {
  const supabase = await createClient()
  
  if (role === 'customer') {
    const { count: totalBookings } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('customer_id', userId)
      
    const { count: completedBookings } = await supabase
      .from('bookings')
      .select('*', { count: 'exact', head: true })
      .eq('customer_id', userId)
      .eq('status', 'completed')
      
    const { data: bookings } = await supabase
      .from('bookings')
      .select('id')
      .eq('customer_id', userId)
      
    let totalSpent = 0
    if (bookings && bookings.length > 0) {
      const { data: payments } = await supabase
        .from('payments')
        .select('amount')
        .in('booking_id', bookings.map(b => b.id))
        .eq('status', 'verified')
        
      totalSpent = payments?.reduce((acc, p) => acc + p.amount, 0) || 0
    }

    return {
      totalBookings: totalBookings || 0,
      completedBookings: completedBookings || 0,
      totalSpent
    }
  } else if (role === 'owner') {
    const { count: totalVenues } = await supabase
      .from('venues')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', userId)
      
    const { count: activeVenues } = await supabase
      .from('venues')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', userId)
      .eq('status', 'approved')

    const { data: venues } = await supabase
      .from('venues')
      .select('id')
      .eq('owner_id', userId)
      
    let totalBookings = 0
    let totalRevenue = 0
    
    if (venues && venues.length > 0) {
      const venueIds = venues.map(v => v.id)
      
      const { count: bookingsCount } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .in('venue_id', venueIds)
        
      totalBookings = bookingsCount || 0
      
      const { data: bookings } = await supabase
        .from('bookings')
        .select('id')
        .in('venue_id', venueIds)
        
      if (bookings && bookings.length > 0) {
        const { data: payments } = await supabase
          .from('payments')
          .select('amount')
          .in('booking_id', bookings.map(b => b.id))
          .eq('status', 'verified')
          
        totalRevenue = payments?.reduce((acc, p) => acc + p.amount, 0) || 0
      }
    }

    return {
      totalVenues: totalVenues || 0,
      activeVenues: activeVenues || 0,
      totalBookings,
      totalRevenue
    }
  }
}

export async function getRecentCustomerBookings(userId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      id,
      booking_code,
      booking_date,
      start_time,
      end_time,
      status,
      total_price,
      venues (name)
    `)
    .eq('customer_id', userId)
    .order('created_at', { ascending: false })
    .limit(5)
    
  if (error) {
    console.error('Error fetching recent bookings:', error)
    return []
  }
  
  return data
}

export async function getRecentOwnerBookings(userId: string) {
  const supabase = await createClient()
  
  const { data: venues } = await supabase
    .from('venues')
    .select('id')
    .eq('owner_id', userId)
    
  if (!venues || venues.length === 0) return []
  
  const { data, error } = await supabase
    .from('bookings')
    .select(`
      id,
      booking_code,
      booking_date,
      start_time,
      end_time,
      status,
      total_price,
      venues (name),
      profiles!bookings_customer_id_fkey (full_name)
    `)
    .in('venue_id', venues.map(v => v.id))
    .order('created_at', { ascending: false })
    .limit(5)
    
  if (error) {
    console.error('Error fetching owner bookings:', error)
    return []
  }
  
  return data
}

export async function getRecentOwnerVenues(userId: string) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('venues')
    .select('id, name, status, created_at')
    .eq('owner_id', userId)
    .order('created_at', { ascending: false })
    .limit(5)
    
  if (error) {
    console.error('Error fetching recent venues:', error)
    return []
  }
  
  return data
}
