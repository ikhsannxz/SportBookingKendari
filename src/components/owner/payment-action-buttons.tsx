'use client'

import { useState, useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { verifyPaymentAction, rejectPaymentAction } from '@/app/actions/payments'
import { toast } from 'sonner'
import { Check, X, Loader2 } from 'lucide-react'

export function PaymentActionButtons({ paymentId, currentStatus }: { paymentId: string, currentStatus: string }) {
  const [isPending, startTransition] = useTransition()
  const [rejectReason, setRejectReason] = useState('')
  const [showRejectInput, setShowRejectInput] = useState(false)

  const handleVerify = () => {
    startTransition(async () => {
      const result = await verifyPaymentAction(paymentId)
      if (result.error) toast.error(result.error)
      else toast.success(result.success)
    })
  }

  const handleReject = () => {
    if (!showRejectInput) {
      setShowRejectInput(true)
      return
    }

    if (!rejectReason.trim()) {
      toast.error('Please enter a rejection reason.')
      return
    }

    startTransition(async () => {
      const result = await rejectPaymentAction(paymentId, rejectReason)
      if (result.error) toast.error(result.error)
      else toast.success(result.success)
    })
  }

  if (currentStatus === 'verified') {
    return (
      <div className="p-4 bg-emerald-50 text-emerald-800 rounded-xl border border-emerald-200 text-center font-medium">
        Payment has been verified.
      </div>
    )
  }

  if (currentStatus === 'expired') {
    return (
      <div className="p-4 bg-muted text-muted-foreground rounded-xl border text-center font-medium">
        Payment has expired.
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {showRejectInput && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Rejection Reason</label>
          <textarea 
            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm" 
            rows={3}
            placeholder="E.g. Blur image, incorrect amount..."
            value={rejectReason}
            onChange={e => setRejectReason(e.target.value)}
            disabled={isPending}
          />
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row gap-3">
        {!showRejectInput && (
          <Button 
            className="flex-1 bg-emerald-600 hover:bg-emerald-700" 
            size="lg"
            onClick={handleVerify}
            disabled={isPending}
          >
            {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Check className="w-4 h-4 mr-2" />}
            Verify Payment
          </Button>
        )}

        <Button 
          variant={showRejectInput ? "destructive" : "outline"} 
          className="flex-1"
          size="lg"
          onClick={handleReject}
          disabled={isPending}
        >
          {isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <X className="w-4 h-4 mr-2" />}
          {showRejectInput ? 'Confirm Rejection' : 'Reject Payment'}
        </Button>

        {showRejectInput && (
          <Button 
            variant="ghost" 
            size="lg"
            onClick={() => setShowRejectInput(false)}
            disabled={isPending}
          >
            Cancel
          </Button>
        )}
      </div>
    </div>
  )
}
