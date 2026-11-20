import type { Event, Source } from '../types'
import Badge from './Badge'

type TimelineProps = {
  events: Event[]
  sources?: Source[]
  compact?: boolean
}

export default function Timeline({ events, sources = [], compact = false }: TimelineProps) {
  const sortedEvents = [...events].sort((a, b) => b.date.localeCompare(a.date))
  const sourceById = new Map(sources.map((source) => [source.id, source]))

  return (
    <ol className={`timeline ${compact ? 'timeline-compact' : ''}`}>
      {sortedEvents.map((event) => (
        <li className="timeline-item" key={event.id}>
          <span className="timeline-dot" aria-hidden="true" />
          <div className="timeline-content">
            <div className="timeline-meta">
              <time dateTime={event.date}>{event.date}</time>
              {event.isTrackerCapture && <span className="date-basis">tracker capture</span>}
              <Badge kind="action" value={event.actionType} subtype={event.actionSubtype} compact />
            </div>
            <strong>{event.label}</strong>
            <p>{event.detail}</p>
            <div className="timeline-evidence">
              <span className="timeline-evidence-label">事件证据</span>
              {event.sourceIds.length > 0 ? event.sourceIds.map((sourceId) => {
                const source = sourceById.get(sourceId)
                if (!source) return <span className="timeline-evidence-missing" key={sourceId}>未找到来源 {sourceId}</span>
                return <a href={source.url} target="_blank" rel="noreferrer" key={sourceId} aria-label={`事件证据：${source.title}`}>{source.title}</a>
              }) : <span className="timeline-evidence-missing">未绑定来源</span>}
              {event.sourceLocator && <span className="timeline-source-locator">{event.sourceLocator}</span>}
              {event.citation && <span className="timeline-citation">{event.citation}</span>}
            </div>
          </div>
        </li>
      ))}
    </ol>
  )
}
