import { describe, expect, it } from 'vitest'
import { parseTrackerUrl, serializeTrackerUrl } from './urlState'

describe('tracker URL state', () => {
  it('round-trips page, scope, and non-identity filters', () => {
    const state = {
      page: 'matters' as const,
      includeAdjacent: true,
      filters: { search: 'frontier', authorityLane: 'ai-office' as const, actionType: 'investigation' as const, actionSubtype: 'information-request' as const, actionHistory: 'all' as const, status: 'ongoing' as const, memberState: 'all', regime: 'ai-act' as const, scope: 'gpai' as const, evidenceLevel: 'official-announcement' as const },
    }

    expect(parseTrackerUrl(serializeTrackerUrl(state))).toEqual(state)
  })

  it('falls back safely for invalid enum values', () => {
    expect(parseTrackerUrl('?page=not-a-page&adjacent=wat&action=not-an-action&regime=gdpr')).toEqual({
      page: 'overview',
      includeAdjacent: false,
      filters: { search: '', authorityLane: 'all', actionType: 'all', actionSubtype: 'all', actionHistory: 'all', status: 'all', memberState: 'all', regime: 'all', scope: 'all', evidenceLevel: 'all' },
    })
  })
})
