'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function StatusFilter({ initialStatus }: { initialStatus: string }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const onValueChange = (value: string | null) => {
    if (!value) return
    const params = new URLSearchParams(searchParams.toString())
    if (value === 'all') {
      params.delete('status')
    } else {
      params.set('status', value)
    }
    router.push(`?${params.toString()}`)
  }

  return (
    <Select value={initialStatus ?? 'all'} onValueChange={onValueChange}>
      <SelectTrigger className="w-[140px] bg-background">
        <SelectValue placeholder="Status" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">Semua Status</SelectItem>
        <SelectItem value="confirmed">Dikonfirmasi</SelectItem>
        <SelectItem value="pending">Menunggu</SelectItem>
        <SelectItem value="completed">Selesai</SelectItem>
        <SelectItem value="cancelled">Dibatalkan</SelectItem>
        <SelectItem value="expired">Kedaluwarsa</SelectItem>
      </SelectContent>
    </Select>
  )
}
