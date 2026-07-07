import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowUpRight, ArrowDownRight, DollarSign } from 'lucide-react'

interface RevenueCardProps {
  title: string
  amount: string
  trend: number // percentage
  period: string
}

export function RevenueCard({ title, amount, trend, period }: RevenueCardProps) {
  const isPositive = trend >= 0

  return (
    <Card className="overflow-hidden shadow-sm relative">
      <div className="absolute right-0 top-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
          <DollarSign className="h-4 w-4 text-emerald-600" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold tracking-tight mb-2">{amount}</div>
        <div className="flex items-center text-xs">
          <span className={`flex items-center font-medium ${isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
            {isPositive ? <ArrowUpRight className="mr-1 h-3 w-3" /> : <ArrowDownRight className="mr-1 h-3 w-3" />}
            {Math.abs(trend)}%
          </span>
          <span className="text-muted-foreground ml-1">from {period}</span>
        </div>
      </CardContent>
    </Card>
  )
}
