import type { AuthorityProfile, DataValidationIssue, Matter, Source, SourceHealth, SourceRefreshRecord, SourceRefreshSnapshot } from '../types'

const ISO_DATE = /^\d{4}-\d{2}-\d{2}(?:T.*)?$/

function issue(code: string, path: string, message: string, severity: DataValidationIssue['severity'] = 'error'): DataValidationIssue {
  return { code, path, message, severity }
}

function isHttps(url: string): boolean {
  return /^https:\/\/[^\s]+$/i.test(url)
}

export function validateTrackerData(matters: Matter[], authorities: AuthorityProfile[], sources?: Source[]): DataValidationIssue[] {
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
    if (!matter.sources.length) issues.push(issue('missing-matter-source', `matters.${matter.id}.sources`, 'Every matter must have at least one source'))
    for (const source of matter.sources) {
      if (!isHttps(source.url)) issues.push(issue('source-url-not-https', `matters.${matter.id}.sources.${source.id}.url`, `Source URL must use HTTPS: ${source.url}`))
    }
    if (matter.regime === 'ai-act' && matter.exclusionReason) issues.push(issue('ai-act-has-exclusion-reason', `matters.${matter.id}.exclusionReason`, 'AI Act matters cannot carry an adjacent-regime exclusion reason'))
    if (matter.regime !== 'ai-act' && !matter.exclusionReason) issues.push(issue('missing-exclusion-reason', `matters.${matter.id}.exclusionReason`, 'Adjacent-regime matters must explain why they are excluded from AI Act KPI'))
    for (const authorityId of matter.supportingAuthorities ?? []) {
      if (!authorityIds.has(authorityId)) issues.push(issue('unknown-supporting-authority', `matters.${matter.id}.supportingAuthorities`, `Unknown supporting authority: ${authorityId}`))
    }
    for (const dateField of ['firstPublishedAt', 'lastUpdatedAt', 'lastVerifiedAt'] as const) {
      if (!ISO_DATE.test(matter[dateField])) issues.push(issue('invalid-matter-date', `matters.${matter.id}.${dateField}`, `Invalid ISO date: ${matter[dateField]}`))
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
