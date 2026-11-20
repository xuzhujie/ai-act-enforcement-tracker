import type { Matter } from '../types'
import { getLatestEvent, getMatterActionHistory } from './filters'

const headers = ['Matter ID', 'Regime', 'Title', 'Authority lane', 'Authority', 'Current action', 'Current action subtype', 'Action history', 'Status', 'Subject', 'Scope', 'Legal basis', 'First published', 'Last updated', 'Last verified', 'Latest event ID', 'Latest event', 'Latest event action', 'Latest event subtype', 'Latest event source IDs', 'Latest event citation', 'Latest event locator', 'Source URL']

function escapeCell(value: unknown): string {
  const text = String(value ?? '')
  return /[",\n\r]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export function mattersToCsv(matters: Matter[]): string {
  const rows = matters.map((matter) => {
    const latestEvent = getLatestEvent(matter)
    return [
    matter.id,
    matter.regime,
    matter.title,
    matter.authorityLane,
    matter.authorityName,
    matter.currentActionType,
    matter.currentActionSubtype,
    getMatterActionHistory(matter).join(' · '),
    matter.status,
    matter.subject,
    matter.scope,
    matter.legalBasis.join(' · '),
    matter.firstPublishedAt,
    matter.lastUpdatedAt,
    matter.lastVerifiedAt,
    latestEvent.id,
    latestEvent.label,
    latestEvent.actionType,
    latestEvent.actionSubtype,
    latestEvent.sourceIds.join(' · '),
    latestEvent.citation,
    latestEvent.sourceLocator,
    matter.sources.map((source) => source.url).join(' · '),
    ].map(escapeCell).join(',')
  })
  return `\ufeff${headers.join(',')}\n${rows.join('\n')}\n`
}

export function downloadMattersCsv(matters: Matter[], filename = 'ai-act-tracker.csv'): void {
  const blob = new Blob([mattersToCsv(matters)], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  link.click()
  URL.revokeObjectURL(url)
}
