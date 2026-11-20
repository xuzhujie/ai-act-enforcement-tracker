import type { ActionType, AppPage, AuthorityLane, FilterState, MatterStatus, Regime } from '../types'

export type TrackerUrlState = {
  page: AppPage
  includeAdjacent: boolean
  filters: Required<FilterState>
}

export const DEFAULT_FILTERS: Required<FilterState> = {
  search: '',
  authorityLane: 'all',
  actionType: 'all',
  status: 'all',
  memberState: 'all',
  regime: 'all',
}

const pages: AppPage[] = ['overview', 'matters', 'authorities', 'excluded', 'sources']
const authorityLanes: Array<AuthorityLane | 'all'> = ['all', 'ai-office', 'member-state-msa', 'edps', 'other']
const actionTypes: Array<ActionType | 'all'> = ['all', 'investigation', 'remediation', 'penalty', 'guidance']
const statuses: Array<MatterStatus | 'all'> = ['all', 'open', 'ongoing', 'concluded', 'follow-up', 'published']
const regimes: Array<Regime | 'all'> = ['all', 'ai-act', 'gdpr', 'consumer-protection', 'dma', 'dsa', 'other']

function enumParam<T extends string>(value: string | null, allowed: readonly T[], fallback: T): T {
  return value && allowed.includes(value as T) ? value as T : fallback
}

export function parseTrackerUrl(search: string): TrackerUrlState {
  const params = new URLSearchParams(search.startsWith('?') ? search.slice(1) : search)
  const includeAdjacent = params.get('adjacent') === '1'
  const regime = enumParam(params.get('regime'), regimes, 'all')
  return {
    page: enumParam(params.get('page'), pages, 'overview'),
    includeAdjacent,
    filters: {
      search: params.get('q') ?? '',
      authorityLane: enumParam(params.get('authority'), authorityLanes, 'all'),
      actionType: enumParam(params.get('action'), actionTypes, 'all'),
      status: enumParam(params.get('status'), statuses, 'all'),
      memberState: params.get('member')?.trim() || 'all',
      regime: includeAdjacent ? regime : 'all',
    },
  }
}

export function serializeTrackerUrl(state: TrackerUrlState): string {
  const params = new URLSearchParams()
  if (state.page !== 'overview') params.set('page', state.page)
  if (state.includeAdjacent) params.set('adjacent', '1')
  if (state.filters.search.trim()) params.set('q', state.filters.search.trim())
  if (state.filters.authorityLane !== 'all') params.set('authority', state.filters.authorityLane)
  if (state.filters.actionType !== 'all') params.set('action', state.filters.actionType)
  if (state.filters.status !== 'all') params.set('status', state.filters.status)
  if (state.filters.memberState !== 'all') params.set('member', state.filters.memberState)
  if (state.includeAdjacent && state.filters.regime !== 'all') params.set('regime', state.filters.regime)
  const query = params.toString()
  return query ? `?${query}` : ''
}
