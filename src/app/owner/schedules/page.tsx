import { ScheduleForm } from '@/components/owner/schedule-form'
import { getOwnerVenues } from '@/lib/supabase/queries/venues'
import { getVenueSchedules } from '@/lib/supabase/queries/schedules'

interface OwnerSchedulesPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function OwnerSchedulesPage({ searchParams }: OwnerSchedulesPageProps) {
  const resolvedSearchParams = await searchParams
  const venues = await getOwnerVenues()
  
  // Determine selected venue
  const selectedVenueId = typeof resolvedSearchParams.venue === 'string' 
    ? resolvedSearchParams.venue 
    : (venues.length > 0 ? venues[0].id : undefined)

  const schedules = selectedVenueId ? await getVenueSchedules(selectedVenueId) : []

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Jadwal</h1>
        <p className="text-muted-foreground mt-1">
          Atur jam operasional mingguan untuk venue Anda.
        </p>
      </div>

      <ScheduleForm 
        venues={venues} 
        selectedVenueId={selectedVenueId} 
        initialSchedules={schedules} 
      />
    </div>
  )
}
