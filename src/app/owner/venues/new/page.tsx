import { VenueForm } from '@/components/owner/venue-form'

export default function NewVenuePage() {
  return (
    <div className="container max-w-5xl mx-auto px-4 py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Tambah Venue Baru</h1>
        <p className="text-muted-foreground mt-1">
          Buat venue olahraga baru untuk mulai menerima booking.
        </p>
      </div>

      <VenueForm />
    </div>
  )
}
