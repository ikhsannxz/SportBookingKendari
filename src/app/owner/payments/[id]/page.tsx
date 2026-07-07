import { notFound } from 'next/navigation'
import { getOwnerPaymentById } from '@/lib/supabase/queries/payments'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/ui/status-badge'
import { PaymentActionButtons } from '@/components/owner/payment-action-buttons'
import { CalendarDays, Clock, MapPin, User, Mail, Phone, ExternalLink } from 'lucide-react'
import { format } from 'date-fns'
import Image from 'next/image'
import { expireUnpaidBookings } from '@/app/actions/bookings'

export default async function OwnerPaymentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await expireUnpaidBookings()
  const { id } = await params
  console.log("params =", await params)
  console.log("id =", id)

  const payment = await getOwnerPaymentById(id)

  if (!payment) {
    notFound()
  }

  const booking = payment.bookings
  const venue = booking.venues
  const customer = booking.profiles

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Payment Details</h2>
          <p className="text-muted-foreground flex items-center gap-2">
            Booking Code: <span className="font-mono font-medium">{booking.booking_code}</span>
          </p>
        </div>
        <StatusBadge status={payment.status} className="text-sm px-3 py-1" />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Left Column: Details */}
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5 text-muted-foreground" /> Customer Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center text-lg font-bold">
                  {customer.full_name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium">{customer.full_name}</p>
                </div>
              </div>
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="flex items-center gap-2"><Mail className="w-4 h-4" /> {customer.email}</p>
                {customer.phone && <p className="flex items-center gap-2"><Phone className="w-4 h-4" /> {customer.phone}</p>}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-muted-foreground" /> Booking Info
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">Venue</p>
                <p className="font-medium flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-muted-foreground" /> {venue.name}
                </p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Date & Time</p>
                <p className="font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4 text-muted-foreground" /> 
                  {format(new Date(booking.booking_date), 'dd MMM yyyy')}, {booking.start_time.substring(0, 5)} - {booking.end_time.substring(0, 5)}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Payment Proof & Actions */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-4 border-b">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Bukti Pembayaran</CardTitle>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground uppercase">{payment.payment_method}</p>
                  <p className="text-xl font-bold text-emerald-600">Rp {Number(payment.amount).toLocaleString('id-ID')}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              {payment.proof_url ? (
                <div className="space-y-4">
                  <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-muted border">
                    {payment.proof_url.endsWith('.pdf') ? (
                       <iframe src={payment.proof_url} className="w-full h-full" title="PDF Proof" />
                    ) : (
                       <Image unoptimized 
                         src={payment.proof_url} 
                         alt="Payment Proof" 
                         fill 
                         className="object-contain"
                       />
                    )}
                  </div>
                  <div className="flex justify-end">
                    <a href={payment.proof_url} target="_blank" rel="noreferrer" className="text-sm flex items-center gap-1 text-blue-600 hover:underline">
                      Open original file <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center border-2 border-dashed rounded-xl bg-muted/20">
                  <p className="text-muted-foreground">Customer has not uploaded a payment proof yet.</p>
                </div>
              )}
            </CardContent>
          </Card>

          {payment.proof_url && (
            <Card>
              <CardContent className="p-6">
                <PaymentActionButtons paymentId={payment.id} currentStatus={payment.status} />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
