/* eslint-disable @typescript-eslint/no-explicit-any */
import Link from 'next/link'
import { format, parseISO } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import { ArrowLeft, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { StatusBadge } from '@/components/ui/status-badge'
import { getOwnerBookings } from '@/lib/supabase/queries/bookings'
import { CalendarNavigation } from './calendar-navigation'

export default async function OwnerBookingCalendarPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const params = await searchParams
  const dateParam = typeof params?.date === 'string' 
    ? params.date 
    : new Date().toISOString().split('T')[0]
  
  // getOwnerBookings handles 'all' status
  const allBookings = await getOwnerBookings()
  
  // Only show bookings matching the specific date parameter
  const dateBookings = allBookings.filter(b => b.booking_date === dateParam)

  // Sort by time
  dateBookings.sort((a, b) => a.start_time.localeCompare(b.start_time))

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'border-orange-500 bg-orange-50 text-orange-900'
      case 'confirmed': return 'border-emerald-500 bg-emerald-50 text-emerald-900'
      case 'completed': return 'border-blue-500 bg-blue-50 text-blue-900'
      case 'cancelled': return 'border-red-500 bg-red-50 text-red-900'
      case 'expired': return 'border-gray-500 bg-gray-50 text-gray-900'
      default: return 'border-gray-200 bg-gray-50 text-gray-900'
    }
  }



  return (
    <div className="container max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" asChild>
          <Link href="/owner/bookings">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to List
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Booking Calendar</h1>
      </div>

      <div className="bg-card border rounded-xl p-4 md:p-6 space-y-6 shadow-sm">
        <CalendarNavigation currentDate={dateParam} />

        <div className="pt-6 border-t">
          <h2 className="text-2xl font-bold mb-6 text-center text-primary">
            {format(parseISO(`${dateParam}T00:00:00`), 'd MMMM yyyy', { locale: localeId })}
          </h2>

          {dateBookings.length === 0 ? (
            <div className="py-12 text-center rounded-xl bg-muted/30 border border-dashed">
              <p className="text-muted-foreground font-medium">Tidak ada booking pada tanggal ini</p>
            </div>
          ) : (
            <div className="space-y-4 max-w-3xl mx-auto">
              {dateBookings.map(booking => (
                <div 
                  key={booking.id}
                  className={`flex flex-col md:flex-row md:items-center justify-between p-4 rounded-lg border-l-4 shadow-sm transition-colors hover:shadow-md ${getStatusColor(booking.status)}`}
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-lg flex items-center">
                        <Clock className="w-4 h-4 mr-1.5 opacity-70" />
                        {booking.start_time.substring(0, 5)} - {booking.end_time.substring(0, 5)}
                      </span>
                      
                      <StatusBadge status={booking.status} />
                      
                      {booking.payments?.[0]?.status && (
                        <StatusBadge status={booking.payments[0].status} />
                      )}
                    </div>
                    
                    <div>
                      <p className="font-semibold text-[15px]">{booking.venues?.name || 'Unknown Venue'}</p>
                      <p className="text-sm opacity-90">{(booking.profiles as any)?.full_name || 'No Name'}</p>
                      <p className="text-xs opacity-70 font-mono mt-0.5">{booking.booking_code}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
