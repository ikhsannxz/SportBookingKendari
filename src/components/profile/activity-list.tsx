import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

interface ActivityListProps {
  role: 'customer' | 'owner'
  recentBookings: any[]
  recentVenues?: any[]
}

const statusMap: Record<string, { label: string, variant: "default" | "secondary" | "destructive" | "outline" }> = {
  pending: { label: 'Menunggu', variant: 'outline' },
  confirmed: { label: 'Dikonfirmasi', variant: 'default' },
  completed: { label: 'Selesai', variant: 'secondary' },
  cancelled: { label: 'Dibatalkan', variant: 'destructive' },
  expired: { label: 'Kedaluwarsa', variant: 'destructive' },
}

const venueStatusMap: Record<string, { label: string, variant: "default" | "secondary" | "destructive" | "outline" }> = {
  draft: { label: 'Draft', variant: 'outline' },
  pending: { label: 'Menunggu', variant: 'secondary' },
  approved: { label: 'Disetujui', variant: 'default' },
  rejected: { label: 'Ditolak', variant: 'destructive' },
}

export function ActivityList({ role, recentBookings, recentVenues }: ActivityListProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Booking Terbaru</CardTitle>
          <CardDescription>
            {role === 'customer' 
              ? '5 reservasi terakhir yang Anda buat.' 
              : '5 reservasi terakhir di venue Anda.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {recentBookings && recentBookings.length > 0 ? (
            <div className="space-y-4">
              {recentBookings.map((booking) => {
                const status = statusMap[booking.status] || { label: booking.status, variant: 'outline' }
                return (
                  <div key={booking.id} className="flex flex-col sm:flex-row justify-between sm:items-center p-4 border rounded-lg gap-4">
                    <div>
                      <p className="font-semibold">{booking.booking_code}</p>
                      <p className="text-sm text-muted-foreground mt-1">
                        {booking.venues?.name}
                        {role === 'owner' && booking.profiles?.full_name && ` • ${booking.profiles.full_name}`}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(booking.booking_date), 'd MMM yyyy', { locale: id })} • {booking.start_time.slice(0, 5)} - {booking.end_time.slice(0, 5)}
                      </p>
                    </div>
                    <Badge variant={status.variant}>{status.label}</Badge>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">Belum ada aktivitas booking.</p>
          )}
        </CardContent>
      </Card>

      {role === 'owner' && recentVenues && (
        <Card>
          <CardHeader>
            <CardTitle>Venue Terbaru</CardTitle>
            <CardDescription>Venue yang terakhir Anda tambahkan.</CardDescription>
          </CardHeader>
          <CardContent>
            {recentVenues.length > 0 ? (
              <div className="space-y-4">
                {recentVenues.map((venue) => {
                  const status = venueStatusMap[venue.status] || { label: venue.status, variant: 'outline' }
                  return (
                    <div key={venue.id} className="flex flex-col sm:flex-row justify-between sm:items-center p-4 border rounded-lg gap-4">
                      <div>
                        <p className="font-semibold">{venue.name}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Ditambahkan pada {format(new Date(venue.created_at), 'd MMM yyyy', { locale: id })}
                        </p>
                      </div>
                      <Badge variant={status.variant}>{status.label}</Badge>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">Belum ada venue ditambahkan.</p>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}
