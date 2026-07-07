'use client'

import { format, addDays, subDays } from 'date-fns'
import { id } from 'date-fns/locale'
import { useRouter } from 'next/navigation'
import { Button, buttonVariants } from '@/components/ui/button'
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'

export function CalendarNavigation({ currentDate }: { currentDate: string }) {
  const router = useRouter()
  // Ensure we parse the date properly in local timezone to avoid off-by-one errors
  // If the string is just "YYYY-MM-DD", appending "T00:00:00" helps keeping local time for date-fns.
  const dateObj = new Date(`${currentDate}T00:00:00`)

  const handleDateChange = (date?: Date) => {
    if (!date) return
    const formatted = format(date, 'yyyy-MM-dd')
    router.push(`?date=${formatted}`)
  }

  const handlePrev = () => handleDateChange(subDays(dateObj, 1))
  const handleNext = () => handleDateChange(addDays(dateObj, 1))
  const handleToday = () => handleDateChange(new Date())

  return (
    <div className="flex flex-col sm:flex-row items-center gap-4 justify-between w-full">
      <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-2 sm:pb-0">
        <Button variant="outline" size="sm" onClick={handlePrev} className="shrink-0">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Hari Sebelumnya
        </Button>
        <Button variant="outline" size="sm" onClick={handleToday} className="shrink-0">
          Hari Ini
        </Button>
        <Button variant="outline" size="sm" onClick={handleNext} className="shrink-0">
          Hari Berikutnya
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>

      <Popover>
        <PopoverTrigger className={cn(buttonVariants({ variant: "outline" }), "w-full sm:w-[240px] justify-start text-left font-normal shrink-0")}>
          <CalendarIcon className="mr-2 h-4 w-4" />
          {format(dateObj, 'd MMMM yyyy', { locale: id })}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="single"
            selected={dateObj}
            onSelect={handleDateChange}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
