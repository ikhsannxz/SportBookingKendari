import Link from 'next/link'
import { Suspense } from 'react'
import { Search, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { BookingTable } from '@/components/owner/booking-table'
import { getOwnerBookings } from '@/lib/supabase/queries/bookings'
import { expireUnpaidBookings } from '@/app/actions/bookings'
import { StatusFilter } from './status-filter'
import { ExportButton } from '@/components/owner/export-button'

export default async function OwnerBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  await expireUnpaidBookings()
  const params = await searchParams
  const status = typeof params?.status === 'string' ? params.status : 'all'
  const search = typeof params?.q === 'string' ? params.q : ''
  const bookings = await getOwnerBookings(status, search)

  return (
    <div className="container max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Booking</h1>
          <p className="text-muted-foreground mt-1">
            Kelola reservasi dan status booking venue Anda.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/owner/bookings/calendar">
              <Calendar className="h-4 w-4 mr-2" /> Tampilan Kalender
            </Link>
          </Button>
          <ExportButton bookings={bookings} />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <form method="GET" className="relative flex-1">
          {status !== 'all' && <input type="hidden" name="status" value={status} />}
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            name="q"
            defaultValue={search}
            placeholder="Cari berdasarkan kode booking atau nama pelanggan..." 
            className="pl-9 w-full bg-background"
          />
        </form>
        <div className="flex gap-3">
          <StatusFilter initialStatus={status} />
        </div>
      </div>

      <Suspense fallback={<div className="p-8 text-center border rounded-xl"><p className="text-muted-foreground">Memuat tabel...</p></div>}>
        <BookingTable bookings={bookings} />
      </Suspense>

      <div className="flex items-center justify-between pt-4">
        <p className="text-sm text-muted-foreground">
          Menampilkan <span className="font-medium">{bookings.length}</span> hasil
        </p>
      </div>
    </div>
  )
}
