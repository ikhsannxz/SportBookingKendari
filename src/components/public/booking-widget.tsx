/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useState, useEffect, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { CalendarIcon, Loader2, Info } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'
import { getVenueAvailability, createBookingAction } from '@/app/actions/bookings'
import { getAvailableSlots, calculateBookingPrice, TimeSlot } from '@/lib/booking/utils'

interface BookingWidgetProps {
  venueId: string
  pricePerHour: number
  status?: string
}

export function BookingWidget({ venueId, pricePerHour, status }: BookingWidgetProps) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  
  const [date, setDate] = useState<Date | undefined>(undefined)
  const [durationHours, setDurationHours] = useState<string>("1")
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [notes, setNotes] = useState<string>('')
  
  const [isLoadingSlots, setIsLoadingSlots] = useState(false)
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [isClosed, setIsClosed] = useState(false)

  // Fetch availability when date changes
  useEffect(() => {
    if (!date) {
      setAvailableSlots([])
      setIsClosed(false)
      setSelectedTime('')
      return
    }

    let isMounted = true
    setIsLoadingSlots(true)
    
    // YYYY-MM-DD local
    const dateStr = format(date, 'yyyy-MM-dd')
    const todayStr = format(new Date(), 'yyyy-MM-dd')
    const isToday = dateStr === todayStr
    
    getVenueAvailability(venueId, dateStr).then(res => {
      if (!isMounted) return
      setIsClosed(res.isClosed)
      
      if (!res.isClosed) {
        let minStartHour = 0
        if (isToday) {
          const now = new Date()
          minStartHour = now.getHours() + (now.getMinutes() / 60) // no buffer
        }

        const slots = getAvailableSlots(res.openTime, res.closeTime, res.isClosed, res.bookings, minStartHour)
        setAvailableSlots(slots)
      } else {
        setAvailableSlots([])
      }
      setSelectedTime('')
      setIsLoadingSlots(false)
    })

    return () => { isMounted = false }
  }, [date, venueId])

  const handleBooking = () => {
    if (!date || !selectedTime) {
      toast.error('Silakan pilih tanggal dan waktu')
      return
    }

    startTransition(async () => {
      const formData = new FormData()
      formData.append('venue_id', venueId)
      formData.append('booking_date', format(date, 'yyyy-MM-dd'))
      formData.append('start_time', selectedTime)
      formData.append('duration_hours', durationHours)
      if (notes.trim()) {
        formData.append('notes', notes.trim())
      }

      const result = await createBookingAction(formData)

      if (result.error) {
        if (result.error === 'Not authenticated') {
          toast.error('Silakan masuk untuk memesan venue ini')
          router.push(`/auth/login?redirect=/venues/${venueId}`)
        } else {
          toast.error(result.error)
        }
      } else if (result.success) {
        toast.success(result.success)
        router.push('/customer/bookings')
      }
    })
  }

  const durationNum = parseInt(durationHours, 10) || 1
  const totalPrice = calculateBookingPrice(pricePerHour, durationNum)

  // Check if selected time + duration is valid 
  // (We disable the submit button if the subsequent hours overlap or go past closing)
  let isSelectionValid = false
  if (selectedTime && availableSlots.length > 0) {
    const startIndex = availableSlots.findIndex(s => s.time === selectedTime)
    if (startIndex !== -1) {
      // Need 'durationNum' consecutive available slots
      const neededSlots = availableSlots.slice(startIndex, startIndex + durationNum)
      isSelectionValid = neededSlots.length === durationNum && neededSlots.every(s => s.isAvailable)
    }
  }

  return (
    <div className="sticky top-24">
      <Card className="shadow-lg border-primary/10">
        <CardContent className="p-6">
          <div className="mb-6">
            <span className="text-2xl font-bold">Rp {pricePerHour.toLocaleString('id-ID')}</span>
            <span className="text-muted-foreground"> per jam</span>
          </div>
          
          <div className="space-y-4 mb-6">
            {/* DATE PICKER */}
            <div className="border rounded-lg p-3">
              <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">Tanggal</label>
              <Popover>
                <PopoverTrigger
                  disabled={status === 'maintenance'}
                  className={cn(
                    "w-full flex justify-start items-center text-left font-normal border rounded-md p-2 h-auto hover:bg-accent",
                    !date && "text-muted-foreground",
                    status === 'maintenance' && "opacity-50 cursor-not-allowed pointer-events-none"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pilih tanggal</span>}
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={(date) => {
                      // Disable past dates
                      const today = new Date()
                      today.setHours(0, 0, 0, 0)
                      return date < today
                    }}
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* DURATION */}
            <div className="border rounded-lg p-3">
              <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">Durasi</label>
              <Select value={durationHours} onValueChange={(val) => val && setDurationHours(val)}>
                <SelectTrigger className="border-0 px-0 h-auto shadow-none focus:ring-0">
                  <SelectValue placeholder="Pilih durasi" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Jam</SelectItem>
                  <SelectItem value="2">2 Jam</SelectItem>
                  <SelectItem value="3">3 Jam</SelectItem>
                  <SelectItem value="4">4 Jam</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* TIME SLOTS */}
            <div className="border rounded-lg p-3">
              <label className="text-xs font-bold uppercase text-muted-foreground block mb-2 flex items-center justify-between">
                <span>Jam Mulai</span>
                {isLoadingSlots && <Loader2 className="w-3 h-3 animate-spin" />}
              </label>
              
              {!date ? (
                <div className="text-sm text-muted-foreground">Pilih tanggal terlebih dahulu</div>
              ) : isClosed ? (
                <div className="text-sm text-destructive font-medium">Venue tutup pada hari ini</div>
              ) : availableSlots.length === 0 && !isLoadingSlots ? (
                <div className="text-sm text-muted-foreground">Tidak ada jadwal yang tersedia</div>
              ) : (
                <div className="grid grid-cols-3 gap-2 mt-2">
                  {availableSlots.map(slot => (
                    <Button
                      key={slot.time}
                      type="button"
                      variant={selectedTime === slot.time ? 'default' : 'outline'}
                      className={cn(
                        "text-xs px-2 py-1 h-8",
                        !slot.isAvailable && "opacity-50 cursor-not-allowed line-through"
                      )}
                      disabled={!slot.isAvailable}
                      onClick={() => setSelectedTime(slot.time)}
                    >
                      {slot.time.substring(0, 5)}
                    </Button>
                  ))}
                </div>
              )}
            </div>
            
            <div className="border rounded-lg p-3">
              <label className="text-xs font-bold uppercase text-muted-foreground block mb-1">Catatan (Opsional)</label>
              <Textarea 
                placeholder="Ada permintaan khusus atau catatan untuk pemilik venue?"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="resize-none border-none shadow-none focus-visible:ring-0 p-0 text-sm h-14"
              />
            </div>
            
            {/* TOTAL PRICE CALCULATION */}
            {date && selectedTime && (
              <div className="flex justify-between items-center py-2 border-t mt-4">
                <span className="font-medium text-sm">Total Harga</span>
                <span className="font-bold text-lg">Rp {totalPrice.toLocaleString('id-ID')}</span>
              </div>
            )}
            
            {/* INVALID DURATION WARNING */}
            {date && selectedTime && !isSelectionValid && (
               <p className="text-xs text-destructive text-center mt-2">
                 Durasi yang diminta tumpang tindih dengan jadwal yang sudah dipesan atau waktu tutup.
               </p>
            )}

          </div>

          <Button 
            className="w-full text-lg h-12" 
            size="lg"
            onClick={handleBooking}
            disabled={status === 'maintenance' || !date || !selectedTime || !isSelectionValid || isPending}
          >
            {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {status === 'maintenance' ? 'Tidak Tersedia' : 'Pesan Sekarang'}
          </Button>
          <p className="text-center text-xs text-muted-foreground mt-4 flex items-center justify-center gap-1">
            <Info className="w-3 h-3" /> Anda belum akan dikenakan biaya
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
