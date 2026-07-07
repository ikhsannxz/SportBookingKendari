/* eslint-disable @typescript-eslint/no-explicit-any */
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { ArrowLeft, MapPin, Calendar, Clock, CreditCard, User, Mail, Phone, CheckCircle2, XCircle, FileText } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/ui/status-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getOwnerBookingById } from '@/lib/supabase/queries/bookings'
import { BookingActionButtons } from '@/components/owner/booking-action-buttons'
import Image from 'next/image'
import { getVenueImage } from '@/lib/utils'
import { DownloadInvoiceButton } from '@/components/customer/download-invoice-button'

export default async function OwnerBookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  console.log("params =", await params)
  console.log("id =", id)

  const booking = await getOwnerBookingById(id)

  if (!booking) {
    notFound()
  }

  const primaryImage = getVenueImage((booking.venues as any).venue_images)
  const customer = booking.profiles as any
  const payment = booking.payments && booking.payments.length > 0 ? booking.payments[0] : null
  const isPdf = payment?.proof_url ? payment.proof_url.split('?')[0].toLowerCase().endsWith('.pdf') : false

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8 space-y-6">
      <Button variant="ghost" asChild className="mb-4">
        <Link href="/owner/bookings">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Bookings
        </Link>
      </Button>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main Details */}
        <div className="flex-1 space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">Booking #{booking.booking_code}</h1>
              <p className="text-muted-foreground flex items-center gap-2">
                Created on {format(new Date(booking.created_at), 'dd MMM yyyy, HH:mm')}
              </p>
            </div>
            <StatusBadge status={booking.status} className="text-sm px-3 py-1" />
          </div>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Linimasa Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 justify-between max-w-2xl">
                <div className="flex flex-col items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${booking.status !== 'cancelled' && booking.status !== 'expired' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>1</div>
                  <span className="text-xs font-medium">Menunggu</span>
                </div>
                <div className={`h-[2px] flex-1 ${booking.status === 'confirmed' || booking.status === 'completed' ? 'bg-primary' : (booking.status === 'cancelled' || booking.status === 'expired') ? 'bg-red-500' : 'bg-muted'}`} />
                <div className="flex flex-col items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${booking.status === 'confirmed' || booking.status === 'completed' ? 'bg-primary text-primary-foreground' : (booking.status === 'cancelled' || booking.status === 'expired') ? 'bg-red-500 text-white' : 'bg-muted text-muted-foreground'}`}>
                    {(booking.status === 'cancelled' || booking.status === 'expired') ? <XCircle className="w-4 h-4" /> : '2'}
                  </div>
                  <span className="text-xs font-medium">{booking.status === 'cancelled' ? 'Dibatalkan' : booking.status === 'expired' ? 'Kedaluwarsa' : 'Dikonfirmasi'}</span>
                </div>
                {booking.status !== 'cancelled' && booking.status !== 'expired' && (
                  <>
                    <div className={`h-[2px] flex-1 ${booking.status === 'completed' ? 'bg-primary' : 'bg-muted'}`} />
                    <div className="flex flex-col items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${booking.status === 'completed' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                        {booking.status === 'completed' ? <CheckCircle2 className="w-4 h-4" /> : '3'}
                      </div>
                      <span className="text-xs font-medium">Selesai</span>
                    </div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Jadwal & Informasi Venue</CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-semibold">Tanggal</p>
                    <p className="font-medium">{format(new Date(booking.booking_date), 'EEEE, dd MMMM yyyy')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground uppercase font-semibold">Waktu & Durasi</p>
                    <p className="font-medium">
                      {booking.start_time.substring(0, 5)} - {booking.end_time.substring(0, 5)} 
                      <span className="text-muted-foreground font-normal ml-1">({booking.duration_hours} Jam)</span>
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex gap-4 p-4 bg-muted/30 rounded-xl">
                <div className="w-16 h-16 bg-muted rounded-lg relative overflow-hidden shrink-0">
                  {primaryImage ? (
                    <Image unoptimized src={primaryImage} alt={(booking.venues as any).name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">Tidak Ada Gambar</div>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">{(booking.venues as any).name}</h3>
                  <p className="text-muted-foreground flex items-center text-xs mb-2">
                    <MapPin className="w-3 h-3 mr-1" />
                    {(booking.venues as any).district}, {(booking.venues as any).city}
                  </p>
                  <Badge variant="outline" className="capitalize text-xs">{(booking.venues as any).sport_type}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {booking.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Catatan Pelanggan</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm bg-muted/50 p-4 rounded-lg whitespace-pre-wrap">{booking.notes}</p>
              </CardContent>
            </Card>
          )}

        </div>

        {/* Sidebar / Customer Info & Actions */}
        <div className="w-full lg:w-[380px] shrink-0 space-y-6">
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Bukti Pembayaran</CardTitle>
            </CardHeader>
            <CardContent>
              {!payment || !payment.proof_url ? (
                <div className="p-4 bg-muted text-center rounded-xl text-sm">
                  <p>Pelanggan belum mengunggah bukti pembayaran.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {isPdf ? (
                    <div className="p-4 bg-muted text-center rounded-xl text-sm">
                      <p className="mb-4">Bukti pembayaran adalah dokumen PDF.</p>
                      <Button variant="outline" className="w-full" asChild>
                        <a href={payment.proof_url} target="_blank" rel="noopener noreferrer">
                          View PDF
                        </a>
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div className="relative w-full aspect-[3/4] rounded-lg overflow-hidden border">
                        <Image
                          src={payment.proof_url}
                          alt="Payment Proof"
                          fill
                          unoptimized
                          className="object-contain bg-muted/30"
                        />
                      </div>
                      <Button variant="outline" className="w-full" asChild>
                        <a href={payment.proof_url} target="_blank" rel="noopener noreferrer">
                          View Full Image
                        </a>
                      </Button>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <BookingActionButtons bookingId={booking.id} currentStatus={booking.status} />

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="w-5 h-5 text-primary" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-muted overflow-hidden relative shrink-0">
                  {customer?.avatar_url ? (
                    <Image unoptimized src={customer.avatar_url} alt={customer.full_name} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-primary/10 text-primary font-semibold">
                      {customer?.full_name?.substring(0, 2).toUpperCase() || 'C'}
                    </div>
                  )}
                </div>
                <div>
                  <p className="font-medium">{customer?.full_name || 'Pelanggan Tidak Diketahui'}</p>
                  <p className="text-xs text-muted-foreground">Pengguna Terdaftar</p>
                </div>
              </div>
              <div className="h-px bg-border w-full my-2" />
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span>{customer?.email || 'No email provided'}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span>{customer?.phone || 'No phone provided'}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                Payment Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Harga per jam</span>
                <span>Rp {(booking.total_price / booking.duration_hours).toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Duration</span>
                <span>{booking.duration_hours} Jam</span>
              </div>
              <div className="h-px bg-border w-full my-2" />
              <div className="flex justify-between items-center">
                <span className="font-bold">Total Harga</span>
                <span className="font-bold text-xl text-primary">Rp {booking.total_price.toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between items-center text-sm pt-2">
                <span className="text-muted-foreground">Status Pembayaran</span>
                {payment?.status ? (
                  <StatusBadge status={payment.status} />
                ) : booking.status === 'pending' ? (
                  <StatusBadge status="unpaid" />
                ) : booking.status === 'cancelled' ? (
                  <StatusBadge status="cancelled" />
                ) : booking.status === 'expired' ? (
                  <StatusBadge status="expired" />
                ) : (
                  <StatusBadge status="verified" />
                )}
              </div>
            </CardContent>
          </Card>

          {(booking.status === 'confirmed' || booking.status === 'completed' || payment?.status === 'verified') && (
            <DownloadInvoiceButton bookingId={booking.id} />
          )}

        </div>
      </div>
    </div>
  )
}
