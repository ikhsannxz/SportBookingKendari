'use client'

import { LucideIcon, CalendarDays, Heart, Bell, MapPin, Building2, Search, BarChart3, Clock, AlertCircle, Store, LineChart, BarChart, Zap } from 'lucide-react'
import { Button } from './button'
import Link from 'next/link'

export type IconName = 'calendar' | 'heart' | 'bell' | 'map' | 'building' | 'search' | 'chart' | 'clock' | 'alert' | 'store' | 'lineChart' | 'barChart' | 'zap'

const IconMap: Record<IconName, LucideIcon> = {
  calendar: CalendarDays,
  heart: Heart,
  bell: Bell,
  map: MapPin,
  building: Building2,
  search: Search,
  chart: BarChart3,
  clock: Clock,
  alert: AlertCircle,
  store: Store,
  lineChart: LineChart,
  barChart: BarChart,
  zap: Zap
}

interface EmptyStateProps {
  icon: IconName
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
  onAction?: () => void
}

export function EmptyState({ 
  icon, 
  title, 
  description, 
  actionLabel, 
  actionHref,
  onAction 
}: EmptyStateProps) {
  const Icon = IconMap[icon] || AlertCircle

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center border-2 border-dashed rounded-xl bg-muted/20 min-h-[300px]">
      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted mb-4">
        <Icon className="w-6 h-6 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold tracking-tight">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-sm mt-2 mb-6">{description}</p>
      {actionLabel && actionHref && (
        <Button asChild>
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      )}
      {actionLabel && onAction && !actionHref && (
        <Button onClick={onAction}>{actionLabel}</Button>
      )}
    </div>
  )
}
