import { PDFDocument, StandardFonts, rgb } from 'pdf-lib'
import { format } from 'date-fns'
import { id } from 'date-fns/locale'

export async function generateInvoicePdf(booking: any, payment: any): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([595.28, 841.89]) // A4 size
  
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  
  const { width, height } = page.getSize()

  const primaryColor = rgb(0.015, 0.392, 0.203) // Deep green
  const darkGray = rgb(0.2, 0.2, 0.2)
  const lightGray = rgb(0.4, 0.4, 0.4)
  const lineColor = rgb(0.85, 0.85, 0.85)
  
  let yPosition = height - 60

  // --- Header ---
  page.drawText('SPORTBOOKING', { x: 50, y: yPosition, size: 24, font: boldFont, color: primaryColor })
  page.drawText('KENDARI', { x: 50, y: yPosition - 15, size: 12, font: boldFont, color: lightGray })

  page.drawText('INVOICE', { x: width - 170, y: yPosition - 5, size: 28, font: boldFont, color: primaryColor })

  yPosition -= 50

  // --- Invoice Meta (Right Aligned) ---
  const invoiceNumber = `INV-${booking.booking_code}`
  const generatedDate = format(new Date(), 'dd MMMM yyyy, HH:mm', { locale: id })
  const paymentStatus = (payment?.status || booking.status).toUpperCase()
  
  const rightColX = width - 250
  
  page.drawText('Nomor Invoice', { x: rightColX, y: yPosition, size: 10, font: boldFont, color: lightGray })
  page.drawText(invoiceNumber, { x: rightColX + 100, y: yPosition, size: 10, font: boldFont, color: darkGray })
  
  yPosition -= 15
  page.drawText('Tanggal', { x: rightColX, y: yPosition, size: 10, font: boldFont, color: lightGray })
  page.drawText(generatedDate, { x: rightColX + 100, y: yPosition, size: 10, font: font, color: darkGray })
  
  yPosition -= 15
  page.drawText('Status', { x: rightColX, y: yPosition, size: 10, font: boldFont, color: lightGray })
  page.drawText(paymentStatus, { 
    x: rightColX + 100, 
    y: yPosition, 
    size: 10, 
    font: boldFont, 
    color: paymentStatus === 'VERIFIED' ? primaryColor : (paymentStatus === 'REJECTED' ? rgb(0.8, 0.2, 0.2) : rgb(0.8, 0.5, 0)) 
  })

  // --- Customer Info (Left Aligned) ---
  let leftY = height - 110
  page.drawText('DITAGIHKAN KEPADA:', { x: 50, y: leftY, size: 10, font: boldFont, color: lightGray })
  leftY -= 15
  page.drawText(booking.profiles?.full_name || 'Pelanggan', { x: 50, y: leftY, size: 12, font: boldFont, color: darkGray })
  if (booking.profiles?.email) {
    leftY -= 15
    page.drawText(booking.profiles.email, { x: 50, y: leftY, size: 10, font: font, color: lightGray })
  }

  yPosition = Math.min(yPosition, leftY) - 40

  // --- Separator ---
  page.drawLine({ start: { x: 50, y: yPosition }, end: { x: width - 50, y: yPosition }, thickness: 1, color: lineColor })
  yPosition -= 30

  // --- Section: Detail Venue ---
  page.drawText('INFORMASI VENUE', { x: 50, y: yPosition, size: 12, font: boldFont, color: primaryColor })
  yPosition -= 20
  page.drawText(booking.venues?.name || 'Venue', { x: 50, y: yPosition, size: 12, font: boldFont, color: darkGray })
  
  const venueAddress = booking.venues?.address && booking.venues?.city 
    ? `${booking.venues.address}, ${booking.venues.city}` 
    : (booking.venues?.address || booking.venues?.city || '');
    
  if (venueAddress) {
    yPosition -= 15
    page.drawText(venueAddress, { x: 50, y: yPosition, size: 10, font: font, color: lightGray })
  }
  
  yPosition -= 30

  // --- Section: Table Detail Booking ---
  page.drawText('DETAIL BOOKING', { x: 50, y: yPosition, size: 12, font: boldFont, color: primaryColor })
  yPosition -= 20

  // Table Header
  page.drawRectangle({ x: 50, y: yPosition - 5, width: width - 100, height: 20, color: rgb(0.95, 0.96, 0.95) })
  page.drawText('DESKRIPSI', { x: 60, y: yPosition, size: 9, font: boldFont, color: darkGray })
  page.drawText('TANGGAL', { x: 280, y: yPosition, size: 9, font: boldFont, color: darkGray })
  page.drawText('WAKTU', { x: 380, y: yPosition, size: 9, font: boldFont, color: darkGray })
  page.drawText('TOTAL', { x: width - 100, y: yPosition, size: 9, font: boldFont, color: darkGray })
  
  yPosition -= 25

  // Table Row
  const description = `Sewa Lapangan (${booking.duration_hours} Jam)`
  const bookingDateStr = format(new Date(booking.booking_date), 'dd MMM yyyy', { locale: id })
  const timeStr = `${booking.start_time.substring(0, 5)} - ${booking.end_time.substring(0, 5)}`
  const priceStr = `Rp ${booking.total_price.toLocaleString('id-ID')}`

  page.drawText(description, { x: 60, y: yPosition, size: 10, font: font, color: darkGray })
  page.drawText(bookingDateStr, { x: 280, y: yPosition, size: 10, font: font, color: darkGray })
  page.drawText(timeStr, { x: 380, y: yPosition, size: 10, font: font, color: darkGray })
  page.drawText(priceStr, { x: width - 100, y: yPosition, size: 10, font: font, color: darkGray })

  yPosition -= 20
  page.drawLine({ start: { x: 50, y: yPosition }, end: { x: width - 50, y: yPosition }, thickness: 1, color: lineColor })
  
  yPosition -= 40

  // --- Total Summary ---
  page.drawText('TOTAL TAGIHAN', { x: width - 250, y: yPosition, size: 12, font: boldFont, color: darkGray })
  
  const priceTextWidth = boldFont.widthOfTextAtSize(priceStr, 18)
  page.drawText(priceStr, { 
    x: width - 50 - priceTextWidth, 
    y: yPosition - 3, 
    size: 18, 
    font: boldFont, 
    color: primaryColor 
  })

  yPosition -= 60

  // --- Payment Instructions (Bottom Left) ---
  page.drawText('QRIS PEMILIK VENUE', { x: 50, y: yPosition, size: 11, font: boldFont, color: primaryColor })
  yPosition -= 15
  
  const ownerName = booking.venues?.profiles?.full_name || 'Pemilik Venue'
  page.drawText('Nama Pemilik Venue:', { x: 50, y: yPosition, size: 9, font: font, color: lightGray })
  yPosition -= 12
  page.drawText(ownerName, { x: 50, y: yPosition, size: 10, font: boldFont, color: darkGray })
  yPosition -= 15
  
  page.drawText('Metode Pembayaran:', { x: 50, y: yPosition, size: 9, font: font, color: lightGray })
  yPosition -= 12
  page.drawText('QRIS', { x: 50, y: yPosition, size: 10, font: boldFont, color: darkGray })
  
  yPosition -= 30

  // --- Footer ---
  const footerText = 'Invoice ini dibuat secara otomatis oleh sistem SportBook Kendari dan sah tanpa tanda tangan.'
  
  page.drawLine({ start: { x: 50, y: 70 }, end: { x: width - 50, y: 70 }, thickness: 1, color: lineColor })
  
  const textWidth = font.widthOfTextAtSize(footerText, 9)
  page.drawText(footerText, {
    x: (width - textWidth) / 2,
    y: 50,
    size: 9,
    font: font,
    color: lightGray,
  })

  return await pdfDoc.save()
}
