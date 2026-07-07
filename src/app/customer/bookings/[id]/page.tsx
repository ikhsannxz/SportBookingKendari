/* eslint-disable @typescript-eslint/no-explicit-any */
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { ArrowLeft, MapPin, Calendar, Clock, CreditCard, FileText } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getCustomerBookingById } from '@/lib/supabase/queries/bookings'
import { PaymentUploadForm } from '@/components/customer/payment-upload-form'
import Image from 'next/image'
import { getVenueImage } from '@/lib/utils'
import { expireUnpaidBookings } from '@/app/actions/bookings'
import { DownloadInvoiceButton } from '@/components/customer/download-invoice-button'

export default async function CustomerBookingDetailPage({ params }: { params: Promise<{ id: string }> }) {
  await expireUnpaidBookings()
  const { id } = await params
  console.log("params =", await params)
  console.log("id =", id)

  const booking = await getCustomerBookingById(id)

  if (!booking) {
    notFound()
  }

  const primaryImage = getVenueImage((booking.venues as any).venue_images)
  const payment = booking.payments && booking.payments.length > 0 ? booking.payments[0] : null
  const ownerProfile = (booking.venues as any)?.profiles

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8 space-y-6">
      <Button variant="ghost" asChild className="mb-4">
        <Link href="/customer/bookings">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali ke Booking
        </Link>
      </Button>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Main Details */}
        <div className="flex-1 space-y-6">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight mb-2">Detail Booking</h1>
              <p className="text-muted-foreground flex items-center gap-2">
                <span className="font-mono bg-muted px-2 py-1 rounded text-sm text-foreground">
                  {booking.booking_code}
                </span>
              </p>
            </div>
            <Badge
              className={
                booking.status === 'confirmed' ? 'bg-emerald-500 text-white border-none' :
                booking.status === 'pending' ? 'bg-orange-500 text-white border-none' :
                booking.status === 'completed' ? 'bg-blue-500 text-white border-none' :
                'bg-red-500 text-white border-none'
              }
            >
              {booking.status.toUpperCase()}
            </Badge>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informasi Venue</CardTitle>
            </CardHeader>
            <CardContent className="flex gap-4">
              <div className="w-24 h-24 bg-muted rounded-xl relative overflow-hidden shrink-0">
                {primaryImage ? (
                  <Image unoptimized src={primaryImage} alt={(booking.venues as any).name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground text-xs">Tidak Ada Gambar</div>
                )}
              </div>
              <div>
                <h3 className="font-bold text-xl mb-1">{(booking.venues as any).name}</h3>
                <p className="text-muted-foreground flex items-center text-sm mb-2">
                  <MapPin className="w-4 h-4 mr-1" />
                  {(booking.venues as any).address}, {(booking.venues as any).district}, {(booking.venues as any).city}
                </p>
                <Badge variant="outline" className="capitalize">{(booking.venues as any).sport_type}</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informasi Jadwal</CardTitle>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-6">
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
            </CardContent>
          </Card>

          {booking.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Catatan</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm bg-muted/50 p-4 rounded-lg">{booking.notes}</p>
              </CardContent>
            </Card>
          )}

        </div>

        {/* Sidebar / Payment Summary */}
        <div className="w-full md:w-80 shrink-0 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                Ringkasan Pembayaran
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Harga per jam</span>
                <span>Rp {(booking.total_price / booking.duration_hours).toLocaleString('id-ID')}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Durasi</span>
                <span>{booking.duration_hours} Jam</span>
              </div>
              <div className="h-px bg-border w-full my-2" />
              <div className="flex justify-between items-center">
                <span className="font-bold">Total Harga</span>
                <span className="font-bold text-xl text-primary">Rp {booking.total_price.toLocaleString('id-ID')}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Metode Pembayaran</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {ownerProfile?.qris_image_url ? (
                <>
                  <p className="text-sm text-muted-foreground text-center">
                    Scan QRIS di bawah ini menggunakan Mobile Banking atau E-Wallet Anda untuk menyelesaikan pembayaran.
                  </p>
                  
                  <div className="flex justify-center">
                    <div className="relative w-[220px] h-[220px]">
                      <Image
                        unoptimized
                        src={ownerProfile.qris_image_url}
                        alt="QRIS Payment"
                        fill
                        className="rounded-lg border object-contain"
                      />
                    </div>
                  </div>

                  <div className="text-center space-y-2">
                    <p className="font-semibold text-sm">Pembayaran Ditujukan Kepada<br/><span className="text-primary text-base">{ownerProfile.full_name}</span></p>
                    <div>
                      <p className="text-sm font-medium">Metode: QRIS</p>
                      <div className="flex flex-wrap justify-center gap-x-2 gap-y-1 text-xs text-muted-foreground mt-1">
                        <span>• BCA</span>
                        <span>• Mandiri</span>
                        <span>• DANA</span>
                        <span>• OVO</span>
                        <span>• GoPay</span>
                        <span>• ShopeePay</span>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-8 text-center space-y-3">
                  <div className="mx-auto w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600 mb-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                  </div>
                  <h3 className="font-semibold text-lg text-orange-700">QRIS Pembayaran Belum Tersedia</h3>
                  <p className="text-sm text-muted-foreground max-w-[250px] mx-auto">
                    Pemilik venue belum mengatur metode pembayaran QRIS.
                  </p>
                </div>
              )}

              <div className="p-3 bg-muted text-muted-foreground border rounded-lg text-xs text-center">
                Setelah menyelesaikan pembayaran Anda, silakan upload bukti pembayaran Anda menggunakan form di bawah ini. Pembayaran Anda akan diverifikasi oleh pemilik venue.
              </div>
            </CardContent>
          </Card>

          {payment && (
            <PaymentUploadForm 
              bookingId={booking.id} 
              bookingStatus={booking.status}
              paymentStatus={payment.status} 
              rejectionReason={payment.rejection_reason} 
            />
          )}

          {booking.status === 'expired' && (
            <div className="p-4 bg-red-50 text-red-800 text-center rounded-xl text-sm border border-red-200">
              <p>Booking ini telah kedaluwarsa karena tidak ada pembayaran.</p>
            </div>
          )}

          {!payment && booking.status === 'pending' && (
            <div className="p-4 bg-muted text-center rounded-xl text-sm">
              <p>Informasi pembayaran tidak tersedia.</p>
            </div>
          )}
          
          {(booking.status === 'confirmed' || booking.status === 'completed' || payment?.status === 'verified') && (
            <DownloadInvoiceButton bookingId={booking.id} />
          )}

        </div>
      </div>
    </div>
  )
}
