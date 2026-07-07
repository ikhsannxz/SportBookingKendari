import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent } from '@/components/ui/card'

export default function SearchLoading() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Filters Sidebar Skeleton */}
        <aside className="w-full lg:w-64 flex-shrink-0 space-y-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-10 w-full rounded-md" />
              </div>
            ))}
          </div>
          <Skeleton className="h-10 w-full mt-6" />
        </aside>

        {/* Search Results Skeleton */}
        <div className="flex-1 space-y-6">
          <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32 hidden sm:block" />
          </div>

          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="overflow-hidden">
                <Skeleton className="aspect-[4/3] w-full" />
                <CardContent className="p-4 flex flex-col space-y-3">
                  <div className="flex justify-between">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-8" />
                  </div>
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-5 w-20 rounded-full" />
                  <div className="mt-4 pt-4 border-t flex justify-between items-end">
                    <div className="space-y-1">
                      <Skeleton className="h-3 w-16" />
                      <Skeleton className="h-5 w-24" />
                    </div>
                    <Skeleton className="h-8 w-20" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
