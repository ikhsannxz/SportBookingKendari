'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { updateSchedulesAction } from '@/app/actions/venues'
import type { Schedule, Venue } from '@/lib/types/database'

const DAYS = [
  'Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'
]

const HOURS = Array.from({ length: 24 }).map((_, i) => {
  const h = i.toString().padStart(2, '0')
  return `${h}:00:00` // matching time format
})

interface ScheduleFormProps {
  venues: Venue[]
  selectedVenueId?: string
  initialSchedules: Schedule[]
}

export function ScheduleForm({ venues, selectedVenueId, initialSchedules }: ScheduleFormProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  
  const sortedVenues = [...venues].sort((a, b) => a.name.localeCompare(b.name))
  const selectedVenue = sortedVenues.find(v => v.id === selectedVenueId)

  // Initialize schedule form state based on initialSchedules or defaults
  const [schedules, setSchedules] = useState(
    DAYS.map((day, index) => {
      const existing = initialSchedules.find(s => s.day_of_week === index)
      return {
        day_of_week: index,
        dayName: day,
        is_closed: existing ? existing.is_closed : false,
        open_time: existing ? existing.open_time : '08:00:00',
        close_time: existing ? existing.close_time : '22:00:00'
      }
    })
  )

  const handleVenueChange = (venueId: string | null) => {
    if (venueId) {
      router.push(`/owner/schedules?venue=${venueId}`)
    }
  }

  const handleToggle = (index: number) => {
    const newSchedules = [...schedules]
    newSchedules[index].is_closed = !newSchedules[index].is_closed
    setSchedules(newSchedules)
  }

  const handleTimeChange = (index: number, type: 'open_time' | 'close_time', value: string | null) => {
    if (!value) return
    const newSchedules = [...schedules]
    newSchedules[index][type] = value
    setSchedules(newSchedules)
  }

  const handleSubmit = () => {
    if (!selectedVenueId) return

    startTransition(async () => {
      const result = await updateSchedulesAction(selectedVenueId, schedules)
      if (result?.error) {
        toast.error(result.error)
      } else if (result?.success) {
        toast.success(result.success)
      }
    })
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <Label htmlFor="venue-select" className="mb-2 block">Pilih Venue</Label>
        {venues.length === 0 ? (
          <p className="text-sm text-muted-foreground">Anda harus membuat venue terlebih dahulu.</p>
        ) : (
          <Select value={selectedVenueId} onValueChange={handleVenueChange}>
            <SelectTrigger id="venue-select" className="w-full sm:w-[300px] bg-background">
              <SelectValue placeholder="Pilih Venue">
                {selectedVenue?.name || "Pilih Venue"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {sortedVenues.map(v => (
                <SelectItem key={v.id} value={v.id}>{v.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      {selectedVenueId && (
        <Card>
          <CardHeader>
            <CardTitle>Jam Operasional</CardTitle>
            <CardDescription>
              Konfigurasikan hari dan waktu venue ini buka untuk booking.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {schedules.map((schedule, index) => (
              <div key={schedule.day_of_week} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 border-b last:border-0 last:pb-0">
                <div className="flex items-center justify-between sm:w-1/3">
                  <Label className="text-base font-medium" htmlFor={`day-${schedule.day_of_week}`}>
                    {schedule.dayName}
                  </Label>
                  <Switch 
                    id={`day-${schedule.day_of_week}`}
                    checked={!schedule.is_closed}
                    onCheckedChange={() => handleToggle(index)}
                  />
                </div>

                <div className="flex items-center gap-2 sm:w-2/3">
                  {!schedule.is_closed ? (
                    <>
                      <span className="text-muted-foreground text-sm">Mulai</span>
                      <Select value={schedule.open_time} onValueChange={(val) => handleTimeChange(index, 'open_time', val)}>
                        <SelectTrigger className="flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {HOURS.map(h => <SelectItem key={h} value={h}>{h.slice(0, 5)}</SelectItem>)}
                        </SelectContent>
                      </Select>
                      <span className="text-muted-foreground text-sm">Sampai</span>
                      <Select value={schedule.close_time} onValueChange={(val) => handleTimeChange(index, 'close_time', val)}>
                        <SelectTrigger className="flex-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {HOURS.map(h => <SelectItem key={h} value={h}>{h.slice(0, 5)}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </>
                  ) : (
                    <div className="w-full py-2 px-3 rounded-md border border-dashed bg-muted/30 text-muted-foreground text-sm text-center">
                      Tidak Tersedia
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            <div className="pt-4 flex justify-end">
              <Button onClick={handleSubmit} disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Simpan Jadwal
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
