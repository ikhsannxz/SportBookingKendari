import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { generateInvoicePdf } from '@/lib/pdf/generate-invoice'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  const { bookingId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  const { data: booking, error } = await supabase
    .from('bookings')
    .select(`
      *,
      venues (*),
      profiles (*),
      payments (*)
    `)
    .eq('id', bookingId)
    .single()

  if (error || !booking) {
    return new NextResponse('Booking not found', { status: 404 })
  }

  const isCustomer = booking.customer_id === user.id
  const isOwner = booking.venues.owner_id === user.id

  if (!isCustomer && !isOwner) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  const payment = Array.isArray(booking.payments) ? booking.payments[0] : (booking.payments as any)

  if (payment?.status !== 'verified' && booking.status !== 'confirmed' && booking.status !== 'completed') {
    return new NextResponse('Invoice not available for this booking status', { status: 400 })
  }

  try {
    const pdfBytes = await generateInvoicePdf(booking, payment)

    return new NextResponse(pdfBytes as any, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="Invoice-${booking.booking_code}.pdf"`,
      },
    })
  } catch (err) {
    console.error('Error generating PDF:', err)
    return new NextResponse('Error generating PDF', { status: 500 })
  }
}
