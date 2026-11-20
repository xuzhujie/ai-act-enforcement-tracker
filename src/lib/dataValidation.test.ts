import { describe, expect, it } from 'vitest'
import { aiActMatters, authorities } from '../data/seed'
import type { Matter, Source, SourceRefreshSnapshot } from '../types'
import { getSourceHealth, validateTrackerData } from './dataValidation'

const source: Source = {
  id: 'source-test',
  title: 'Test source',
  url: 'https://example.com/source',
  publisher: 'Test publisher',
  evidenceLevel: 'authority-page',
  refreshIntervalDays: 14,
}

const baseMatter: Matter = {
  id: 'matter-test',
  title: 'Test matter',
  shortTitle: 'Test matter',
  regime: 'ai-act',
  authorityLane: 'ai-office',
  authorityName: 'European Commission · AI Office',
  primaryAuthorityId: 'ai-office',
  currentActionType: 'guidance',
  currentActionSubtype: 'guidance',
  status: 'published',
  subject: 'Test subject',
  scope: 'governance',
  legalBasis: ['AI Act'],
  summary: 'Test summary',
  inclusionNote: 'Official AI Act source.',
  firstPublishedAt: '2026-11-20',
  lastUpdatedAt: '2026-11-20',
  lastVerifiedAt: '2026-11-20',
  events: [],
  sources: [source],
}

describe('validateTrackerData', () => {
  it('accepts the source-backed seed data', () => {
    expect(validateTrackerData(aiActMatters, authorities).filter((issue) => issue.severity === 'error')).toEqual([])
  })

  it('flags duplicate ids, unsafe URLs, missing exclusion reasons, and unknown supporting authorities', () => {
    const adjacent = { ...baseMatter, id: 'matter-adjacent', regime: 'dma' as const, inclusionNote: '', sources: [{ ...source, id: 'source-test', url: 'http://unsafe.example.com' }], exclusionReason: undefined, supportingAuthorities: ['missing-authority'] }
    const issues = validateTrackerData([baseMatter, adjacent], authorities, [source, ...adjacent.sources])

    expect(issues.map((issue) => issue.code)).toEqual(expect.arrayContaining([
      'duplicate-source-id',
      'source-url-not-https',
      'missing-exclusion-reason',
      'unknown-supporting-authority',
    ]))
  })

  it('flags broken authority and event evidence joins, invalid event dates, missing citations, and incomplete snapshots', () => {
    const matter = {
      ...baseMatter,
      primaryAuthorityId: 'missing-authority',
      events: [{
        id: 'event-invalid',
        date: 'not-a-date',
        label: 'Published event',
        detail: 'Event detail',
        actionType: 'guidance' as const,
        actionSubtype: 'guidance' as const,
        sourceIds: ['missing-source'],
        isTrackerCapture: false,
      }],
    }
    const issues = validateTrackerData([matter], authorities, [source], { generatedAt: '2026-11-20T00:00:00Z', records: [] })

    expect(issues.map((issue) => issue.code)).toEqual(expect.arrayContaining([
      'unknown-primary-authority',
      'invalid-event-date',
      'unknown-event-source',
      'missing-event-citation',
      'missing-snapshot-record',
    ]))
  })
})

describe('getSourceHealth', () => {
  it('distinguishes fresh, stale, error, and unverified source records', () => {
    const now = new Date('2026-11-20T00:00:00Z')
    const snapshot: SourceRefreshSnapshot = {
      generatedAt: '2026-11-20T00:00:00Z',
      records: [
        { sourceId: 'fresh', checkedAt: '2026-11-19T00:00:00Z', ok: true, httpStatus: 200 },
        { sourceId: 'stale', checkedAt: '2026-10-01T00:00:00Z', ok: true, httpStatus: 200 },
        { sourceId: 'error', checkedAt: '2026-11-19T00:00:00Z', ok: false, httpStatus: 503, error: 'unavailable' },
      ],
    }

    expect(getSourceHealth({ ...source, id: 'fresh' }, snapshot.records[0], now)).toBe('fresh')
    expect(getSourceHealth({ ...source, id: 'stale' }, snapshot.records[1], now)).toBe('stale')
    expect(getSourceHealth({ ...source, id: 'error' }, snapshot.records[2], now)).toBe('error')
    expect(getSourceHealth(source, undefined, now)).toBe('unverified')
  })
})
