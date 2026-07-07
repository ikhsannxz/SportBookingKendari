import { createClient } from '../server'

export async function getAdminStats() {
  const supabase = await createClient()

  // Profiles
  const { count: usersCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'customer')

  const { count: ownersCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .eq('role', 'owner')

  // Venues
  const { count: venuesCount } = await supabase
    .from('venues')
    .select('*', { count: 'exact', head: true })

  // Bookings
  const { data: bookings } = await supabase
    .from('bookings')
    .select('id, total_price, status')
    
  const totalBookings = bookings?.length || 0
  const totalRevenue = bookings?.filter(b => b.status === 'completed').reduce((acc, curr) => acc + (Number(curr.total_price) || 0), 0) || 0

  // Pending Payments
  const { count: pendingPayments } = await supabase
    .from('payments')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  return {
    totalUsers: usersCount || 0,
    totalOwners: ownersCount || 0,
    totalVenues: venuesCount || 0,
    totalBookings,
    totalRevenue,
    pendingPayments: pendingPayments || 0
  }
}

export async function getAdminUsers() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching admin users:', error)
    return []
  }
  return data
}

export async function getAdminVenues() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('venues')
    .select('*, profiles(full_name, email)')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching admin venues:', error)
    return []
  }
  return data
}

export async function getAdminBookings() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('bookings')
    .select('*, profiles(full_name, email), venues(name)')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching admin bookings:', error)
    throw new Error(error.message)
  }
  return data
}

export async function getAdminPayments() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('payments')
    .select('*, bookings(id, total_price, booking_date, profiles(full_name), venues(name))')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching admin payments:', error)
    return []
  }
  return data
}

export async function getAdminVenueById(id: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('venues')
    .select(`
      *,
      profiles:profiles!venues_owner_id_fkey(full_name, email, phone),
      venue_images(*),
      venue_facilities(*),
      schedules(*)
    `)
    .eq('id', id)
    .single()

  if (error) {
    console.error('Error fetching admin venue by id:', error)
    return null
  }
  return data
}

export async function getAdminRecentBookings() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('bookings')
    .select('*, profiles(full_name), venues(name)')
    .order('created_at', { ascending: false })
    .limit(5)
  return data || []
}

export async function getAdminPendingPayments() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('payments')
    .select('*, bookings(id, total_price, booking_date, profiles(full_name), venues(name))')
    .eq('status', 'pending')
    .order('created_at', { ascending: false })
    .limit(5)
  return data || []
}

export async function getAdminRecentVenues() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('venues')
    .select('*, profiles(full_name)')
    .order('created_at', { ascending: false })
    .limit(5)
  return data || []
}

export async function getAdminReports() {
  const supabase = await createClient()
  
  const { data: bookings } = await supabase
    .from('bookings')
    .select('id, total_price, status, booking_date, venues(name, owner_id), profiles(full_name)')
    
  if (!bookings) return null

  const completedBookings = bookings.filter(b => b.status === 'completed')
  const totalRevenue = completedBookings.reduce((sum, b) => sum + (Number(b.total_price) || 0), 0)

  // Booking Trend (last 7 days)
  const last7Days = Array.from({length: 7}, (_, i) => {
    const d = new Date()
    d.setDate(d.getDate() - i)
    return d.toISOString().split('T')[0]
  }).reverse()

  const trendData = last7Days.map(date => {
    const dayBookings = bookings.filter(b => b.booking_date === date)
    return {
      date,
      bookings: dayBookings.length,
      revenue: dayBookings.filter(b => b.status === 'completed').reduce((sum, b) => sum + (Number(b.total_price) || 0), 0)
    }
  })

  // Venue Distribution (by sport type)
  const { data: venues } = await supabase.from('venues').select('sport_type, owner_id')
  const distribution = venues?.reduce((acc: Record<string, number>, curr) => {
    acc[curr.sport_type] = (acc[curr.sport_type] || 0) + 1
    return acc
  }, {}) || {}
  
  const venueDistribution = Object.entries(distribution).map(([name, value]) => ({ name, value }))

  // Top Venue
  const venueCounts = bookings.reduce((acc: Record<string, number>, curr) => {
    const v = curr.venues as any
    const venueName = Array.isArray(v) ? v[0]?.name : v?.name
    if (venueName) {
      acc[venueName] = (acc[venueName] || 0) + 1
    }
    return acc
  }, {})
  const topVenueName = Object.keys(venueCounts).length > 0 ? Object.keys(venueCounts).reduce((a, b) => venueCounts[a] > venueCounts[b] ? a : b) : 'N/A'

  // Most Booked Sport
  const { data: bookingsWithSport } = await supabase.from('bookings').select('venues(sport_type)')
  const sportCounts = bookingsWithSport?.reduce((acc: Record<string, number>, curr) => {
    const v = curr.venues as any
    const sport = Array.isArray(v) ? v[0]?.sport_type : v?.sport_type
    if (sport) {
      acc[sport] = (acc[sport] || 0) + 1
    }
    return acc
  }, {}) || {}
  const mostBookedSport = Object.keys(sportCounts).length > 0 ? Object.keys(sportCounts).reduce((a, b) => sportCounts[a] > sportCounts[b] ? a : b) : 'N/A'

  // Most Active Owner
  const { data: owners } = await supabase.from('profiles').select('id, full_name')
  const ownerCounts = bookings.reduce((acc: Record<string, number>, curr) => {
    const v = curr.venues as any
    const ownerId = Array.isArray(v) ? v[0]?.owner_id : v?.owner_id
    if (ownerId) {
      acc[ownerId] = (acc[ownerId] || 0) + 1
    }
    return acc
  }, {})
  const topOwnerId = Object.keys(ownerCounts).length > 0 ? Object.keys(ownerCounts).reduce((a, b) => ownerCounts[a] > ownerCounts[b] ? a : b) : null
  const mostActiveOwner = topOwnerId ? owners?.find(o => o.id === topOwnerId)?.full_name || 'Unknown' : 'N/A'

  return {
    totalRevenue,
    trendData,
    venueDistribution,
    topVenueName,
    mostBookedSport,
    mostActiveOwner
  }
}
