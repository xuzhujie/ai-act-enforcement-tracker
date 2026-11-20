import type {
  AuthorityCount,
  AuthorityProfile,
  Event,
  FilterState,
  Matter,
  MatterSort,
  OverviewMetrics,
} from '../types'

const emptyFilterState: FilterState = { search: '' }

function isAiActMatter(matter: Matter): boolean {
  return matter.regime === 'ai-act'
}

export function isFormalInvestigation(matter: Matter): boolean {
  return matter.currentActionType === 'investigation' && matter.currentActionSubtype === 'formal-investigation'
}

export function getMatterActionHistory(matter: Matter): Matter['currentActionType'][] {
  const actionHistory: Matter['currentActionType'][] = []
  const events = [...matter.events].sort((a, b) => {
    const dateDifference = a.date.localeCompare(b.date)
    if (dateDifference !== 0) return dateDifference
    return a.id.localeCompare(b.id)
  })

  for (const event of events) {
    if (!actionHistory.includes(event.actionType)) actionHistory.push(event.actionType)
  }
  if (!actionHistory.includes(matter.currentActionType)) actionHistory.push(matter.currentActionType)
  return actionHistory
}

function matchesSearch(matter: Matter, search: string): boolean {
  const normalizedSearch = search.trim().toLocaleLowerCase()
  if (!normalizedSearch) return true

  const searchableText = [
    matter.title,
    matter.shortTitle,
    matter.authorityName,
    matter.subject,
    matter.memberState,
    matter.legalBasis.join(' '),
    ...matter.events.flatMap((event) => [event.label, event.detail, event.citation, event.sourceLocator]),
    ...matter.sources.map((source) => source.title),
  ]
    .filter(Boolean)
    .join(' ')
    .toLocaleLowerCase()

  return searchableText.includes(normalizedSearch)
}

export function getLatestEvent(matter: Matter): Event {
  if (matter.events.length === 0) {
    return {
      id: `${matter.id}-last-update`,
      date: matter.lastUpdatedAt,
      label: 'Matter updated',
      detail: matter.summary,
      actionType: matter.currentActionType,
      actionSubtype: matter.currentActionSubtype,
      sourceIds: [],
    }
  }

  return [...matter.events].sort((a, b) => {
    const dateDifference = b.date.localeCompare(a.date)
    if (dateDifference !== 0) return dateDifference
    return b.id.localeCompare(a.id)
  })[0]!
}

export function filterMatters(
  matters: Matter[],
  filters: Partial<FilterState> = emptyFilterState,
  includeAdjacent = false,
): Matter[] {
  const currentFilters = { ...emptyFilterState, ...filters }

  return matters.filter((matter) => {
    if (!includeAdjacent && !isAiActMatter(matter)) return false
    if (currentFilters.regime && currentFilters.regime !== 'all' && matter.regime !== currentFilters.regime) return false
    if (currentFilters.authorityLane && currentFilters.authorityLane !== 'all' && matter.authorityLane !== currentFilters.authorityLane) return false
    if (currentFilters.actionType && currentFilters.actionType !== 'all' && matter.currentActionType !== currentFilters.actionType) return false
    if (currentFilters.actionType === 'investigation' && !isFormalInvestigation(matter)) return false
    if (currentFilters.actionSubtype && currentFilters.actionSubtype !== 'all' && matter.currentActionSubtype !== currentFilters.actionSubtype) return false
    if (currentFilters.actionHistory && currentFilters.actionHistory !== 'all' && !getMatterActionHistory(matter).includes(currentFilters.actionHistory)) return false
    if (currentFilters.status && currentFilters.status !== 'all' && matter.status !== currentFilters.status) return false
    if (currentFilters.memberState && currentFilters.memberState !== 'all' && matter.memberState !== currentFilters.memberState) return false
    if (currentFilters.scope && currentFilters.scope !== 'all' && matter.scope !== currentFilters.scope) return false
    if (currentFilters.evidenceLevel && currentFilters.evidenceLevel !== 'all' && !matter.sources.some((source) => source.evidenceLevel === currentFilters.evidenceLevel)) return false
    return matchesSearch(matter, currentFilters.search)
  })
}

export function getOverviewMetrics(matters: Matter[]): OverviewMetrics {
  const aiActMatters = matters.filter(isAiActMatter)

  return {
    total: aiActMatters.length,
    investigations: aiActMatters.filter((matter) => isFormalInvestigation(matter) && ['open', 'ongoing'].includes(matter.status)).length,
    remediation: aiActMatters.filter((matter) => matter.currentActionType === 'remediation' && ['ongoing', 'follow-up'].includes(matter.status)).length,
    penalties: aiActMatters.filter((matter) => matter.currentActionType === 'penalty' && matter.status === 'concluded').length,
    guidance: aiActMatters.filter((matter) => matter.currentActionType === 'guidance' && matter.status === 'published').length,
  }
}

export function getAuthorityCounts(matters: Matter[], authorities: AuthorityProfile[]): AuthorityCount[] {
  const counts = new Map<string, number>()
  for (const authority of authorities) counts.set(authority.id, 0)
  for (const matter of matters.filter(isAiActMatter)) {
    counts.set(matter.primaryAuthorityId, (counts.get(matter.primaryAuthorityId) ?? 0) + 1)
  }

  return authorities.map((authority) => ({
    authorityId: authority.id,
    authorityName: authority.name,
    country: authority.country,
    lane: authority.lane,
    matterCount: counts.get(authority.id) ?? 0,
    isSinglePointOfContact: authority.isSinglePointOfContact,
    designationPending: authority.designationPending,
    source: authority.source,
    coverage: authority.coverage,
  }))
}

export function sortMatters(matters: Matter[], sort: MatterSort = { key: 'date', direction: 'desc' }): Matter[] {
  const direction = sort.direction === 'asc' ? 1 : -1

  return [...matters].sort((a, b) => {
    let comparison = 0
    if (sort.key === 'title') comparison = a.title.localeCompare(b.title)
    if (sort.key === 'authority') comparison = a.authorityName.localeCompare(b.authorityName)
    if (sort.key === 'date') comparison = getLatestEvent(a).date.localeCompare(getLatestEvent(b).date)
    if (comparison === 0) comparison = a.id.localeCompare(b.id)
    return comparison * direction
  })
}
