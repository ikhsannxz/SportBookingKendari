'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function SortSelect() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentSort = searchParams.get('sortBy') || 'recommendation'

  const handleSortChange = (value: string | null) => {
    if (!value) return
    const params = new URLSearchParams(searchParams.toString())
    params.set('sortBy', value)
    router.push(`/search?${params.toString()}`)
  }

  const sortLabels: Record<string, string> = {
    'recommendation': 'Rekomendasi',
    'price_asc': 'Harga Terendah',
    'price_desc': 'Harga Tertinggi',
    'rating_desc': 'Rating Tertinggi'
  }

  return (
    <div className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground">
      Urutkan: 
      <Select value={currentSort} onValueChange={handleSortChange}>
        <SelectTrigger className="w-[180px] h-8 border-none shadow-none font-medium text-foreground focus:ring-0">
          <SelectValue placeholder="Rekomendasi">
            {sortLabels[currentSort] || 'Rekomendasi'}
          </SelectValue>
        </SelectTrigger>
        <SelectContent align="end">
          <SelectItem value="recommendation">Rekomendasi</SelectItem>
          <SelectItem value="price_asc">Harga Terendah</SelectItem>
          <SelectItem value="price_desc">Harga Tertinggi</SelectItem>
          <SelectItem value="rating_desc">Rating Tertinggi</SelectItem>
        </SelectContent>
      </Select>
    </div>
  )
}
