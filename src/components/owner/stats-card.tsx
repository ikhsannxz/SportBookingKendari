import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatsCardProps {
  label: string
  value: string | number
  icon: React.ElementType
  iconBg?: string
  iconColor?: string
  trend?: {
    value: string
    isUp: boolean
  }
}

export function StatsCard({
  label,
  value,
  icon: Icon,
  iconBg = 'bg-primary/10',
  iconColor = 'text-primary',
  trend
}: StatsCardProps) {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">{label}</p>
            <p className="text-3xl font-bold tracking-tight">{value}</p>
            {trend && (
              <div className="flex items-center gap-1 text-xs font-medium mt-1">
                <span className={trend.isUp ? 'text-emerald-600' : 'text-rose-600'}>
                  {trend.isUp ? '+' : '-'}{trend.value}
                </span>
                <span className="text-muted-foreground">vs last month</span>
              </div>
            )}
          </div>
          <div className={cn('h-12 w-12 rounded-2xl flex items-center justify-center shrink-0', iconBg)}>
            <Icon className={cn('h-6 w-6', iconColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
