'use client'

import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDistanceToNow } from 'date-fns'
import { id as localeId } from 'date-fns/locale'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export function NotificationMenu() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    const fetchNotifications = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20)

      if (data) {
        setNotifications(data)
        setUnreadCount(data.filter(n => !n.is_read).length)
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

  return (
    <DropdownMenu>
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
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between px-3 py-2 text-sm font-semibold">
          <span>Notifikasi</span>
          {unreadCount > 0 && (
            <span className="text-xs font-normal text-muted-foreground">
              {unreadCount} belum dibaca
            </span>
          )}
        </div>
        <DropdownMenuSeparator />
        <div className="max-h-[400px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
              <Bell className="h-8 w-8 text-muted-foreground/30 mb-2" />
              <p className="text-sm font-medium text-muted-foreground">Belum Ada Notifikasi</p>
              <p className="text-xs text-muted-foreground/70 mt-0.5">
                Semua notifikasi telah dibaca.
              </p>
            </div>
          ) : (
            notifications.map((n) => (
              <div 
                key={n.id} 
                className={`px-3 py-3 hover:bg-muted/50 cursor-pointer border-b last:border-0 ${!n.is_read ? 'bg-primary/5' : ''}`}
                onClick={() => {
                  if (!n.is_read) markAsRead(n.id)
                }}
              >
                <div className="flex justify-between items-start">
                  <p className={`text-sm ${!n.is_read ? 'font-semibold' : 'font-medium'}`}>{n.title}</p>
                  {!n.is_read && <span className="h-2 w-2 rounded-full bg-primary shrink-0 mt-1" />}
                </div>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{n.message}</p>
                <p className="text-[10px] text-muted-foreground/70 mt-1.5 font-medium">
                  {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: localeId })}
                </p>
              </div>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
