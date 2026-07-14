'use client'

import { useState, useTransition, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Check, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { createVenueAction, updateVenueAction } from '@/app/actions/venues'
import { ImageUploader } from '@/components/owner/image-uploader'
import { translateFacility } from '@/lib/utils'
import type { Venue, VenueFacility, VenueImage } from '@/lib/types/database'

const facilitiesList = ['Premium Vinyl Court', 'Shower & Toilet', 'Waiting Area', 'Cafe / Canteen', 'Free WiFi', 'Spacious Parking', 'Prayer Room']

const DAYS = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu']

export function VenueForm({ 
  isEdit = false, 
  initialData, 
  initialFacilities = [],
  initialImages = []
}: { 
  isEdit?: boolean, 
  initialData?: Venue | null, 
  initialFacilities?: VenueFacility[],
  initialImages?: VenueImage[]
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  
  const [selectedFacilities, setSelectedFacilities] = useState<string[]>(
    initialFacilities.map(f => f.name)
  )

  const [pendingImages, setPendingImages] = useState<File[]>([])
  const [primaryImageIndex, setPrimaryImageIndex] = useState<number>(0)
  const [status, setStatus] = useState<string>(initialData?.status || 'draft')
  
  const [maintenanceReason, setMaintenanceReason] = useState<string>(initialData?.maintenance_reason || '')
  const [maintenanceUntil, setMaintenanceUntil] = useState<string>(initialData?.maintenance_until ? initialData.maintenance_until.substring(0,10) : '')
  
  const [formData, setFormData] = useState({
    name: initialData?.name ?? '',
    sport_type: initialData?.sport_type ?? 'futsal',
    price_per_hour: initialData?.price_per_hour ?? '',
    description: initialData?.description ?? '',
    address: initialData?.address ?? '',
    city: initialData?.city ?? '',
    district: initialData?.district ?? '',
    latitude: initialData?.latitude ?? '',
    longitude: initialData?.longitude ?? '',
    google_maps_url: initialData?.google_maps_url ?? '',
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const [schedules, setSchedules] = useState(
    DAYS.map((day, idx) => ({
      day_of_week: idx,
      open_time: '08:00',
      close_time: '22:00',
      is_closed: false
    }))
  )

  const handlePendingFilesChange = useCallback((files: File[], primaryIdx: number) => {
    setPendingImages(files)
    setPrimaryImageIndex(primaryIdx)
  }, [])

  const toggleFacility = (facility: string) => {
    setSelectedFacilities(prev => 
      prev.includes(facility) 
        ? prev.filter(f => f !== facility)
        : [...prev, facility]
    )
  }
  
  const updateSchedule = (index: number, field: string, value: any) => {
    setSchedules(prev => {
      const newSchedules = [...prev]
      newSchedules[index] = { ...newSchedules[index], [field]: value }
      return newSchedules
    })
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    formData.append('facilities', JSON.stringify(selectedFacilities))
    formData.append('schedules', JSON.stringify(schedules))

    if (!isEdit) {
      pendingImages.forEach(file => {
        formData.append('images', file)
      })
      formData.append('primaryImageIndex', primaryImageIndex.toString())
    }

    startTransition(async () => {
      let result
      if (isEdit && initialData?.id) {
        result = await updateVenueAction(initialData.id, formData)
      } else {
        result = await createVenueAction(formData)
      }

      if (result?.error) {
        toast.error(result.error)
      } else if (result?.success) {
        toast.success(result.success)
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Column */}
        <div className="lg:col-span-2 space-y-8">
          {/* General Information */}
          <Card>
            <CardHeader>
              <CardTitle>Informasi Umum</CardTitle>
              <CardDescription>Detail dasar tentang venue Anda.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Venue</Label>
                <Input name="name" id="name" value={formData.name} onChange={handleInputChange} placeholder="cth. Champion Futsal Arena" required />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sport_type">Jenis Olahraga</Label>
                  <Select name="sport_type" value={formData.sport_type} onValueChange={(val) => setFormData(prev => ({ ...prev, sport_type: val as any }))}>
                    <SelectTrigger id="sport_type">
                      <SelectValue placeholder="Pilih olahraga" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="futsal">Futsal</SelectItem>
                      <SelectItem value="badminton">Badminton</SelectItem>
                      <SelectItem value="basketball">Basket</SelectItem>
                      <SelectItem value="tennis">Tenis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price_per_hour">Harga per Jam (Rp)</Label>
                  <Input name="price_per_hour" id="price_per_hour" value={formData.price_per_hour} onChange={handleInputChange} type="number" placeholder="150000" required />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea 
                  name="description"
                  id="description" 
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Deskripsikan venue Anda, kualitasnya, dan apa yang membuatnya spesial..."
                  className="min-h-[120px]"
                />
              </div>
            </CardContent>
          </Card>

          {/* Location */}
          <Card>
            <CardHeader>
              <CardTitle>Lokasi</CardTitle>
              <CardDescription>Dimana lokasi venue Anda?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="address">Alamat</Label>
                <Input name="address" id="address" value={formData.address} onChange={handleInputChange} placeholder="Alamat jalan" required />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Kota</Label>
                  <Input name="city" id="city" value={formData.city} onChange={handleInputChange} placeholder="cth. Kendari" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="district">Kecamatan</Label>
                  <Input name="district" id="district" value={formData.district} onChange={handleInputChange} placeholder="cth. Kadia" />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="latitude">Latitude</Label>
                  <Input name="latitude" id="latitude" value={formData.latitude} onChange={handleInputChange} placeholder="-3.996" type="number" step="any" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="longitude">Longitude</Label>
                  <Input name="longitude" id="longitude" value={formData.longitude} onChange={handleInputChange} placeholder="122.512" type="number" step="any" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="google_maps_url">Google Maps URL</Label>
                <Input name="google_maps_url" id="google_maps_url" value={formData.google_maps_url} onChange={handleInputChange} placeholder="https://maps.app.goo.gl/..." type="url" />
                <p className="text-xs text-muted-foreground mt-1">
                  Tempelkan link Google Maps venue Anda. <br/>
                  <span className="font-medium">Google Maps &rarr; Bagikan &rarr; Salin Link</span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Facilities */}
          <Card>
            <CardHeader>
              <CardTitle>Fasilitas</CardTitle>
              <CardDescription>Fasilitas apa saja yang tersedia di venue Anda?</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {facilitiesList.map(facility => {
                  const isSelected = selectedFacilities.includes(facility)
                  return (
                    <div 
                      key={facility}
                      onClick={() => toggleFacility(facility)}
                      className={`flex items-center gap-2 p-3 rounded-xl border cursor-pointer transition-colors ${
                        isSelected ? 'border-primary bg-primary/5 text-primary' : 'hover:bg-muted'
                      }`}
                    >
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 border ${
                        isSelected ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground/30'
                      }`}>
                        {isSelected && <Check className="w-3.5 h-3.5" />}
                      </div>
                      <span className="text-sm font-medium">{translateFacility(facility)}</span>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
          
          {/* Jadwal Operasional */}
          <Card>
            <CardHeader>
              <CardTitle>Jadwal Operasional</CardTitle>
              <CardDescription>Atur jam buka dan tutup untuk setiap hari.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {schedules.map((schedule, index) => (
                  <div key={schedule.day_of_week} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border">
                    <div className="flex items-center gap-4 min-w-[120px]">
                      <Switch 
                        checked={!schedule.is_closed} 
                        onCheckedChange={(checked) => updateSchedule(index, 'is_closed', !checked)}
                      />
                      <span className={`font-medium ${schedule.is_closed ? 'text-muted-foreground' : ''}`}>
                        {DAYS[schedule.day_of_week]}
                      </span>
                    </div>
                    
                    {!schedule.is_closed ? (
                      <div className="flex items-center gap-2">
                        <Input 
                          type="time" 
                          value={schedule.open_time} 
                          onChange={(e) => updateSchedule(index, 'open_time', e.target.value)}
                          className="w-32"
                        />
                        <span>-</span>
                        <Input 
                          type="time" 
                          value={schedule.close_time} 
                          onChange={(e) => updateSchedule(index, 'close_time', e.target.value)}
                          className="w-32"
                        />
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground italic w-full sm:w-auto text-center sm:text-left">
                        Tutup
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-8">
          {/* Images */}
          <ImageUploader 
            venueId={isEdit ? initialData?.id : undefined} 
            initialImages={initialImages} 
            onPendingFilesChange={handlePendingFilesChange}
          />

          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <CardContent>
              <Select name="status" value={status} onValueChange={(val) => val && setStatus(val)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Konsep</SelectItem>
                  <SelectItem value="pending">Menunggu Persetujuan</SelectItem>
                  <SelectItem value="approved">Aktif</SelectItem>
                  <SelectItem value="maintenance">Dalam Perawatan</SelectItem>
                </SelectContent>
              </Select>

              {status === 'maintenance' && (
                <div className="mt-4 space-y-4 pt-4 border-t">
                  <div className="space-y-2">
                    <Label htmlFor="maintenance_reason">Alasan Perawatan</Label>
                    <Textarea 
                      name="maintenance_reason" 
                      id="maintenance_reason" 
                      value={maintenanceReason ?? ""}
                      onChange={(e) => setMaintenanceReason(e.target.value)}
                      placeholder="cth. Perbaikan lampu lapangan" 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="maintenance_until">Estimasi Selesai</Label>
                    <Input 
                      type="date" 
                      name="maintenance_until" 
                      id="maintenance_until" 
                      value={maintenanceUntil ?? ""}
                      onChange={(e) => setMaintenanceUntil(e.target.value)}
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="flex items-center justify-end gap-4 border-t pt-6">
        <Button variant="outline" type="button" onClick={() => router.back()} disabled={isPending}>Batal</Button>
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEdit ? 'Simpan Perubahan' : 'Buat Venue'}
        </Button>
      </div>
    </form>
  )
}
