'use client'

import { useState, useTransition, useRef, useEffect, Fragment } from 'react'
import { User, Mail, Phone, Camera, Loader2, QrCode, Upload, CheckCircle2, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { updateProfileAction, uploadAvatarAction, uploadQrisAction } from '@/app/actions/profile'
import { Profile } from '@/lib/types/database'
import Image from 'next/image'

interface ProfileFormProps {
  profile: Profile
}

export function ProfileForm({ profile }: ProfileFormProps) {
  const [isPending, startTransition] = useTransition()
  const [isUploading, setIsUploading] = useState(false)
  const [isUploadingQris, setIsUploadingQris] = useState(false)
  
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url ?? '')
  const [qrisUrl, setQrisUrl] = useState(profile.qris_image_url ?? '')
  const [fullName, setFullName] = useState(profile.full_name ?? '')
  const [phone, setPhone] = useState(profile.phone ?? '')
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  const qrisInputRef = useRef<HTMLInputElement>(null)

  const getInitials = (name: string) => {
    const parts = name.split(' ')
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 2 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 2MB.')
      return
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/gif']
    if (!validTypes.includes(file.type)) {
      toast.error('Format file tidak didukung. Gunakan JPG, PNG, atau GIF.')
      return
    }

    const objectUrl = URL.createObjectURL(file)
    setAvatarUrl(objectUrl)

    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', file)

    const result = await uploadAvatarAction(formData)
    setIsUploading(false)
    
    if (result.error) {
      toast.error(result.error)
      setAvatarUrl(profile.avatar_url ?? '')
    } else if (result.url) {
      toast.success('Foto profil berhasil diperbarui.')
      setAvatarUrl(result.url)
    }
  }

  const handleQrisChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Ukuran file maksimal 5MB.')
      return
    }

    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/jpg']
    if (!validTypes.includes(file.type)) {
      toast.error('Format file tidak didukung. Gunakan JPG, PNG, atau GIF.')
      return
    }

    const objectUrl = URL.createObjectURL(file)
    setQrisUrl(objectUrl)

    setIsUploadingQris(true)
    const formData = new FormData()
    formData.append('file', file)

    const result = await uploadQrisAction(formData)
    setIsUploadingQris(false)
    
    if (result.error) {
      toast.error(result.error)
      setQrisUrl(profile.qris_image_url ?? '')
    } else if (result.url) {
      toast.success('QRIS berhasil diperbarui.')
      setQrisUrl(result.url)
    }
  }

  // Sync state with props in case the profile updates (e.g., from revalidatePath)
  useEffect(() => {
    setAvatarUrl(profile.avatar_url ?? '')
    setQrisUrl(profile.qris_image_url ?? '')
    setFullName(profile.full_name ?? '')
    setPhone(profile.phone ?? '')
  }, [profile])

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    startTransition(async () => {
      const result = await updateProfileAction(null, formData)
      if (result?.error) {
        toast.error(result.error)
      } else if (result?.success) {
        toast.success(result.success)
      }
    })
  }

  return (
    <div className="space-y-6">
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Informasi Pribadi</CardTitle>
            <CardDescription>Perbarui detail kontak pribadi dan bisnis Anda.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <div className="flex items-center gap-6">
              <Avatar className="w-24 h-24 border-2">
                <AvatarImage src={avatarUrl || undefined} alt={profile.full_name} className="object-cover" />
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                  {getInitials(profile.full_name)}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-2">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/jpeg,image/png,image/gif"
                  onChange={handleFileChange}
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="sm" 
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Camera className="w-4 h-4 mr-2" />}
                  {isUploading ? 'Mengunggah...' : 'Ubah Foto'}
                </Button>
                <p className="text-xs text-muted-foreground">JPG, GIF, atau PNG. Maks 2MB.</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nama Lengkap</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="fullName" 
                    name="fullName" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="pl-9" 
                    required 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Nomor Telepon</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="phone" 
                    name="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="08..."
                    className="pl-9" 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Alamat Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="email" type="email" value={profile.email ?? ''} disabled readOnly className="pl-9 bg-muted" />
                </div>
                <p className="text-xs text-muted-foreground">Email tidak dapat diubah.</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Peran</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input 
                    id="role" 
                    value={profile.role === 'owner' ? 'Pemilik Venue' : profile.role === 'customer' ? 'Pelanggan' : 'Admin'} 
                    disabled 
                    readOnly
                    className="pl-9 bg-muted" 
                  />
                </div>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end border-t p-6">
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Simpan Perubahan
            </Button>
          </CardFooter>
        </form>
      </Card>

      {profile.role === 'owner' && (
        <Card>
          <CardHeader>
            <CardTitle>QRIS Pembayaran</CardTitle>
            <CardDescription>
              QRIS ini akan digunakan pelanggan saat melakukan pembayaran booking venue Anda.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="w-40 h-40 border-2 border-dashed rounded-xl bg-muted/30 flex items-center justify-center overflow-hidden shrink-0 relative">
                {qrisUrl ? (
                  <Image unoptimized src={qrisUrl} alt="QRIS" fill className="object-contain p-2" />
                ) : (
                  <QrCode className="w-12 h-12 text-muted-foreground/30" />
                )}
              </div>
              <div className="space-y-4 flex-1">
                <div className="flex items-center gap-2">
                  {qrisUrl ? (
                    <div className="flex items-center gap-2 text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-full text-sm font-medium">
                      <CheckCircle2 className="w-4 h-4" />
                      QRIS sudah diatur
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-orange-600 bg-orange-50 px-3 py-1.5 rounded-full text-sm font-medium">
                      <AlertTriangle className="w-4 h-4" />
                      QRIS belum diatur
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <input 
                    type="file" 
                    ref={qrisInputRef} 
                    className="hidden" 
                    accept="image/jpeg,image/png,image/gif"
                    onChange={handleQrisChange}
                  />
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => qrisInputRef.current?.click()}
                    disabled={isUploadingQris}
                  >
                    {isUploadingQris ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                    {isUploadingQris ? 'Mengunggah...' : 'Unggah QRIS Baru'}
                  </Button>
                  <p className="text-xs text-muted-foreground">JPG, GIF, atau PNG. Maks 5MB.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
