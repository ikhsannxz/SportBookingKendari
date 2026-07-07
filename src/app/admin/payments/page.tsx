import { getAdminPayments } from '@/lib/supabase/queries/admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/utils'

export const metadata = {
  title: 'Monitoring Pembayaran - Admin',
}

export default async function AdminPaymentsPage() {
  const payments = await getAdminPayments()

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Monitoring Pembayaran</h2>
        <p className="text-muted-foreground mt-1">Daftar semua pembayaran. Verifikasi tetap dilakukan oleh pemilik venue.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Pembayaran</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Booking Code</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Venue</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium uppercase">{payment.booking_id.split('-')[0]}</TableCell>
                    <TableCell>{payment.bookings?.profiles?.full_name}</TableCell>
                    <TableCell>{payment.bookings?.venues?.name}</TableCell>
                    <TableCell className="font-medium">{formatCurrency(payment.amount)}</TableCell>
                    <TableCell>
                      <Badge variant={payment.status === 'verified' ? 'default' : payment.status === 'rejected' ? 'destructive' : 'outline'} className="capitalize">
                        {payment.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {payments.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      Tidak ada data pembayaran.
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
