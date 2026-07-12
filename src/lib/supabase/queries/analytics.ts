import { createClient } from '../server'
import { startOfDay, startOfMonth, parseISO } from 'date-fns'

export async function getOwnerVenueAnalytics() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return {
      total: 0,
      active: 0, // treating active as approved
      pending: 0,
      draft: 0,
      rejected: 0,
      avgRating: 0,
      totalReviews: 0
    }
  }

  const { data, error } = await supabase
    .from('venues')
    .select('status, rating_avg, review_count')
    .eq('owner_id', user.id)

  if (error) {
    console.error('Error fetching analytics:', error)
    return { total: 0, active: 0, pending: 0, draft: 0, rejected: 0, avgRating: 0, totalReviews: 0 }
  }

  const active = data.filter(v => v.status === 'active' || v.status === 'approved').length
  const pending = data.filter(v => v.status === 'pending').length
  const draft = data.filter(v => v.status === 'draft').length
  const rejected = data.filter(v => v.status === 'rejected' || v.status === 'suspended').length
  
  // Calculate aggregated rating and reviews
  let totalRatingSum = 0
  let totalReviews = 0
  
  data.forEach(v => {
    totalReviews += v.review_count || 0
    if (v.review_count > 0 && v.rating_avg > 0) {
      totalRatingSum += (v.rating_avg * v.review_count)
    }
  })

  const avgRating = totalReviews > 0 ? (totalRatingSum / totalReviews).toFixed(1) : '0.0'

  return {
    total: data.length,
    active,
    pending,
    draft,
    rejected,
    avgRating: parseFloat(avgRating as string),
    totalReviews,
  }
}

export async function getOwnerAnalytics() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const defaultStats = {
    totalRevenue: 0,
    revenueToday: 0,
    revenueThisMonth: 0,
    verifiedPayments: 0,
    pendingPayments: 0,
    completedBookings: 0,
    averageBookingValue: 0
  }

  if (!user) return defaultStats

  // 1. Get owner's venues
  const { data: venues } = await supabase
    .from('venues')
    .select('id')
    .eq('owner_id', user.id)

  const venueIds = venues?.map(v => v.id) || []
  
  if (venueIds.length === 0) return defaultStats

  // 2. Get bookings for these venues
  const { data: bookings } = await supabase
    .from('bookings')
    .select('id, status')
    .in('venue_id', venueIds)

  const bookingIds = bookings?.map(b => b.id) || []
  
  // 3. Get payments for these bookings
  let payments: { amount: number | string; status: string; verified_at: string | null; booking_id: string }[] = []
  if (bookingIds.length > 0) {
    const { data: paymentsData } = await supabase
      .from('payments')
      .select('amount, status, verified_at, booking_id')
      .in('booking_id', bookingIds)
      
    payments = paymentsData || []
  }

  // Calculations
  let totalRevenue = 0
  let revenueToday = 0
  let revenueThisMonth = 0
  let verifiedPayments = 0
  let pendingPayments = 0

  const now = new Date()
  const todayStart = startOfDay(now)
  const monthStart = startOfMonth(now)

  payments.forEach(payment => {
    if (payment.status === 'verified') {
      const amount = Number(payment.amount)
      totalRevenue += amount
      verifiedPayments++

      if (payment.verified_at) {
        const verifiedDate = parseISO(payment.verified_at)
        if (verifiedDate >= todayStart) {
          revenueToday += amount
        }
        if (verifiedDate >= monthStart) {
          revenueThisMonth += amount
        }
      }
    } else if (payment.status === 'pending') {
      const booking = bookings?.find(b => b.id === payment.booking_id);
      if (booking && ['pending', 'confirmed'].includes(booking.status)) {
        pendingPayments++
      }
    }
  })

  const completedBookings = bookings?.filter(b => b.status === 'completed').length || 0
  const averageBookingValue = verifiedPayments > 0 ? totalRevenue / verifiedPayments : 0

  return {
    totalRevenue,
    revenueToday,
    revenueThisMonth,
    verifiedPayments,
    pendingPayments,
    completedBookings,
    averageBookingValue
  }
}

export async function getOwnerChartData() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const defaultData = {
    monthlyRevenueData: [],
    monthlyBookingData: [],
    totalBookings: 0,
    bookingsThisMonth: 0,
    totalRevenue: 0,
  }

  if (!user) return defaultData

  const { data: venues } = await supabase
    .from('venues')
    .select('id')
    .eq('owner_id', user.id)

  const venueIds = venues?.map(v => v.id) || []
  if (venueIds.length === 0) return defaultData

  const { data: bookings } = await supabase
    .from('bookings')
    .select('id, created_at, status')
    .in('venue_id', venueIds)

  const bookingIds = bookings?.map(b => b.id) || []
  
  let payments: { amount: number | string; verified_at: string | null; status: string }[] = []
  if (bookingIds.length > 0) {
    const { data: paymentsData } = await supabase
      .from('payments')
      .select('amount, verified_at, status')
      .in('booking_id', bookingIds)
    payments = paymentsData || []
  }

  const now = new Date()
  const monthStart = startOfMonth(now)
  
  // Aggregate Bookings
  const monthlyBookingsMap: Record<string, number> = {}
  let totalBookings = 0
  let bookingsThisMonth = 0

  bookings?.forEach(b => {
    totalBookings++
    const bDate = parseISO(b.created_at)
    if (bDate >= monthStart) {
      bookingsThisMonth++
    }
    
    const monthKey = b.created_at.substring(0, 7) // YYYY-MM
    monthlyBookingsMap[monthKey] = (monthlyBookingsMap[monthKey] || 0) + 1
  })

  // Aggregate Revenue
  const monthlyRevenueMap: Record<string, number> = {}
  let totalRevenue = 0

  payments.forEach(p => {
    if (p.status === 'verified' && p.verified_at) {
      const amount = Number(p.amount)
      totalRevenue += amount
      
      const monthKey = p.verified_at.substring(0, 7) // YYYY-MM
      monthlyRevenueMap[monthKey] = (monthlyRevenueMap[monthKey] || 0) + amount
    }
  })

  // Convert to arrays and sort by month
  const monthlyBookingData = Object.entries(monthlyBookingsMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, count]) => ({ month, bookings: count }))

  const monthlyRevenueData = Object.entries(monthlyRevenueMap)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, revenue]) => ({ month, revenue }))

  return {
    monthlyBookingData,
    monthlyRevenueData,
    totalBookings,
    bookingsThisMonth,
    totalRevenue
  }
}

