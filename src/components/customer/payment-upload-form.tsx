'use client'

import { useState, useTransition } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { uploadPaymentProofAction } from '@/app/actions/payments'
import { AlertCircle, CheckCircle2, UploadCloud, Info, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface PaymentUploadFormProps {
  bookingId: string
  bookingStatus: string
  paymentStatus?: string
  rejectionReason?: string | null
}

export function PaymentUploadForm({ bookingId, bookingStatus, paymentStatus, rejectionReason }: PaymentUploadFormProps) {
  const [file, setFile] = useState<File | null>(null)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!file) {
      setError('Please select a file.')
      return
    }

    const formData = new FormData()
    formData.append('booking_id', bookingId)
    formData.append('file', file)

    startTransition(async () => {
      try {
        const result = await uploadPaymentProofAction(null, formData)
        
        if (result?.error) {
          setError(result.error)
        } else if (result?.success) {
          setSuccess(result.success)
          setFile(null)
          // Also reset file input visually
          const fileInput = document.getElementById('file') as HTMLInputElement
          if (fileInput) fileInput.value = ''
          
          router.refresh() // Refresh to update the UI from the server
        }
      } catch (err) {
        console.error('Upload error:', err)
        setError('An unexpected error occurred during upload.')
      }
    })
  }

  if (['cancelled', 'completed', 'expired'].includes(bookingStatus)) {
    return null
  }

  // Only render the upload form if status is unpaid or rejected AND booking is pending
  const canUpload = bookingStatus === 'pending' && (paymentStatus === 'unpaid' || paymentStatus === 'rejected')

  if (paymentStatus === 'pending') {
    return (
      <Card>
        <CardContent className="p-6 text-center space-y-4">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto">
            <Info className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold mb-1">Menunggu Verifikasi</h3>
            <p className="text-sm text-muted-foreground">Bukti pembayaran telah diupload. Menunggu verifikasi pemilik.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (paymentStatus === 'verified') {
    return (
      <Card>
        <CardContent className="p-6 text-center space-y-4">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-semibold mb-1">Pembayaran Terverifikasi</h3>
            <p className="text-sm text-muted-foreground">Pembayaran Anda telah diverifikasi.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!canUpload) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <UploadCloud className="w-5 h-5 text-primary" />
          Upload Bukti Pembayaran
        </CardTitle>
      </CardHeader>
      <CardContent>
        {paymentStatus === 'unpaid' && (
          <div className="mb-6 p-4 bg-orange-50 text-orange-800 rounded-lg flex items-start gap-3 border border-orange-200">
            <Info className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold mb-1">Pembayaran Dibutuhkan</p>
              <p>Silakan upload bukti pembayaran Anda untuk menyelesaikan booking.</p>
            </div>
          </div>
        )}

        {paymentStatus === 'rejected' && (
          <div className="mb-6 p-4 bg-red-50 text-red-800 rounded-lg flex items-start gap-3 border border-red-200">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold mb-1">Pembayaran Ditolak</p>
              <p>{rejectionReason || 'Bukti pembayaran Anda sebelumnya ditolak. Silakan upload bukti yang valid.'}</p>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center gap-2 border border-red-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}

        {success && (
          <div className="mb-6 p-3 bg-emerald-50 text-emerald-600 text-sm rounded-lg flex items-center gap-2 border border-emerald-200">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="file">Pilih file (JPG, PNG, PDF)</Label>
            <Input
              id="file"
              name="file"
              type="file"
              accept="image/jpeg,image/png,image/jpg,application/pdf"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              disabled={isPending}
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isPending || !file}
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Mengupload...
              </>
            ) : (
              'Submit Bukti Pembayaran'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}