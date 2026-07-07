/* eslint-disable @typescript-eslint/no-explicit-any */
import { getOwnerPayments } from '@/lib/supabase/queries/payments'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/ui/status-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, XCircle, Clock, Search, ArrowRight } from 'lucide-react'
import { format } from 'date-fns'
import Link from 'next/link'

export default async function OwnerPaymentsPage() {
  const payments = await getOwnerPayments()

  const pendingCount = payments.filter((p: any) => p.status === 'pending').length
  const verifiedCount = payments.filter((p: any) => p.status === 'verified').length
  const rejectedCount = payments.filter((p: any) => p.status === 'rejected').length

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Pembayaran</h2>
          <p className="text-muted-foreground">Manage and verify customer payments.</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-orange-50 border-orange-100">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600 mb-1">Pending Review</p>
              <h3 className="text-2xl font-bold text-orange-700">{pendingCount}</h3>
            </div>
            <Clock className="w-8 h-8 text-orange-500 opacity-50" />
          </CardContent>
        </Card>
        <Card className="bg-emerald-50 border-emerald-100">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-600 mb-1">Verified</p>
              <h3 className="text-2xl font-bold text-emerald-700">{verifiedCount}</h3>
            </div>
            <CheckCircle2 className="w-8 h-8 text-emerald-500 opacity-50" />
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-red-100">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600 mb-1">Rejected</p>
              <h3 className="text-2xl font-bold text-red-700">{rejectedCount}</h3>
            </div>
            <XCircle className="w-8 h-8 text-red-500 opacity-50" />
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="py-4">
          <CardTitle className="text-lg">Recent Payments</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {payments.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Search className="w-8 h-8 mx-auto mb-3 opacity-20" />
              <p>No payments found.</p>
            </div>
          ) : (
            <div className="divide-y">
              {payments.map((payment: any) => {
                const booking = payment.bookings
                const venue = booking.venues
                const customer = booking.profiles

                return (
                  <div key={payment.id} className="p-4 flex flex-col md:flex-row items-center justify-between gap-4 hover:bg-muted/30 transition-colors">
                    <div className="flex-1 min-w-0 flex items-center gap-4">
                       <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                          payment.status === 'verified' ? 'bg-emerald-100 text-emerald-600' :
                          payment.status === 'rejected' ? 'bg-red-100 text-red-600' :
                          'bg-orange-100 text-orange-600'
                       }`}>
                          {payment.status === 'verified' ? <CheckCircle2 className="w-6 h-6" /> :
                           payment.status === 'rejected' ? <XCircle className="w-6 h-6" /> :
                           <Clock className="w-6 h-6" />}
                       </div>
                       <div className="min-w-0">
                         <div className="flex items-center gap-2 mb-1">
                           <h4 className="font-semibold truncate">{booking.booking_code}</h4>
                           <StatusBadge status={payment.status} />
                         </div>
                         <p className="text-sm text-muted-foreground truncate">
                           {customer.full_name} • {venue.name} • {format(new Date(payment.created_at), 'dd MMM yyyy HH:mm')}
                         </p>
                       </div>
                    </div>
                    <div className="flex items-center gap-4 shrink-0 w-full md:w-auto justify-between md:justify-end">
                      <div className="text-right">
                         <p className="font-bold">Rp {Number(payment.amount).toLocaleString('id-ID')}</p>
                         <p className="text-xs text-muted-foreground uppercase">{payment.payment_method}</p>
                      </div>
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/owner/payments/${payment.id}`}>
                          <ArrowRight className="w-5 h-5" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
