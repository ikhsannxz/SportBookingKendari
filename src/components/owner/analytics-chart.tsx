import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { BarChart3 } from 'lucide-react'

interface AnalyticsChartProps {
  title: string
  description?: string
  height?: string
}

export function AnalyticsChart({ title, description, height = 'h-[300px]' }: AnalyticsChartProps) {
  return (
    <Card className="shadow-sm">
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className={`w-full ${height} bg-muted/30 rounded-xl border border-dashed flex flex-col items-center justify-center text-muted-foreground gap-3`}>
          <BarChart3 className="h-8 w-8 opacity-50" />
          <p className="text-sm font-medium">Chart Visualization Placeholder</p>
          <p className="text-xs text-center max-w-[200px] opacity-70">
            Connect to chart library (e.g., Recharts) for live data rendering
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
