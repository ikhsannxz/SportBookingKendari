import { createClient } from '../server'

export async function getOwnerPayments() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return []

  const { data, error } = await supabase
    .from('payments')
    .select(`
      *,
      bookings!inner(
        booking_code, booking_date, start_time, end_time, duration_hours, customer_id, status,
        venues!inner(name, owner_id),
        profiles!inner(full_name)
      )
    `)
    .eq('bookings.venues.owner_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching owner payments:', error)
    return []
  }

  return data
}

export async function getOwnerPaymentById(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null

  const { data, error } = await supabase
    .from('payments')
    .select(`
      *,
      bookings!inner(
        booking_code, booking_date, start_time, end_time, duration_hours, customer_id, total_price, status,
        venues!inner(name, district, city, owner_id),
        profiles!inner(full_name, email, phone, avatar_url)
      )
    `)
    .eq('id', id)
    .eq('bookings.venues.owner_id', user.id)
    .single()

  if (error) {
    console.error('Error fetching owner payment by id:', error)
    return null
  }

  return data
}
