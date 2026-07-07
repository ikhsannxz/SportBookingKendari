import { getAdminBookings } from '@/lib/supabase/queries/admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, formatDate } from '@/lib/utils'

export const metadata = {
  title: 'Monitoring Booking - Admin',
}

export default async function AdminBookingsPage() {
  const bookings = await getAdminBookings()

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Monitoring Booking</h2>
        <p className="text-muted-foreground mt-1">Daftar semua transaksi booking di platform.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Booking</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking Code</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Venue</TableHead>
                  <TableHead>Tanggal</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {bookings?.map((booking) => (
                  <TableRow key={booking.id}>
                    <TableCell className="font-medium uppercase">{booking.booking_code}</TableCell>
                    <TableCell>{booking.profiles?.full_name || booking.profiles?.email}</TableCell>
                    <TableCell>{booking.venues?.name}</TableCell>
                    <TableCell>{formatDate(booking.booking_date)}</TableCell>
                    <TableCell>{`${booking.start_time.slice(0, 5)} - ${booking.end_time.slice(0, 5)}`}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {booking.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {(!bookings || bookings.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                      Tidak ada data booking.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
