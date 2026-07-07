import { getCustomerBookings } from '@/lib/supabase/queries/bookings'
import { CustomerBookingList } from '@/components/customer/booking-list'
import { expireUnpaidBookings } from '@/app/actions/bookings'

export default async function CustomerBookingsPage() {
  await expireUnpaidBookings()
  const bookings = await getCustomerBookings()

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Booking Saya</h1>
      <CustomerBookingList bookings={bookings} />
    </div>
  )
}
