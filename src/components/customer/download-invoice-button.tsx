'use client'

import { Button } from '@/components/ui/button'
import { FileText } from 'lucide-react'

export function DownloadInvoiceButton({ bookingId }: { bookingId: string }) {
  return (
    <Button variant="outline" className="w-full" asChild>
      <a href={`/api/invoices/${bookingId}`} target="_blank" rel="noopener noreferrer">
        <FileText className="w-4 h-4 mr-2" />
        Unduh Invoice
      </a>
    </Button>
  )
}
