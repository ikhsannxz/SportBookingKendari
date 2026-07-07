import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export type AppStatus = 
  | 'unpaid' 
  | 'pending' 
  | 'verified' 
  | 'confirmed'
  | 'rejected' 
  | 'cancelled' 
  | 'expired' 
  | 'completed' 
  | 'maintenance'
  | string

interface StatusBadgeProps {
  status: AppStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusConfig = (s: string) => {
    switch (s.toLowerCase()) {
      case 'unpaid':
        return { label: 'Menunggu Pembayaran', className: 'text-orange-500 border-orange-500 hover:bg-orange-50 bg-transparent' }
      case 'pending':
        return { label: 'Menunggu Verifikasi', className: 'text-blue-500 border-blue-500 hover:bg-blue-50 bg-transparent' }
      case 'verified':
      case 'confirmed':
        return { label: 'Terverifikasi', className: 'bg-emerald-500 text-white hover:bg-emerald-600 border-transparent' }
      case 'rejected':
        return { label: 'Ditolak', className: 'bg-red-500 text-white hover:bg-red-600 border-transparent' }
      case 'cancelled':
        return { label: 'Dibatalkan', className: 'bg-red-500 text-white hover:bg-red-600 border-transparent' }
      case 'expired':
        return { label: 'Kadaluarsa', className: 'bg-slate-500 text-white hover:bg-slate-600 border-transparent' }
      case 'completed':
        return { label: 'Selesai', className: 'bg-slate-800 text-white hover:bg-slate-900 border-transparent' }
      case 'maintenance':
        return { label: 'Dalam Perawatan', className: 'bg-amber-500 text-white hover:bg-amber-600 border-transparent' }
      default:
        // Fallback for non-standard statuses (e.g. active, inactive, or sport types)
        return { label: s, className: 'bg-gray-100 text-gray-800 border-gray-200 hover:bg-gray-200' }
    }
  }

  if (!status) return null

  const config = getStatusConfig(status)
  const isOutline = ['unpaid', 'pending'].includes(status.toLowerCase())

  return (
    <Badge 
      variant={isOutline ? "outline" : "default"} 
      className={cn("font-medium px-2.5 py-0.5 whitespace-nowrap", config.className, className)}
    >
      {config.label}
    </Badge>
  )
}
