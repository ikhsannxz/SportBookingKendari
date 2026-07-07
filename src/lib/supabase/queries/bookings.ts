import { createClient } from '../server'

export async function getCustomerBookings() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  const { data, error } = await supabase
    .from('bookings')
    .select('*, venues(name, address, city, district, venue_images(url, is_primary)), payments(id, status, proof_url, rejection_reason)')
    .eq('customer_id', user.id)
    .order('booking_date', { ascending: false })
    .order('start_time', { ascending: false })

  if (error) {
    console.error('Error fetching customer bookings:', error)
    return []
  }

  return data
}

export async function getCustomerBookingById(bookingId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data, error } = await supabase
    .from('bookings')
    .select('*, venues(name, address, city, district, sport_type, venue_images(url, is_primary), profiles(full_name, qris_image_url)), payments(*)')
    .eq('id', bookingId)
    .eq('customer_id', user.id)
    .single()

  if (error) {
    console.error("Supabase Error");
    console.error("message:", error.message);
    console.error("details:", error.details);
    console.error("hint:", error.hint);
    console.error("code:", error.code);
    console.error(error);

    return null;
  }

  return data
}

export async function getOwnerBookings(status: string = 'all', search: string = '') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return []

  // Get bookings for venues owned by the user
  let query = supabase
    .from('bookings')
    .select('*, venues!inner(name, owner_id), profiles(full_name, email), payments(id, status, proof_url)')
    .eq('venues.owner_id', user.id)

  if (status && status !== 'all') {
    query = query.eq('status', status)
  }

  const { data, error } = await query
    .order('booking_date', { ascending: false })
    .order('start_time', { ascending: false })

  if (error) {
    console.error('Error fetching owner bookings:', error)
    return []
  }

  let filteredData = data
  if (search) {
    const term = search.toLowerCase()
    filteredData = data.filter((b) => 
      (b.booking_code && b.booking_code.toLowerCase().includes(term)) ||
      (b.profiles?.full_name && b.profiles.full_name.toLowerCase().includes(term))
    )
  }

  return filteredData
}

export async function getCustomerDashboardStats() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { upcoming: 0, completed: 0, totalSpent: 0, favorites: 0 }

  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('bookings')
    .select('status, booking_date, total_price')
    .eq('customer_id', user.id)

  const { count: favoritesCount } = await supabase
    .from('favorites')
    .select('*', { count: 'exact', head: true })
    .eq('customer_id', user.id)

  if (error) {
    return { upcoming: 0, completed: 0, totalSpent: 0, favorites: favoritesCount || 0 }
  }

  const completedBookings = data.filter(b => b.status === 'completed')
  const totalSpent = completedBookings.reduce((sum, b) => sum + (Number(b.total_price) || 0), 0)

  return {
    upcoming: data.filter(b => (b.status === 'confirmed' || b.status === 'pending') && b.booking_date >= today).length,
    completed: completedBookings.length,
    totalSpent,
    favorites: favoritesCount || 0
  }
}

export async function getOwnerBookingStats() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { pending: 0, today: 0 }

  const today = new Date().toISOString().split('T')[0]

  const { data, error } = await supabase
    .from('bookings')
    .select('status, booking_date, venues!inner(owner_id)')
    .eq('venues.owner_id', user.id)

  if (error) {
    return { pending: 0, today: 0 }
  }

  return {
    pending: data.filter(b => b.status === 'pending').length,
    today: data.filter(b => b.booking_date === today && b.status !== 'cancelled').length
  }
}

export async function getOwnerBookingById(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return null

  const { data, error } = await supabase
    .from('bookings')
    .select('*, venues!inner(*, venue_images(*)), profiles(*), payments(*)')
    .eq('id', id)
    .eq('venues.owner_id', user.id)
    .single()

  if (error) {
    console.error('Error fetching owner booking by id:', error)
    return null
  }

  return data
}
