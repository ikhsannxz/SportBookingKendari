import { type LucideIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { EmptyState } from './empty-state'

export interface DashboardCardItem {
  id: string
  title: string
  subtitle?: string
  badge?: React.ReactNode
  meta?: string
  image?: string
  initials?: string
  href?: string
}

interface DashboardCardProps {
  title: string
  description?: string
  items: DashboardCardItem[]
  emptyIcon: LucideIcon
  emptyTitle: string
  emptyDescription: string
  emptyAction?: { label: string; href: string }
  viewAllHref?: string
  className?: string
}

export function DashboardCard({
  title,
  description,
  items,
  emptyIcon,
  emptyTitle,
  emptyDescription,
  emptyAction,
  viewAllHref,
  className,
}: DashboardCardProps) {
  return (
    <Card className={cn('flex flex-col', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base">{title}</CardTitle>
            {description && (
              <CardDescription className="text-xs mt-0.5">{description}</CardDescription>
            )}
          </div>
          {viewAllHref && items.length > 0 && (
            <Button variant="ghost" size="sm" asChild className="text-xs h-7 px-2">
              <Link href={viewAllHref}>Lihat Semua</Link>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        {items.length === 0 ? (
          <EmptyState
            icon={emptyIcon}
            title={emptyTitle}
            description={emptyDescription}
            action={emptyAction}
            className="py-8"
          />
        ) : (
          <ul className="space-y-3">
            {items.map((item) => (
              <li key={item.id}>
                {item.href ? (
                  <Link
                    href={item.href}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/60 transition-colors group"
                  >
                    <DashboardCardItemContent item={item} />
                  </Link>
                ) : (
                  <div className="flex items-center gap-3 p-2 rounded-lg">
                    <DashboardCardItemContent item={item} />
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

function DashboardCardItemContent({ item }: { item: DashboardCardItem }) {
  return (
    <>
      {/* Image / Initials */}
      <div className="w-11 h-11 rounded-xl bg-muted shrink-0 overflow-hidden flex items-center justify-center text-xs font-semibold text-muted-foreground">
        {item.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
        ) : (
          item.initials ?? '?'
        )}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground line-clamp-1">{item.title}</p>
        {item.subtitle && (
          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{item.subtitle}</p>
        )}
      </div>

      {/* Right content */}
      <div className="shrink-0 flex flex-col items-end gap-1">
        {item.badge}
        {item.meta && (
          <span className="text-xs text-muted-foreground">{item.meta}</span>
        )}
      </div>
    </>
  )
}
