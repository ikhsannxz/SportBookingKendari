import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'
import { DashboardCardSkeleton, StatsCardSkeleton } from '@/components/customer/loading-skeleton'

export default function CustomerDashboardLoading() {
  return (
    <div className="container max-w-6xl mx-auto px-4 py-6 md:py-8 space-y-8">
      
      {/* Hero Skeleton */}
      <section className="relative rounded-3xl bg-primary/5 overflow-hidden px-6 py-10 md:py-16 border border-border/50">
        <div className="relative z-10 max-w-2xl space-y-4">
          <Skeleton className="h-10 w-64 md:w-96" />
          <Skeleton className="h-6 w-48 md:w-64" />
          <Skeleton className="h-14 w-full rounded-2xl mt-8" />
        </div>
      </section>

      {/* Quick Actions (Mobile) Skeleton */}
      <section className="grid grid-cols-3 gap-3 md:hidden">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex flex-col items-center gap-2 p-4 bg-muted/20 rounded-2xl">
            <Skeleton className="w-12 h-12 rounded-full" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </section>

      {/* Main Content Skeleton */}
      <div className="grid md:grid-cols-12 gap-8">
        {/* Left Column */}
        <div className="md:col-span-8 space-y-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => <StatsCardSkeleton key={i} />)}
          </div>
          
          <Card className="overflow-hidden">
            <div className="flex flex-col sm:flex-row">
              <Skeleton className="h-48 sm:h-auto sm:w-1/3" />
              <CardContent className="p-6 flex-1 space-y-4">
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-24 w-full rounded-2xl" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
            </div>
          </Card>
        </div>

        {/* Right Column */}
        <div className="md:col-span-4 space-y-8">
          <div className="hidden md:flex flex-col gap-3">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
          <DashboardCardSkeleton />
          <DashboardCardSkeleton />
        </div>
      </div>
    </div>
  )
}
