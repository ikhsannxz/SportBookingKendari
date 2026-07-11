import { 
  Calendar, CheckCircle, XCircle, Upload, 
  BadgeCheck, AlertCircle, Star, LucideIcon 
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { id } from 'date-fns/locale'
import { ActivityEvent, ActivityEventType } from '@/lib/activity/get-activity-feed'
import { StatusBadge } from '@/components/ui/status-badge'
import Link from 'next/link'

interface EventDisplayConfig {
  icon: LucideIcon
  title: string
  colorClass: string
}

function getDisplayConfig(type: ActivityEventType): EventDisplayConfig {
  switch (type) {
    case 'booking_created':
      return { icon: Calendar, title: 'Booking Berhasil Dibuat', colorClass: 'text-emerald-600 bg-emerald-50' }
    case 'payment_uploaded':
      return { icon: Upload, title: 'Bukti Pembayaran Diunggah', colorClass: 'text-blue-600 bg-blue-50' }
    case 'payment_verified':
      return { icon: BadgeCheck, title: 'Pembayaran Diverifikasi', colorClass: 'text-emerald-600 bg-emerald-50' }
    case 'payment_rejected':
      return { icon: AlertCircle, title: 'Pembayaran Ditolak', colorClass: 'text-red-600 bg-red-50' }
    case 'booking_completed':
      return { icon: CheckCircle, title: 'Booking Selesai', colorClass: 'text-emerald-600 bg-emerald-50' }
    case 'booking_cancelled':
      return { icon: XCircle, title: 'Booking Dibatalkan', colorClass: 'text-red-600 bg-red-50' }
    case 'review_submitted':
      return { icon: Star, title: 'Ulasan Berhasil Dikirim', colorClass: 'text-amber-500 bg-amber-50' }
  }
}

interface ActivityItemProps {
  event: ActivityEvent
  isLast?: boolean
}

export function ActivityItem({ event, isLast }: ActivityItemProps) {
  const config = getDisplayConfig(event.type)
  const Icon = config.icon
  const relativeTime = formatDistanceToNow(event.date, { addSuffix: true, locale: id })

  return (
    <div className="relative flex gap-4">
      {/* Timeline Line */}
      {!isLast && (
        <div className="absolute top-10 left-6 bottom-0 w-px bg-slate-200 -ml-px z-0" />
      )}
      
      {/* Icon Container */}
      <div className="relative z-10 flex-shrink-0 mt-1">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 border-white shadow-sm ${config.colorClass}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {/* Content Card */}
      <div className="flex-1 pb-8">
        <Link href={`/customer/bookings/${event.bookingId}`} className="block">
          <div className="bg-white border border-slate-200 rounded-xl p-4 md:p-5 shadow-sm hover:shadow-md transition-shadow group">
            
            <div className="flex flex-col md:flex-row md:items-start justify-between gap-2 mb-3">
              <div>
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  {config.title}
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  Venue: <span className="font-semibold text-slate-700">{event.venueName}</span>
                </p>
              </div>
              <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2.5 py-1 rounded-md self-start">
                {relativeTime}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 border-t border-slate-100">
              <div className="flex items-center gap-2 text-sm text-slate-600">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>{event.bookingDetails.date}</span>
                <span className="text-slate-300">•</span>
                <span>{event.bookingDetails.time}</span>
              </div>
              
              {event.status && (
                <div className="self-start sm:self-auto">
                  <StatusBadge status={event.status} />
                </div>
              )}
            </div>

          </div>
        </Link>
      </div>
    </div>
  )
}
