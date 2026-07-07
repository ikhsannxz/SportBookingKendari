import { type LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  label: string
  value: string | number
  icon: LucideIcon
  description?: string
  trend?: {
    value: string
    positive: boolean
  }
  iconColor?: string
  iconBg?: string
  className?: string
}

export function StatsCard({
  label,
  value,
  icon: Icon,
  description,
  trend,
  iconColor = 'text-primary',
  iconBg = 'bg-primary/10',
  className,
}: StatsCardProps) {
  return (
    <Card className={cn('hover:shadow-md transition-shadow', className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <p className="text-sm font-medium text-muted-foreground leading-tight">{label}</p>
          <div className={cn('flex items-center justify-center w-10 h-10 rounded-xl shrink-0', iconBg)}>
            <Icon className={cn('w-5 h-5', iconColor)} />
          </div>
        </div>
        <div className="text-2xl font-bold text-foreground mb-1">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground">{description}</p>
        )}
        {trend && (
          <p
            className={cn(
              'text-xs font-medium mt-1',
              trend.positive ? 'text-emerald-500' : 'text-red-500'
            )}
          >
            {trend.positive ? '↑' : '↓'} {trend.value}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
