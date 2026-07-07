'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'

export default function AdminBookingsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="p-6 md:p-8 space-y-6">
      <Card className="border-destructive/50 bg-destructive/10">
        <CardContent className="flex flex-col items-center justify-center py-10 space-y-4 text-center">
          <AlertCircle className="h-10 w-10 text-destructive" />
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-destructive">Terjadi Kesalahan</h3>
            <p className="text-sm text-muted-foreground">
              Gagal memuat data booking. {error.message}
            </p>
          </div>
          <Button onClick={reset} variant="destructive">
            Coba Lagi
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
