import { ActivityEvent } from '@/lib/activity/get-activity-feed'
import { ActivityItem } from './activity-item'
import { isToday, isYesterday, isThisWeek } from 'date-fns'

interface ActivityTimelineProps {
  events: ActivityEvent[]
}

function groupEvents(events: ActivityEvent[]) {
  const groups: Record<string, ActivityEvent[]> = {
    'Hari Ini': [],
    'Kemarin': [],
    'Minggu Ini': [],
    'Sebelumnya': [],
  }

  events.forEach(event => {
    const d = event.date
    if (isToday(d)) {
      groups['Hari Ini'].push(event)
    } else if (isYesterday(d)) {
      groups['Kemarin'].push(event)
    } else if (isThisWeek(d, { weekStartsOn: 1 })) {
      groups['Minggu Ini'].push(event)
    } else {
      groups['Sebelumnya'].push(event)
    }
  })

  return Object.entries(groups).filter(([_, group]) => group.length > 0)
}

export function ActivityTimeline({ events }: ActivityTimelineProps) {
  const groupedEvents = groupEvents(events)

  return (
    <div className="space-y-8">
      {groupedEvents.map(([groupName, groupItems], groupIdx) => (
        <div key={groupName} className="mb-8">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-6 ml-16">
            {groupName}
          </h2>
          <div className="flex flex-col">
            {groupItems.map((item, index) => {
              // The very last item in the entire timeline shouldn't have a line, 
              // or maybe we just don't show the line for the last item in a group?
              // Usually the timeline line connects groups too, but for simplicity we can
              // just pass isLast if it's the very last item overall.
              const isLastItemOverall = 
                groupIdx === groupedEvents.length - 1 && 
                index === groupItems.length - 1

              return (
                <ActivityItem 
                  key={item.id} 
                  event={item} 
                  isLast={isLastItemOverall}
                />
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
