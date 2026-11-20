import type { Event } from '../types'
import Badge from './Badge'

type TimelineProps = {
  events: Event[]
  compact?: boolean
}

export default function Timeline({ events, compact = false }: TimelineProps) {
  const sortedEvents = [...events].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <ol className={`timeline ${compact ? 'timeline-compact' : ''}`}>
      {sortedEvents.map((event) => (
        <li className="timeline-item" key={event.id}>
          <span className="timeline-dot" aria-hidden="true" />
          <div className="timeline-content">
            <div className="timeline-meta">
              <time dateTime={event.date}>{event.date}</time>
              {event.isTrackerCapture && <span className="date-basis">tracker capture</span>}
              <Badge kind="action" value={event.actionType} compact />
            </div>
            <strong>{event.label}</strong>
            <p>{event.detail}</p>
          </div>
        </li>
      ))}
    </ol>
  )
}
