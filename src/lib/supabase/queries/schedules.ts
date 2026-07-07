import { createClient } from '../server'
import { Schedule } from '@/lib/types/database'

export async function getVenueSchedules(venueId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('schedules')
    .select('*')
    .eq('venue_id', venueId)
    .order('day_of_week', { ascending: true })

  if (error) {
    console.error('Error fetching schedules:', error)
    return []
  }

  return data as Schedule[]
}
