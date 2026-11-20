import { describe, expect, it } from 'vitest'
import { aiActMatters } from '../data/seed'
import { buildTrend } from './trend'

describe('buildTrend', () => {
  it('creates chronological zero-filled monthly buckets across year boundaries', () => {
    const matters = [
      { ...aiActMatters[0], id: 'dec', events: [{ ...aiActMatters[0].events[0], date: '2025-12-10' }] },
      { ...aiActMatters[1], id: 'jan', events: [{ ...aiActMatters[1].events[0], date: '2026-01-05', actionType: 'investigation' as const }] },
      { ...aiActMatters[2], id: 'mar', events: [{ ...aiActMatters[2].events[0], date: '2026-03-05' }] },
    ]

    const buckets = buildTrend(matters, 4)
    expect(buckets.map((bucket) => bucket.month)).toEqual(['2025-12', '2026-01', '2026-02', '2026-03'])
    expect(buckets[2].total).toBe(0)
    expect(buckets[1].actionCounts.investigation).toBe(1)
  })
})
