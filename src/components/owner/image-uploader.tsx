/* eslint-disable react-hooks/set-state-in-effect */
'use client'

import { useState, useRef, useTransition, useEffect } from 'react'
import { Star, Trash2, Loader2, UploadCloud, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { uploadVenueImageAction, deleteVenueImageAction, setPrimaryImageAction } from '@/app/actions/venue-images'
import type { VenueImage } from '@/lib/types/database'

export interface ImageUploaderProps {
  venueId?: string // if provided, we are in Edit mode
  initialImages?: VenueImage[] // existing DB images
  onPendingFilesChange?: (files: File[], primaryIndex: number) => void // callback for Create mode
}

export function ImageUploader({ venueId, initialImages = [], onPendingFilesChange }: ImageUploaderProps) {
  const [isPending, startTransition] = useTransition()
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // For Edit mode
  const [dbImages, setDbImages] = useState<VenueImage[]>(initialImages)
  
  // Sync dbImages when initialImages changes (e.g. after revalidation)
  useEffect(() => {
    setDbImages(initialImages)
  }, [initialImages])

  // For Create mode
  const [pendingFiles, setPendingFiles] = useState<{file: File, preview: string}[]>([])
  const [primaryIndex, setPrimaryIndex] = useState<number>(0)

  const notifyParent = (files: {file: File, preview: string}[], index: number) => {
    if (onPendingFilesChange) {
      onPendingFilesChange(files.map(pf => pf.file), index)
    }
  }
  // Clean up object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      pendingFiles.forEach(pf => URL.revokeObjectURL(pf.preview))
    }
  }, [pendingFiles])

  const handleUploadClick = () => {
    fileInputRef.current?.click()
  }

  const validateFile = (file: File) => {
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!validTypes.includes(file.type)) {
      toast.error(`${file.name} is not a valid image format. (JPG, PNG, WEBP only)`)
      return false
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error(`${file.name} is too large. Max size is 5MB.`)
      return false
    }
    return true
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    // In Edit mode, we upload immediately
    if (venueId) {
       files.forEach(file => {
          if (!validateFile(file)) return
          
          const formData = new FormData()
          formData.append('file', file)
          
          startTransition(async () => {
            const result = await uploadVenueImageAction(venueId, formData)
            if (result.error) toast.error(result.error)
            else toast.success(result.success)
          })
       })
    } else {
       // Create mode: store in state
       const totalFiles = pendingFiles.length + files.length
       if (totalFiles > 10) {
         toast.error(`Anda hanya dapat mengunggah maksimal 10 gambar. Anda mencoba menambahkan ${files.length} gambar ke ${pendingFiles.length} yang sudah ada.`)
         return
       }
       
       const validFiles = files.filter(validateFile)
       const newPending = validFiles.map(file => ({
         file,
         preview: URL.createObjectURL(file)
       }))
       
       const updatedPending = [...pendingFiles, ...newPending]
       setPendingFiles(updatedPending)
       notifyParent(updatedPending, primaryIndex)
    }
    
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleDeleteDbImage = (imageId: string, url: string) => {
    if (!confirm('Apakah Anda yakin ingin menghapus gambar ini?')) return
    
    startTransition(async () => {
      const result = await deleteVenueImageAction(imageId, venueId!, url)
      if (result.error) toast.error(result.error)
      else toast.success(result.success)
    })
  }

  const handleSetPrimaryDbImage = (imageId: string) => {
    startTransition(async () => {
      const result = await setPrimaryImageAction(imageId, venueId!)
      if (result.error) toast.error(result.error)
      else toast.success(result.success)
    })
  }
  
  const handleSetPrimaryPending = (index: number) => {
    setPrimaryIndex(index)
    notifyParent(pendingFiles, index)
  }

  const handleDeletePending = (index: number) => {
    const updatedFiles = pendingFiles.filter((_, i) => i !== index)
    let newPrimary = primaryIndex
    if (primaryIndex === index) {
       newPrimary = 0
    } else if (primaryIndex > index) {
       newPrimary = primaryIndex - 1
    }
    setPendingFiles(updatedFiles)
    setPrimaryIndex(newPrimary)
    notifyParent(updatedFiles, newPrimary)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Foto Venue</CardTitle>
        <CardDescription>Tambahkan foto venue Anda. Maks 10 gambar (masing-masing 5MB).</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        
        {/* DB Images (Edit Mode) */}
        {dbImages.length > 0 && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            {dbImages.sort((a, b) => a.sort_order - b.sort_order).map((img) => (
              <div key={img.id} className="relative group rounded-lg overflow-hidden border aspect-video bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={img.url} 
                  alt="Venue" 
                  className={`w-full h-full object-cover ${isPending ? 'opacity-50' : ''}`}
                />
                
                {img.is_primary && (
                  <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" /> Utama
                  </div>
                )}
                
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                  {!img.is_primary && (
                    <Button 
                      type="button"
                      size="sm" 
                      variant="secondary" 
                      className="h-8 text-xs w-28" 
                      onClick={() => handleSetPrimaryDbImage(img.id)}
                      disabled={isPending}
                    >
                      <Star className="w-3.5 h-3.5 mr-1" /> Jadikan Utama
                    </Button>
                  )}
                  <Button 
                    type="button"
                    size="sm" 
                    variant="destructive" 
                    className="h-8 text-xs w-28" 
                    onClick={() => handleDeleteDbImage(img.id, img.url)}
                    disabled={isPending}
                  >
                    <Trash2 className="w-3.5 h-3.5 mr-1" /> Hapus
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pending Images (Create Mode) */}
        {pendingFiles.length > 0 && (
          <div className="grid grid-cols-2 gap-4 mb-6">
            {pendingFiles.map((pf, index) => (
              <div key={pf.preview} className="relative group rounded-lg overflow-hidden border aspect-video bg-muted">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={pf.preview} 
                  alt="Pending" 
                  className="w-full h-full object-cover"
                />
                
                {primaryIndex === index && (
                  <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1">
                    <Star className="w-3 h-3 fill-current" /> Utama
                  </div>
                )}
                
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
                  {primaryIndex !== index && (
                    <Button 
                      type="button"
                      size="sm" 
                      variant="secondary" 
                      className="h-8 text-xs w-28" 
                      onClick={() => handleSetPrimaryPending(index)}
                    >
                      <Star className="w-3.5 h-3.5 mr-1" /> Jadikan Utama
                    </Button>
                  )}
                  <Button 
                    type="button"
                    size="sm" 
                    variant="destructive" 
                    className="h-8 text-xs w-28" 
                    onClick={() => handleDeletePending(index)}
                  >
                    <X className="w-3.5 h-3.5 mr-1" /> Hapus
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Upload Dropzone */}
        {(!venueId && pendingFiles.length >= 10) ? (
          <div className="p-4 rounded-xl bg-muted border text-center text-sm text-muted-foreground">
            Batas maksimal 10 gambar telah tercapai.
          </div>
        ) : (
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
            <p className="text-xs text-muted-foreground mt-4">JPG, PNG, WEBP (maks. 5MB)</p>
          </div>
        )}
        
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept="image/jpeg, image/jpg, image/png, image/webp" 
          className="hidden" 
          multiple={!venueId}
        />
        
      </CardContent>
    </Card>
  )
}
