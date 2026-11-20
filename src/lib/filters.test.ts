import { describe, expect, it } from 'vitest'
import {
  filterMatters,
  getMatterActionHistory,
  getAuthorityCounts,
  getLatestEvent,
  getOverviewMetrics,
  isFormalInvestigation,
} from './filters'
import type { AuthorityProfile, Matter } from '../types'

const source = {
  id: 'source-test',
  title: 'Official source',
  url: 'https://example.com/official',
  publisher: 'Official publisher',
  evidenceLevel: 'official-announcement' as const,
}

const aiPenaltyWithHistory: Matter = {
  id: 'ai-penalty',
  title: 'AI Act matter with historical stages',
  shortTitle: 'AI Act matter',
  regime: 'ai-act',
  authorityLane: 'ai-office',
  authorityName: 'European Commission · AI Office',
  primaryAuthorityId: 'ai-office',
  currentActionType: 'penalty',
  currentActionSubtype: 'sanction-decision',
  status: 'concluded',
  subject: 'GPAI provider',
  scope: 'gpai',
  legalBasis: ['AI Act Article 101'],
  summary: 'A matter whose current action is a concluded penalty.',
  inclusionNote: 'The official source uses the AI Act as its legal basis.',
  firstPublishedAt: '2026-01-01',
  lastUpdatedAt: '2026-03-01',
  lastVerifiedAt: '2026-03-02',
  events: [
    { id: 'event-investigation', date: '2026-01-01', label: 'Investigation opened', detail: 'Investigation stage', actionType: 'investigation', actionSubtype: 'formal-investigation', sourceIds: ['source-test'] },
    { id: 'event-remediation', date: '2026-02-01', label: 'Corrective measure', detail: 'Remediation stage', actionType: 'remediation', actionSubtype: 'corrective-measure', sourceIds: ['source-test'] },
    { id: 'event-penalty', date: '2026-03-01', label: 'Decision adopted', detail: 'Penalty stage', actionType: 'penalty', actionSubtype: 'sanction-decision', sourceIds: ['source-test'] },
  ],
  sources: [source],
}

const aiRemediation: Matter = {
  ...aiPenaltyWithHistory,
  id: 'ai-remediation',
  title: 'AI Act remediation matter',
  shortTitle: 'Remediation matter',
  currentActionType: 'remediation',
  currentActionSubtype: 'corrective-measure',
  status: 'ongoing',
  events: [{ id: 'event-remediation-current', date: '2026-02-10', label: 'Remediation requested', detail: 'Current remediation', actionType: 'remediation', actionSubtype: 'corrective-measure', sourceIds: ['source-test'] }],
}

const adjacentDsa: Matter = {
  ...aiPenaltyWithHistory,
  id: 'dsa-adjacent',
  title: 'DSA platform investigation mentioning AI',
  shortTitle: 'DSA adjacent matter',
  regime: 'dsa',
  currentActionType: 'investigation',
  currentActionSubtype: 'formal-investigation',
  status: 'ongoing',
  inclusionNote: '',
  exclusionReason: 'The official source is a DSA proceeding, not AI Act enforcement.',
}

const testMatters = [aiPenaltyWithHistory, aiRemediation, adjacentDsa]

describe('AI Act matter query invariants', () => {
  it('does not count an information request as a formal investigation', () => {
    const informationRequest = { ...aiRemediation, id: 'ai-information-request', currentActionType: 'investigation' as const, currentActionSubtype: 'information-request' as const }

    expect(isFormalInvestigation(informationRequest)).toBe(false)
    expect(getOverviewMetrics([informationRequest]).investigations).toBe(0)
    expect(filterMatters([informationRequest], { search: '', actionType: 'investigation' })).toEqual([])
    expect(filterMatters([informationRequest], { search: '', actionSubtype: 'information-request' })).toHaveLength(1)
  })

  it('exposes action history without losing the current action', () => {
    expect(getMatterActionHistory(aiPenaltyWithHistory)).toEqual(['investigation', 'remediation', 'penalty'])
  })

  it('counts_current_action_once', () => {
    const metrics = getOverviewMetrics(testMatters)

    expect(metrics.total).toBe(2)
    expect(metrics.investigations).toBe(0)
    expect(metrics.remediation).toBe(1)
    expect(metrics.penalties).toBe(1)
    expect(metrics.guidance).toBe(0)
  })

  it('excludes_adjacent_regimes_from_ai_act_metrics', () => {
    const metrics = getOverviewMetrics(testMatters)

    expect(metrics.total).not.toBe(3)
    expect(metrics.total).toBe(2)
  })

  it('keeps_overview_ai_act_only_when_adjacent_is_visible', () => {
    const visibleMatters = filterMatters(testMatters, { search: '' }, true)

    expect(visibleMatters.map((matter) => matter.id)).toEqual(['ai-penalty', 'ai-remediation', 'dsa-adjacent'])
    expect(getOverviewMetrics(visibleMatters).total).toBe(2)
  })

  it('does_not_duplicate_supporting_authorities', () => {
    const matter = { ...aiRemediation, primaryAuthorityId: 'authority-a', supportingAuthorities: ['authority-b'] }
    const authorities: AuthorityProfile[] = [
      { id: 'authority-a', name: 'Authority A', country: 'AA', lane: 'member-state-msa', source },
      { id: 'authority-b', name: 'Authority B', country: 'BB', lane: 'member-state-msa', source },
    ]

    const counts = getAuthorityCounts([matter], authorities)

    expect(counts).toEqual([
      expect.objectContaining({ authorityId: 'authority-a', matterCount: 1 }),
      expect.objectContaining({ authorityId: 'authority-b', matterCount: 0 }),
    ])
  })

  it('returns_empty_state_input_for_unmatched_search', () => {
    const visibleMatters = filterMatters(testMatters, { search: 'nothing matches' }, false)

    expect(visibleMatters).toEqual([])
  })

  it('searches event text and can filter by historical action and evidence level', () => {
    expect(filterMatters([aiPenaltyWithHistory], { search: 'Decision adopted' })).toHaveLength(1)
    expect(filterMatters([aiPenaltyWithHistory], { search: '', actionHistory: 'investigation' })).toHaveLength(1)
    expect(filterMatters([aiPenaltyWithHistory], { search: '', evidenceLevel: 'official-announcement' })).toHaveLength(1)
  })

  it('returns_the_latest_event_by_iso_date', () => {
    expect(getLatestEvent(aiPenaltyWithHistory).id).toBe('event-penalty')
  })
})
