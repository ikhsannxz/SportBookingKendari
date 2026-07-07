import { notFound } from 'next/navigation'
import { VenueForm } from '@/components/owner/venue-form'
import { getVenueById, getVenueFacilities, getVenueImages } from '@/lib/supabase/queries/venues'

interface EditVenuePageProps {
  params: Promise<{ id: string }>
}

export default async function EditVenuePage({ params }: EditVenuePageProps) {
  const resolvedParams = await params
  const venueId = resolvedParams.id
  
  const venue = await getVenueById(venueId)
  if (!venue) {
    notFound()
  }

  const facilities = await getVenueFacilities(venueId)
  const images = await getVenueImages(venueId)

  return (
    <div className="container max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Edit Venue</h1>
        <p className="text-muted-foreground mt-1">
          Perbarui detail dan konfigurasi venue Anda.
        </p>
      </div>

      <VenueForm isEdit initialData={venue} initialFacilities={facilities} initialImages={images} />
    </div>
  )
}
