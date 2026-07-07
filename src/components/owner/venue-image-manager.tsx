'use client'

import { useTransition, useRef } from 'react'
import { Star, Trash2, Loader2, UploadCloud } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { uploadVenueImageAction, deleteVenueImageAction, setPrimaryImageAction } from '@/app/actions/venue-images'
import type { VenueImage } from '@/lib/types/database'

export function VenueImageManager({ venueId, initialImages }: { venueId: string, initialImages: VenueImage[] }) {
  const [isPending, startTransition] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File is too large. Max size is 5MB.')
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    startTransition(async () => {
      const result = await uploadVenueImageAction(venueId, formData)
      if (result.error) {
        toast.error(result.error)
      } else if (result.success) {
        toast.success(result.success)
      }
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    })
  }

  const handleDelete = (imageId: string, url: string) => {
    if (!confirm('Are you sure you want to delete this image?')) return
    
    startTransition(async () => {
      const result = await deleteVenueImageAction(imageId, venueId, url)
      if (result.error) {
        toast.error(result.error)
      } else if (result.success) {
        toast.success(result.success)
      }
    })
  }

  const handleSetPrimary = (imageId: string) => {
    startTransition(async () => {
      const result = await setPrimaryImageAction(imageId, venueId)
      if (result.error) {
        toast.error(result.error)
      } else if (result.success) {
        toast.success(result.success)
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Images</CardTitle>
        <CardDescription>Add photos of your venue.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {initialImages.length > 0 && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            {initialImages.map((img) => (
              <div key={img.id} className="relative group rounded-lg overflow-hidden border aspect-video bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={img.url} 
                  alt="Venue" 
                  className={`w-full h-full object-cover ${isPending ? 'opacity-50' : ''}`}
                />
                
                {img.is_primary && (
                  <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" /> Primary
                  </div>
                )}
                
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                  {!img.is_primary && (
                    <Button 
                      size="sm" 
                      variant="secondary" 
                      className="h-8 text-xs w-28" 
                      onClick={() => handleSetPrimary(img.id)}
                      disabled={isPending}
                    >
                      <Star className="w-3.5 h-3.5 mr-1" /> Set Primary
                    </Button>
                  )}
                  <Button 
                    size="sm" 
                    variant="destructive" 
                    className="h-8 text-xs w-28" 
                    onClick={() => handleDelete(img.id, img.url)}
                    disabled={isPending}
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div 
          onClick={handleUploadClick}
          className={`border-2 border-dashed rounded-xl p-8 flex flex-col items-center justify-center text-center cursor-pointer transition-colors ${
            isPending ? 'opacity-50 pointer-events-none' : 'hover:bg-muted/50'
          }`}
        >
          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mb-4">
            {isPending ? <Loader2 className="w-6 h-6 animate-spin" /> : <UploadCloud className="w-6 h-6" />}
          </div>
          <p className="font-semibold mb-1">Klik untuk mengunggah</p>
          <p className="text-sm text-muted-foreground">atau seret dan lepas</p>
          <p className="text-xs text-muted-foreground mt-4">SVG, PNG, JPG or GIF (max. 5MB)</p>
        </div>
        
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/*" 
          className="hidden" 
        />
        
      </CardContent>
    </Card>
  )
}
