'use client'

import { Bell, CalendarCheck, CalendarX, CheckCircle, CreditCard, MessageSquare, Star, Info, ChevronRight, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDistanceToNow } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import { useRouter } from 'next/navigation'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function NotificationMenu() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const {
          data: { session },
          error: sessionError
        } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Notification auth error:', sessionError)
          return
        }
        
        if (!session) return

        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError) {
          console.error('Notification auth error:', userError)
          return
        }
        
        if (!user) return

        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20)

        if (error) {
          console.error('Notification query error:', error)
          return
        }

        if (data) {
          setNotifications(data)
          setUnreadCount(data.filter(n => !n.is_read).length)
        }
      } catch (err) {
        console.error('Notification fetch failed:', err)
      }
    }

    fetchNotifications()

    // Realtime is optional for now, but leaving structure ready
    const subscription = supabase
      .channel('notifications_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
        },
        (payload) => {
          setNotifications((prev) => [payload.new, ...prev])
          setUnreadCount((prev) => prev + 1)
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const markAsRead = async (id: string) => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', id)
      
    if (!error) {
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n))
      setUnreadCount(prev => Math.max(0, prev - 1))
    }
  }

  const markAllAsRead = async () => {
    if (unreadCount === 0) return
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', user.id)
      .eq('is_read', false)
      
    if (!error) {
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
      setUnreadCount(0)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'booking_created': return <CalendarCheck className="h-4 w-4 text-blue-500" />
      case 'booking_confirmed': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'booking_cancelled': return <CalendarX className="h-4 w-4 text-red-500" />
      case 'booking_completed': return <CheckCircle className="h-4 w-4 text-indigo-500" />
      case 'payment_uploaded': return <CreditCard className="h-4 w-4 text-blue-500" />
      case 'payment_verified': return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'payment_rejected': return <CalendarX className="h-4 w-4 text-red-500" />
      case 'review_received': return <Star className="h-4 w-4 text-yellow-500" />
      default: return <Info className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getActionUrl = (notification: any) => {
    switch (notification.type) {
      case 'booking_created': 
      case 'payment_uploaded': 
        return `/owner/bookings?booking=${notification.reference_id}`
      case 'payment_verified': 
      case 'payment_rejected': 
      case 'booking_confirmed': 
      case 'booking_cancelled': 
        return `/customer/bookings`
      case 'booking_completed': 
        return `/activities`
      case 'review_received': 
        return `/owner/reviews`
      case 'system':
        return notification.reference_type === 'venue' ? `/venues/${notification.reference_id}` : '#'
      default:
        return '#'
    }
  }

  const handleNotificationClick = (n: any) => {
    if (!n.is_read) markAsRead(n.id)
    setIsOpen(false)
    const url = getActionUrl(n)
    if (url !== '#') {
      router.push(url)
    }
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="icon" className="relative h-9 w-9">
            <Bell className="h-4 w-4" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
              </span>
            )}
            <span className="sr-only">Notifikasi</span>
          </Button>
        }
      />
      <DropdownMenuContent align="end" className="w-80 md:w-96 p-0 border shadow-lg">
        <div className="flex items-center justify-between px-4 py-3 bg-muted/30 border-b">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-sm">Notifikasi</h3>
            {unreadCount > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" onClick={markAllAsRead} className="h-auto p-0 text-xs text-primary hover:text-primary/80 bg-transparent">
              <Check className="h-3.5 w-3.5 mr-1" />
              Tandai dibaca
            </Button>
          )}
        </div>
        <div className="max-h-[400px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 px-4 text-center">
              <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                <Bell className="h-6 w-6 text-muted-foreground/50" />
              </div>
              <p className="text-sm font-medium">Belum Ada Notifikasi</p>
              <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
                Semua notifikasi telah dibaca. Kami akan memberi tahu Anda jika ada pembaruan.
              </p>
            </div>
          ) : (
            <div className="flex flex-col">
              {notifications.map((n) => (
                <div 
                  key={n.id} 
                  className={`flex gap-3 px-4 py-3 hover:bg-muted/50 cursor-pointer border-b last:border-0 transition-colors ${!n.is_read ? 'bg-primary/5' : ''}`}
                  onClick={() => handleNotificationClick(n)}
                >
                  <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border bg-background ${!n.is_read ? 'border-primary/20 shadow-sm' : 'border-border'}`}>
                    {getNotificationIcon(n.type)}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm ${!n.is_read ? 'font-semibold text-foreground' : 'font-medium text-foreground/90'}`}>
                        {n.title}
                      </p>
                      <span className="text-[10px] font-medium text-muted-foreground whitespace-nowrap pt-0.5">
                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: localeId })}
                      </span>
                    </div>
                    <p className={`text-xs leading-relaxed line-clamp-2 ${!n.is_read ? 'text-foreground/80' : 'text-muted-foreground'}`}>
                      {n.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
