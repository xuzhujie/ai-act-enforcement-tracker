import { describe, expect, it } from 'vitest'
import { aiActMatters, excludedMatters } from '../data/seed'
import { getReviewableMatters, validateEditorialReview } from './editorialReview'

describe('editorial review gate', () => {
  it('returns only verified matters for KPI views', () => {
    const matters = [
      { ...aiActMatters[0], id: 'verified-matter' },
      { ...excludedMatters[0], id: 'pending-matter' },
    ]
    const review = {
      'verified-matter': { status: 'verified' as const, reviewedAt: '2026-11-20', reviewer: 'editor', note: 'Official source checked.' },
      'pending-matter': { status: 'needs-review' as const, reviewedAt: '2026-11-20', reviewer: 'editor', note: 'Awaiting case-level evidence.' },
    }

    expect(getReviewableMatters(matters, review).map((matter) => matter.id)).toEqual(['verified-matter'])
  })

  it('flags missing or invalid review records', () => {
    const issues = validateEditorialReview(
      [{ ...aiActMatters[0], id: 'missing-review' }],
      { unknown: { status: 'verified', reviewedAt: '2026-11-20', reviewer: 'editor', note: 'Unknown matter.' } },
    )

    expect(issues.map((issue) => issue.code)).toEqual(expect.arrayContaining(['missing-editorial-review', 'unknown-editorial-review']))
  })
})
