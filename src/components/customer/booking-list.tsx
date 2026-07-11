/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useTransition, useState } from 'react'
import { Calendar, Clock, MapPin, Upload, Loader2, Image as ImageIcon, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/ui/status-badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { format } from 'date-fns'
import { cancelBookingAction } from '@/app/actions/bookings'
import { toast } from 'sonner'
import Image from 'next/image'
import Link from 'next/link'
import { getVenueImage, getGoogleMapsUrl } from '@/lib/utils'
import { EmptyState } from '@/components/ui/empty-state'

interface BookingListProps {
  bookings: any[]
}

export function CustomerBookingList({ bookings }: BookingListProps) {
  const [isPending, startTransition] = useTransition()
  const [bookingToCancel, setBookingToCancel] = useState<string | null>(null)

  const confirmCancel = () => {
    if (!bookingToCancel) return

    startTransition(async () => {
      const result = await cancelBookingAction(bookingToCancel)
      if (result.error) {
        toast.error(result.error)
      } else if (result.success) {
        toast.success(result.success)
      }
      setBookingToCancel(null)
    })
  }

  const upcomingBookings = bookings.filter(b => b.status === 'pending' || b.status === 'confirmed')
  const completedBookings = bookings.filter(b => b.status === 'completed')
  const cancelledBookings = bookings.filter(b => b.status === 'cancelled' || b.status === 'expired')

  const renderBookingCard = (booking: any) => {
    const primaryImage = getVenueImage(booking.venues.venue_images)
    const payment = booking.payments?.[0]
    const paymentStatus = payment?.status

    const canUpload = booking.status === 'pending' && (paymentStatus === 'unpaid' || paymentStatus === 'rejected')

    return (
      <Card key={booking.id} className={canUpload ? 'border-orange-500/50 shadow-sm' : ''}>
        <CardContent className="p-4 sm:p-6 flex flex-col sm:flex-row gap-6">
          <div className="w-full sm:w-32 h-32 bg-muted rounded-xl shrink-0 overflow-hidden relative flex items-center justify-center">
            {primaryImage ? (
              <Image unoptimized src={primaryImage} alt={booking.venues.name} fill className="object-cover" />
            ) : (
              <ImageIcon className="w-8 h-8 text-muted-foreground/50" />
            )}
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex justify-between items-start">
              <h3 className="font-semibold text-lg">{booking.venues.name}</h3>
              <div className="flex flex-col gap-1 items-end">
                {booking.status === 'cancelled' && <StatusBadge status="cancelled" />}
                {booking.status === 'completed' && <StatusBadge status="completed" />}
                
                {booking.status !== 'cancelled' && booking.status !== 'completed' && paymentStatus && (
                  <StatusBadge status={paymentStatus} />
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-muted-foreground text-sm flex items-center">
                <MapPin className="w-4 h-4 mr-1" /> {booking.venues.district}, {booking.venues.city}
              </p>
              {(() => {
                const mapsUrl = getGoogleMapsUrl(booking.venues)
                if (mapsUrl) {
                  return (
                    <a href={mapsUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-xs text-primary hover:underline font-medium">
                      <ExternalLink className="w-3 h-3 mr-1" />
                      Lokasi
                    </a>
                  )
                }
                return null
              })()}
            </div>
            <div className="flex items-center gap-4 text-sm font-medium mt-2">
              <span className="flex items-center bg-primary/10 text-primary px-2 py-1 rounded">
                <Calendar className="w-4 h-4 mr-2" />
                {format(new Date(booking.booking_date), 'dd MMM yyyy')}
              </span>
              <span className="flex items-center bg-primary/10 text-primary px-2 py-1 rounded">
                <Clock className="w-4 h-4 mr-2" />
                {booking.start_time.substring(0, 5)} - {booking.end_time.substring(0, 5)}
              </span>
            </div>
            <div className="text-xs text-muted-foreground mt-2">
              Kode Booking: <span className="font-bold">{booking.booking_code}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className={`${canUpload ? 'bg-orange-500/5' : 'bg-muted/30'} border-t p-4 flex flex-col sm:flex-row justify-between items-center gap-4`}>
          <div className="w-full sm:w-auto">
            {canUpload && <span className="text-sm text-orange-600 block">Pembayaran dibutuhkan</span>}
            <span className="text-sm text-muted-foreground block">Total Harga</span>
            <span className="font-bold">Rp {booking.total_price.toLocaleString('id-ID')}</span>
          </div>

          <div className="w-full sm:w-auto flex gap-2">
            {canUpload && (
              <Button
                asChild
                className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600"
              >
                <Link href={`/customer/bookings/${booking.id}`}>
                  <Upload className="w-4 h-4 mr-2" />
                  Upload Bukti Pembayaran
                </Link>
              </Button>
            )}

            {booking.status === 'pending' && (
              <Button
                variant="outline"
                className="text-destructive border-destructive hover:bg-destructive/10"
                onClick={() => setBookingToCancel(booking.id)}
                disabled={isPending && bookingToCancel === booking.id}
              >
                {isPending && bookingToCancel === booking.id && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Batalkan
              </Button>
            )}

            <Button variant="outline" asChild>
              <Link href={`/customer/bookings/${booking.id}`}>Lihat Detail</Link>
            </Button>
          </div>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Tabs defaultValue="upcoming" className="w-full">
      <TabsList className="grid w-full sm:w-[400px] grid-cols-3">
        <TabsTrigger value="upcoming">Booking Mendatang ({upcomingBookings.length})</TabsTrigger>
        <TabsTrigger value="completed">Selesai</TabsTrigger>
        <TabsTrigger value="cancelled">Dibatalkan</TabsTrigger>
      </TabsList>

      <TabsContent value="upcoming" className="mt-6 space-y-4">
        {upcomingBookings.length === 0 ? (
          <EmptyState
            icon="calendar"
            title="Belum Ada Booking"
            description="Anda belum memiliki booking yang dijadwalkan."
            actionLabel="Cari Venue"
            actionHref="/search"
          />
        ) : (
          upcomingBookings.map(renderBookingCard)
        )}
      </TabsContent>

      <TabsContent value="completed" className="mt-6 space-y-4">
        {completedBookings.length === 0 ? (
          <EmptyState
            icon="calendar"
            title="Belum Ada Histori"
            description="Anda belum memiliki histori booking yang selesai."
          />
        ) : (
          completedBookings.map(renderBookingCard)
        )}
      </TabsContent>

      <TabsContent value="cancelled" className="mt-6 space-y-4">
        {cancelledBookings.length === 0 ? (
          <EmptyState
            icon="calendar"
            title="Belum Ada Booking Dibatalkan"
            description="Tidak ada riwayat booking yang dibatalkan."
          />
        ) : (
          cancelledBookings.map(renderBookingCard)
        )}
      </TabsContent>

      <Dialog open={!!bookingToCancel} onOpenChange={(open) => !open && !isPending && setBookingToCancel(null)}>
        <DialogContent showCloseButton={!isPending}>
          <DialogHeader>
            <DialogTitle>Batalkan Booking</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin membatalkan booking ini? Booking yang dibatalkan tidak dapat dipulihkan.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBookingToCancel(null)} disabled={isPending}>
              Kembali
            </Button>
            <Button variant="destructive" onClick={confirmCancel} disabled={isPending}>
              {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Ya, Batalkan Booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Tabs>
  )
}
