import { ReactNode } from 'react'
import { FileQuestion } from 'lucide-react'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  icon?: React.ElementType
  title: string
  description: string
  action?: ReactNode
  className?: string
}

export function EmptyState({
  icon: Icon = FileQuestion,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center p-8 md:p-12 text-center rounded-2xl border border-dashed bg-muted/20',
        className
      )}
    >
      <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
        <Icon className="h-8 w-8 text-muted-foreground opacity-50" />
      </div>
      <h3 className="text-xl font-bold tracking-tight mb-2">{title}</h3>
      <p className="text-muted-foreground max-w-sm mx-auto mb-6">
        {description}
      </p>
      {action && <div>{action}</div>}
    </div>
  )
}
