'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toggleUserStatus } from '@/app/actions/admin'
import { toast } from 'sonner'
import { CheckCircle, XCircle } from 'lucide-react'

interface UserActionDialogProps {
  userId: string
  userName: string
  isActive: boolean
}

export function UserActionDialog({ userId, userName, isActive }: UserActionDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const actionName = isActive ? 'Nonaktifkan' : 'Aktifkan'
  const actionDescription = isActive 
    ? `Apakah Anda yakin ingin menonaktifkan pengguna ${userName}? Pengguna tidak akan bisa login ke dalam platform.`
    : `Apakah Anda yakin ingin mengaktifkan pengguna ${userName}? Pengguna akan bisa mengakses platform kembali.`

  async function handleAction() {
    setLoading(true)
    try {
      const res = await toggleUserStatus(userId, isActive)
      if (res.success) {
        toast.success(`Pengguna berhasil di${actionName.toLowerCase()}`)
        setOpen(false)
      } else {
        toast.error(res.error || 'Terjadi kesalahan')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan yang tidak terduga')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button variant={isActive ? 'destructive' : 'default'} size="sm" className="w-full" />}>
        {isActive ? <XCircle className="w-4 h-4 mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
        {actionName}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{actionName} Pengguna</DialogTitle>
          <DialogDescription>
            {actionDescription}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Batal
          </Button>
          <Button 
            variant={isActive ? 'destructive' : 'default'} 
            onClick={handleAction} 
            disabled={loading}
          >
            {loading ? 'Memproses...' : actionName}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
