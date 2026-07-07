import { getAdminVenues } from '@/lib/supabase/queries/admin'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { VenueActionButtons } from './venue-action-buttons'
import Link from 'next/link'
import { Eye } from 'lucide-react'

export const metadata = {
  title: 'Manajemen Venue - Admin',
}

export default async function AdminVenuesPage() {
  const venues = await getAdminVenues()

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Manajemen Venue</h2>
        <p className="text-muted-foreground mt-1">Daftar semua fasilitas olahraga yang terdaftar di platform.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftar Venue</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Venue</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Jenis Olahraga</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {venues.map((venue) => (
                  <TableRow key={venue.id}>
                    <TableCell className="font-medium">{venue.name}</TableCell>
                    <TableCell>{venue.profiles?.full_name || venue.profiles?.email}</TableCell>
                    <TableCell className="capitalize">{venue.sport_type}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {venue.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/admin/venues/${venue.id}`}>
                            <Eye className="w-4 h-4 mr-2" />
                            Lihat Detail
                          </Link>
                        </Button>
                        <div className="flex-1 max-w-[200px] flex justify-end">
                          <VenueActionButtons 
                            venueId={venue.id} 
                            venueName={venue.name} 
                            status={venue.status} 
                          />
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {venues.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      Tidak ada data venue.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
