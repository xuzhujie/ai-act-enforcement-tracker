import rawEditorialReview from '../data/editorial-review.json'
import type { DataValidationIssue, EditorialReviewRecord, Matter, ReviewStatus } from '../types'

export type EditorialReviewRegistry = Record<string, EditorialReviewRecord>

export const editorialReview = rawEditorialReview as EditorialReviewRegistry

export function getReviewStatus(matterId: string, review: EditorialReviewRegistry = editorialReview): ReviewStatus {
  return review[matterId]?.status ?? 'needs-review'
}

export function getReviewableMatters(matters: Matter[], review: EditorialReviewRegistry = editorialReview): Matter[] {
  return matters.filter((matter) => getReviewStatus(matter.id, review) === 'verified')
}

export function getReviewSummary(matters: Matter[], review: EditorialReviewRegistry = editorialReview) {
  const statuses = matters.map((matter) => getReviewStatus(matter.id, review))
  return {
    total: matters.length,
    verified: statuses.filter((status) => status === 'verified').length,
    needsReview: statuses.filter((status) => status === 'needs-review').length,
    rejected: statuses.filter((status) => status === 'rejected').length,
  }
}

function issue(code: string, path: string, message: string): DataValidationIssue {
  return { code, path, message, severity: 'error' }
}

export function validateEditorialReview(matters: Matter[], review: EditorialReviewRegistry): DataValidationIssue[] {
  const issues: DataValidationIssue[] = []
  const matterIds = new Set(matters.map((matter) => matter.id))

  for (const matter of matters) {
    const entry = review[matter.id]
    if (!entry) {
      issues.push(issue('missing-editorial-review', `review.${matter.id}`, `Matter has no editorial review record: ${matter.id}`))
      continue
    }
    if (!['verified', 'needs-review', 'rejected'].includes(entry.status)) issues.push(issue('invalid-editorial-status', `review.${matter.id}.status`, `Invalid editorial review status: ${entry.status}`))
    if (!entry.reviewedAt || !/^\d{4}-\d{2}-\d{2}/.test(entry.reviewedAt)) issues.push(issue('invalid-editorial-date', `review.${matter.id}.reviewedAt`, `Invalid editorial review date: ${entry.reviewedAt}`))
    if (!entry.reviewer.trim()) issues.push(issue('missing-editorial-reviewer', `review.${matter.id}.reviewer`, 'Editorial review must name a reviewer'))
    if (!entry.note.trim()) issues.push(issue('missing-editorial-note', `review.${matter.id}.note`, 'Editorial review must retain a review note'))
  }

  for (const matterId of Object.keys(review)) {
    if (!matterIds.has(matterId)) issues.push(issue('unknown-editorial-review', `review.${matterId}`, `Editorial review references an unknown matter: ${matterId}`))
  }

  return issues
}
