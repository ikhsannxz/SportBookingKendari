/* eslint-disable @typescript-eslint/no-explicit-any */
'use client'

import { useTransition } from 'react'
import { CheckCircle2, XCircle, CheckSquare, Loader2, Eye } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/ui/status-badge'
import { format } from 'date-fns'
import { toast } from 'sonner'
import { updateBookingStatusAction } from '@/app/actions/bookings'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export interface BookingData {
  id: string
  booking_code: string
  profiles?: { full_name: string } | null
  venues?: { name: string } | null
  booking_date: string
  start_time: string
  end_time: string
  total_price: number
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'expired'
  payments?: any[]
}

interface BookingTableProps {
  bookings: any[]
  showActions?: boolean
}

export function BookingTable({ bookings, showActions = true }: BookingTableProps) {
  const [isPending, startTransition] = useTransition()
  const searchParams = useSearchParams()
  const highlightedBooking = searchParams.get('booking')

  const handleUpdateStatus = (bookingId: string, newStatus: 'confirmed' | 'rejected' | 'completed') => {
    startTransition(async () => {
      const result = await updateBookingStatusAction(bookingId, newStatus)
      if (result.error) {
        toast.error(result.error)
      } else if (result.success) {
        toast.success(result.success)
      }
    })
  }

  if (bookings.length === 0) {
    return (
      <div className="p-8 text-center border rounded-xl bg-muted/20">
        <p className="text-muted-foreground">Tidak ada booking ditemukan</p>
      </div>
    )
  }

  const statusMap: Record<string, string> = {
    pending: 'Menunggu',
    confirmed: 'Dikonfirmasi',
    completed: 'Selesai',
    cancelled: 'Dibatalkan',
    expired: 'Kedaluwarsa'
  }

  const paymentMap: Record<string, string> = {
    pending: 'Menunggu',
    verified: 'Terverifikasi',
    rejected: 'Ditolak',
    unpaid: 'Belum Dibayar',
    expired: 'Kedaluwarsa'
  }

  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead className="font-semibold text-xs whitespace-nowrap">Kode Booking</TableHead>
            <TableHead className="font-semibold">Pelanggan</TableHead>
            <TableHead className="font-semibold">Venue</TableHead>
            <TableHead className="font-semibold">Jadwal</TableHead>
            <TableHead className="font-semibold">Harga</TableHead>
            <TableHead className="font-semibold">Status</TableHead>
            {showActions && <TableHead className="text-right font-semibold">Aksi</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {bookings.map((booking: BookingData) => {
            const paymentStatus = booking.payments?.[0]?.status
            const isHighlighted = highlightedBooking === booking.id || highlightedBooking === booking.booking_code
            return (
            <TableRow key={booking.id} className={isHighlighted ? 'bg-primary/5 transition-colors' : ''}>
              <TableCell className="font-medium text-xs">{booking.booking_code}</TableCell>
              <TableCell>{booking.profiles?.full_name || 'Unknown'}</TableCell>
              <TableCell>{booking.venues?.name}</TableCell>
              <TableCell>
                <div className="flex flex-col">
                  <span>{format(new Date(booking.booking_date), 'dd MMM yyyy')}</span>
                  <span className="text-xs text-muted-foreground">{booking.start_time.substring(0, 5)} - {booking.end_time.substring(0, 5)}</span>
                </div>
              </TableCell>
              <TableCell>
                <span className="font-medium">Rp {booking.total_price.toLocaleString('id-ID')}</span>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-1 items-start">
                  <StatusBadge status={booking.status} />
                  {paymentStatus && (
                    <StatusBadge status={paymentStatus} />
                  )}
                </div>
              </TableCell>
              {showActions && (
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-2">
                    {/* Actions depend on current status */}
                    {booking.status === 'pending' && booking.payments?.[0]?.status === 'pending' && booking.payments?.[0]?.id && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        asChild
                      >
                        <Link href={`/owner/payments/${booking.payments[0].id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          Lihat Pembayaran
                        </Link>
                      </Button>
                    )}
                    {booking.status === 'confirmed' && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        onClick={() => handleUpdateStatus(booking.id, 'completed')}
                        disabled={isPending}
                        title="Tandai Selesai"
                      >
                        <CheckSquare className="h-4 w-4" />
                      </Button>
                    )}
                    {isPending && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground ml-2" />}
                  </div>
                </TableCell>
              )}
            </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
