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
import { updateVenueStatus } from '@/app/actions/admin'
import { toast } from 'sonner'
import { Ban, CheckCircle, XCircle } from 'lucide-react'

interface VenueActionButtonsProps {
  venueId: string
  venueName: string
  status: string
}

export function VenueActionButtons({ venueId, venueName, status }: VenueActionButtonsProps) {
  const [openDialog, setOpenDialog] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleAction(newStatus: string, successMsg: string) {
    setLoading(true)
    try {
      const res = await updateVenueStatus(venueId, newStatus)
      if (res.success) {
        toast.success(successMsg)
        setOpenDialog(null)
      } else {
        toast.error(res.error || 'Terjadi kesalahan')
      }
    } catch (error) {
      toast.error('Terjadi kesalahan yang tidak terduga')
    } finally {
      setLoading(false)
    }
  }

  const renderDialog = (
    action: string, 
    triggerButton: React.ReactElement, 
    title: string, 
    description: string, 
    confirmText: string, 
    onConfirm: () => void,
    variant: 'default' | 'destructive'
  ) => (
    <Dialog open={openDialog === action} onOpenChange={(isOpen) => setOpenDialog(isOpen ? action : null)}>
      <DialogTrigger render={triggerButton} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => setOpenDialog(null)} disabled={loading}>
            Batal
          </Button>
          <Button variant={variant} onClick={onConfirm} disabled={loading}>
            {loading ? 'Memproses...' : confirmText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )

  if (status === 'draft' || status === 'pending') {
    return (
      <div className="flex gap-2 w-full justify-end">
        {renderDialog(
          'reject',
          <Button variant="destructive" size="sm"><XCircle className="w-4 h-4 mr-2" />Tolak</Button>,
          'Tolak Venue',
          `Apakah Anda yakin ingin menolak venue ${venueName}? Status venue akan diubah menjadi 'rejected'.`,
          'Tolak',
          () => handleAction('rejected', 'Venue berhasil ditolak'),
          'destructive'
        )}
        {renderDialog(
          'approve',
          <Button variant="default" size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white"><CheckCircle className="w-4 h-4 mr-2" />Setujui</Button>,
          'Setujui Venue',
          `Apakah Anda yakin ingin menyetujui venue ${venueName}? Venue akan diaktifkan dan muncul di pencarian.`,
          'Setujui',
          () => handleAction('approved', 'Venue berhasil disetujui'),
          'default'
        )}
      </div>
    )
  }

  if (status === 'approved') {
    return renderDialog(
      'suspend',
      <Button variant="destructive" size="sm" className="w-full"><Ban className="w-4 h-4 mr-2" />Nonaktifkan</Button>,
      'Nonaktifkan Venue',
      `Apakah Anda yakin ingin menonaktifkan venue ${venueName}? Venue akan diubah statusnya menjadi suspended dan tidak akan muncul di halaman pencarian.`,
      'Nonaktifkan',
      () => handleAction('suspended', 'Venue berhasil dinonaktifkan'),
      'destructive'
    )
  }

  if (status === 'suspended') {
    return renderDialog(
      'activate',
      <Button variant="default" size="sm" className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"><CheckCircle className="w-4 h-4 mr-2" />Aktifkan</Button>,
      'Aktifkan Venue',
      `Apakah Anda yakin ingin mengaktifkan kembali venue ${venueName}? Status venue akan diubah menjadi 'approved'.`,
      'Aktifkan',
      () => handleAction('approved', 'Venue berhasil diaktifkan'),
      'default'
    )
  }

  return null
}
