import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

export function StatsCardSkeleton() {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-28" />
          </div>
          <Skeleton className="h-12 w-12 rounded-2xl" />
        </div>
      </CardContent>
    </Card>
  )
}

export function VenueCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col sm:flex-row h-full">
        <Skeleton className="h-48 sm:h-auto sm:w-64 shrink-0 rounded-none" />
        <CardContent className="p-5 flex-1 flex flex-col justify-between">
          <div>
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2 mb-4" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="mt-4 pt-4 border-t flex justify-between">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-8 w-24" />
          </div>
        </CardContent>
      </div>
    </Card>
  )
}

export function AnalyticsChartSkeleton() {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-32" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[300px] w-full rounded-xl" />
      </CardContent>
    </Card>
  )
}

export function BookingTableSkeleton() {
  return (
    <div className="rounded-xl border bg-card overflow-hidden">
      <div className="p-4 border-b bg-muted/50">
        <Skeleton className="h-6 w-1/4" />
      </div>
      <div className="p-4 space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </div>
  )
}
