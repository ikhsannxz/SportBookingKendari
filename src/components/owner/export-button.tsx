'use client'

import { Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { format } from 'date-fns'
import type { BookingData } from './booking-table'

interface ExportButtonProps {
  bookings: BookingData[]
}

const statusMap: Record<string, string> = {
  pending: 'Menunggu',
  confirmed: 'Dikonfirmasi',
  completed: 'Selesai',
  cancelled: 'Dibatalkan',
  expired: 'Kedaluwarsa',
}

const paymentMap: Record<string, string> = {
  pending: 'Menunggu',
  verified: 'Terverifikasi',
  rejected: 'Ditolak',
  unpaid: 'Belum Dibayar',
  expired: 'Kedaluwarsa',
}

export function ExportButton({ bookings }: ExportButtonProps) {
  const handleExport = () => {
    try {
      // Create CSV Headers
      const headers = [
        'Kode Booking',
        'Nama Pelanggan',
        'Venue',
        'Tanggal',
        'Jam',
        'Harga',
        'Status Booking',
        'Status Pembayaran',
      ]

      // Map rows
      const rows = bookings.map((booking) => {
        const paymentStatus = booking.payments?.[0]?.status || '-'
        const dateStr = format(new Date(booking.booking_date), 'yyyy-MM-dd')
        const timeStr = `${booking.start_time.substring(0, 5)} - ${booking.end_time.substring(0, 5)}`
        
        return [
          booking.booking_code,
          booking.profiles?.full_name || 'Unknown',
          booking.venues?.name || 'Unknown',
          dateStr,
          timeStr,
          booking.total_price.toString(),
          statusMap[booking.status] || booking.status,
          paymentMap[paymentStatus] || paymentStatus,
        ].map(cell => {
          // Escape quotes and wrap in quotes for CSV
          const stringCell = String(cell).replace(/"/g, '""')
          return `"${stringCell}"`
        }).join(',')
      })

      // Combine headers and rows
      const csvContent = [
        headers.join(','),
        ...rows
      ].join('\n')

      // Create Blob and Download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      
      const filename = `booking-report-${format(new Date(), 'yyyy-MM-dd')}.csv`
      
      link.setAttribute('href', url)
      link.setAttribute('download', filename)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast.success('Data booking berhasil diekspor.')
    } catch (error) {
      console.error('Export failed:', error)
      toast.error('Gagal mengekspor data booking.')
    }
  }

  return (
    <Button variant="outline" onClick={handleExport}>
      <Download className="h-4 w-4 mr-2" /> Ekspor
    </Button>
  )
}
