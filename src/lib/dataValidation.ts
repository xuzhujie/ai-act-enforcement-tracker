import type { ActionSubtype, AuthorityProfile, DataValidationIssue, Matter, Source, SourceHealth, SourceRefreshRecord, SourceRefreshSnapshot } from '../types'

const ISO_DATE = /^\d{4}-\d{2}-\d{2}(?:T.*)?$/

const subtypeActionTypes: Record<ActionSubtype, Matter['currentActionType']> = {
  'formal-investigation': 'investigation',
  'information-request': 'investigation',
  'incident-review': 'investigation',
  'corrective-measure': 'remediation',
  'sanction-decision': 'penalty',
  guidance: 'guidance',
  'authority-infrastructure': 'guidance',
}

function issue(code: string, path: string, message: string, severity: DataValidationIssue['severity'] = 'error'): DataValidationIssue {
  return { code, path, message, severity }
}

function isHttps(url: string): boolean {
  return /^https:\/\/[^\s]+$/i.test(url)
}

export function validateTrackerData(matters: Matter[], authorities: AuthorityProfile[], sources?: Source[], snapshot?: SourceRefreshSnapshot): DataValidationIssue[] {
  const issues: DataValidationIssue[] = []
  const authorityIds = new Set(authorities.map((authority) => authority.id))
  const sourceIds = new Set<string>()
  const matterIds = new Set<string>()
  const sourceList = sources ?? Array.from(new Map(matters.flatMap((matter) => matter.sources).map((source) => [source.id, source])).values())

  for (const source of sourceList) {
    if (sourceIds.has(source.id)) issues.push(issue('duplicate-source-id', `sources.${source.id}`, `Duplicate source id: ${source.id}`))
    sourceIds.add(source.id)
    if (!isHttps(source.url)) issues.push(issue('source-url-not-https', `sources.${source.id}.url`, `Source URL must use HTTPS: ${source.url}`))
    if (!source.title.trim()) issues.push(issue('missing-source-title', `sources.${source.id}.title`, 'Source title cannot be empty'))
  }

  for (const matter of matters) {
    if (matterIds.has(matter.id)) issues.push(issue('duplicate-matter-id', `matters.${matter.id}`, `Duplicate matter id: ${matter.id}`))
    matterIds.add(matter.id)
    // The authority registry is intentionally scoped to AI Act governance. Adjacent-regime
    // reference matters keep their own source-backed authority labels, but must not be
    // mistaken for missing AI Act authority records.
    if (matter.regime === 'ai-act' && !authorityIds.has(matter.primaryAuthorityId)) issues.push(issue('unknown-primary-authority', `matters.${matter.id}.primaryAuthorityId`, `Unknown primary authority: ${matter.primaryAuthorityId}`))
    if (!matter.sources.length) issues.push(issue('missing-matter-source', `matters.${matter.id}.sources`, 'Every matter must have at least one source'))
    const matterSourceIds = new Set(matter.sources.map((source) => source.id))
    for (const source of matter.sources) {
      if (!isHttps(source.url)) issues.push(issue('source-url-not-https', `matters.${matter.id}.sources.${source.id}.url`, `Source URL must use HTTPS: ${source.url}`))
      if (!sourceIds.has(source.id)) issues.push(issue('unknown-matter-source', `matters.${matter.id}.sources.${source.id}`, `Matter source is not present in the source registry: ${source.id}`))
    }
    if (matter.regime === 'ai-act' && matter.exclusionReason) issues.push(issue('ai-act-has-exclusion-reason', `matters.${matter.id}.exclusionReason`, 'AI Act matters cannot carry an adjacent-regime exclusion reason'))
    if (matter.regime !== 'ai-act' && !matter.exclusionReason) issues.push(issue('missing-exclusion-reason', `matters.${matter.id}.exclusionReason`, 'Adjacent-regime matters must explain why they are excluded from AI Act KPI'))
    if (matter.regime === 'ai-act') {
      for (const authorityId of matter.supportingAuthorities ?? []) {
        if (!authorityIds.has(authorityId)) issues.push(issue('unknown-supporting-authority', `matters.${matter.id}.supportingAuthorities`, `Unknown supporting authority: ${authorityId}`))
      }
    }
    for (const dateField of ['firstPublishedAt', 'lastUpdatedAt', 'lastVerifiedAt'] as const) {
      if (!ISO_DATE.test(matter[dateField])) issues.push(issue('invalid-matter-date', `matters.${matter.id}.${dateField}`, `Invalid ISO date: ${matter[dateField]}`))
    }
    if (subtypeActionTypes[matter.currentActionSubtype] !== matter.currentActionType) {
      issues.push(issue('invalid-action-subtype', `matters.${matter.id}.currentActionSubtype`, `Action subtype ${matter.currentActionSubtype} is incompatible with ${matter.currentActionType}`))
    }
    if (matter.currentActionType === 'guidance' && matter.status !== 'published') issues.push(issue('invalid-action-status', `matters.${matter.id}.status`, 'Guidance / implementation matters must use published status'))
    if (matter.currentActionType === 'penalty' && !['concluded', 'follow-up'].includes(matter.status)) issues.push(issue('invalid-action-status', `matters.${matter.id}.status`, 'Penalty / decision matters must be concluded or in follow-up'))
    if (matter.coverage) {
      for (const sourceId of matter.coverage.sourceIds) {
        if (!sourceIds.has(sourceId)) issues.push(issue('unknown-coverage-source', `matters.${matter.id}.coverage.sourceIds`, `Coverage source is not present in the source registry: ${sourceId}`))
        if (!matterSourceIds.has(sourceId)) issues.push(issue('coverage-source-not-in-matter', `matters.${matter.id}.coverage.sourceIds`, `Coverage source is not attached to the matter: ${sourceId}`))
      }
    }
    for (const event of matter.events) {
      if (!ISO_DATE.test(event.date)) issues.push(issue('invalid-event-date', `matters.${matter.id}.events.${event.id}.date`, `Invalid ISO date: ${event.date}`))
      if (ISO_DATE.test(event.date) && ISO_DATE.test(matter.lastUpdatedAt) && event.date > matter.lastUpdatedAt) issues.push(issue('event-after-last-updated', `matters.${matter.id}.events.${event.id}.date`, `Event date is after matter lastUpdatedAt: ${event.date}`))
      if (subtypeActionTypes[event.actionSubtype] !== event.actionType) issues.push(issue('invalid-event-subtype', `matters.${matter.id}.events.${event.id}.actionSubtype`, `Event action subtype ${event.actionSubtype} is incompatible with ${event.actionType}`))
      if (!event.sourceIds?.length) issues.push(issue('missing-event-source', `matters.${matter.id}.events.${event.id}.sourceIds`, 'Every event must have at least one source reference'))
      for (const sourceId of event.sourceIds ?? []) {
        if (!sourceIds.has(sourceId)) issues.push(issue('unknown-event-source', `matters.${matter.id}.events.${event.id}.sourceIds`, `Event source is not present in the source registry: ${sourceId}`))
        if (!matterSourceIds.has(sourceId)) issues.push(issue('event-source-not-in-matter', `matters.${matter.id}.events.${event.id}.sourceIds`, `Event source is not attached to the matter: ${sourceId}`))
      }
      if (event.isTrackerCapture === false && !event.citation?.trim()) issues.push(issue('missing-event-citation', `matters.${matter.id}.events.${event.id}.citation`, 'Published source events must retain a concise citation', 'warning'))
    }
  }

  if (snapshot) {
    const snapshotIds = new Set(snapshot.records.map((record) => record.sourceId))
    for (const source of sourceList) {
      if (!snapshotIds.has(source.id)) issues.push(issue('missing-snapshot-record', `snapshot.${source.id}`, `No refresh record exists for registry source: ${source.id}`))
    }
  }

  return issues
}

export function getSourceHealth(source: Source, record: SourceRefreshRecord | undefined, now = new Date()): SourceHealth {
  if (!record) return 'unverified'
  if (!record.ok) return 'error'
  if (!record.checkedAt) return 'unverified'
  const checkedAt = new Date(record.checkedAt)
  if (Number.isNaN(checkedAt.getTime())) return 'unverified'
  const intervalDays = source.refreshIntervalDays ?? 30
  const ageDays = (now.getTime() - checkedAt.getTime()) / (1000 * 60 * 60 * 24)
  return ageDays > intervalDays ? 'stale' : 'fresh'
}

export function getRefreshRecord(snapshot: SourceRefreshSnapshot, sourceId: string): SourceRefreshRecord | undefined {
  return snapshot.records.find((record) => record.sourceId === sourceId)
}
