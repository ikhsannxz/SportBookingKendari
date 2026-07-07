/**
 * Booking Utilities
 * Enforces business rules for 1-hour intervals, scheduling, and overlaps.
 */

export interface TimeSlot {
  time: string // 'HH:00:00'
  isAvailable: boolean
}

export interface BookingInterval {
  start_time: string
  end_time: string
}

/**
 * Parses 'HH:MM:SS' into a decimal number representing hours.
 * e.g. '08:00:00' -> 8, '14:30:00' -> 14.5
 */
export function timeToHours(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number)
  return hours + minutes / 60
}

/**
 * Formats a decimal hour back into 'HH:00:00'
 */
export function hoursToTime(hours: number): string {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:00`
}

/**
 * Generates all 1-hour time slots for a given schedule.
 * Returns empty array if closed or invalid schedule.
 */
export function generateTimeSlots(
  openTime: string,
  closeTime: string,
  isClosed: boolean
): string[] {
  if (isClosed) return []

  const startHour = timeToHours(openTime)
  const endHour = timeToHours(closeTime)
  
  const slots: string[] = []
  
  // Enforce whole hour boundaries (e.g., if openTime is 08:30, it starts at 09:00)
  const firstValidHour = Math.ceil(startHour)
  const lastValidHour = Math.floor(endHour)

  for (let h = firstValidHour; h < lastValidHour; h++) {
    slots.push(hoursToTime(h))
  }

  return slots
}

/**
 * Checks if a specific requested slot overlaps with any existing bookings.
 */
export function isSlotAvailable(
  requestStartHour: number,
  requestEndHour: number,
  existingBookings: BookingInterval[]
): boolean {
  for (const booking of existingBookings) {
    const bookingStart = timeToHours(booking.start_time)
    const bookingEnd = timeToHours(booking.end_time)

    // Overlap occurs if the request starts before the booking ends 
    // AND the request ends after the booking starts.
    if (requestStartHour < bookingEnd && requestEndHour > bookingStart) {
      return false
    }
  }
  return true
}

/**
 * Given a schedule and a list of existing bookings, returns the 1-hour slots
 * marking which ones are available.
 */
export function getAvailableSlots(
  openTime: string,
  closeTime: string,
  isClosed: boolean,
  existingBookings: BookingInterval[],
  minStartHour: number = 0
): TimeSlot[] {
  const allSlots = generateTimeSlots(openTime, closeTime, isClosed)
  
  return allSlots.map(time => {
    const slotStartHour = timeToHours(time)
    const slotEndHour = slotStartHour + 1 // 1-hour granularity

    let isAvailable = isSlotAvailable(slotStartHour, slotEndHour, existingBookings)
    
    // Disable past times (with optional buffer)
    if (slotStartHour < minStartHour) {
      isAvailable = false
    }

    return { time, isAvailable }
  })
}

/**
 * Calculates the total price for a booking.
 */
export function calculateBookingPrice(pricePerHour: number, durationHours: number): number {
  return pricePerHour * durationHours
}

/**
 * Validates a booking request.
 * 1. end_time > start_time
 * 2. duration >= 1 hour
 * 3. duration is a whole number
 * 4. start_time and end_time align exactly to hourly boundaries
 * 5. falls within operating hours
 * 6. no overlaps
 */
export function validateBookingRequest(
  startTime: string,
  durationHours: number,
  openTime: string,
  closeTime: string,
  isClosed: boolean,
  existingBookings: BookingInterval[]
): { valid: boolean; error?: string; endTime?: string } {
  if (isClosed) {
    return { valid: false, error: 'Venue is closed on this day' }
  }

  const startHour = timeToHours(startTime)
  const endHour = startHour + durationHours

  // Boundary check
  if (!Number.isInteger(startHour) || !Number.isInteger(endHour)) {
    return { valid: false, error: 'Bookings must start and end on hourly boundaries (e.g., 08:00:00)' }
  }

  // Duration check
  if (durationHours < 1 || !Number.isInteger(durationHours)) {
    return { valid: false, error: 'Duration must be at least 1 whole hour' }
  }

  // Operating hours check
  if (startHour < timeToHours(openTime) || endHour > timeToHours(closeTime)) {
    return { valid: false, error: 'Booking request falls outside operating hours' }
  }

  // Overlap check
  if (!isSlotAvailable(startHour, endHour, existingBookings)) {
    return { valid: false, error: 'The requested time slot overlaps with an existing booking' }
  }

  return { valid: true, endTime: hoursToTime(endHour) }
}
