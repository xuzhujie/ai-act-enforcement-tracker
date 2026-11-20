import type { ActionType, Matter } from '../types'
import { getLatestEvent } from './filters'

export const TREND_ACTIONS: ActionType[] = ['investigation', 'remediation', 'penalty', 'guidance']

export type TrendBucket = {
  month: string
  total: number
  height: number
  actionCounts: Record<ActionType, number>
}

function addMonths(month: string, offset: number): string {
  const [year, monthNumber] = month.split('-').map(Number)
  const date = new Date(Date.UTC(year, monthNumber - 1 + offset, 1))
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`
}

export function buildTrend(matters: Matter[], bucketCount = 6): TrendBucket[] {
  if (matters.length === 0 || bucketCount <= 0) return []
  const latestMonth = [...matters].map((matter) => getLatestEvent(matter).date.slice(0, 7)).sort().at(-1)!
  const months = Array.from({ length: bucketCount }, (_, index) => addMonths(latestMonth, index - bucketCount + 1))
  const buckets = months.map((month) => {
    const actionCounts = Object.fromEntries(TREND_ACTIONS.map((action) => [action, 0])) as Record<ActionType, number>
    for (const matter of matters) {
      const event = getLatestEvent(matter)
      if (event.date.slice(0, 7) === month) actionCounts[event.actionType] += 1
    }
    return { month, total: Object.values(actionCounts).reduce((sum, count) => sum + count, 0), height: 0, actionCounts }
  })
  const max = Math.max(...buckets.map((bucket) => bucket.total), 1)
  return buckets.map((bucket) => ({ ...bucket, height: bucket.total === 0 ? 8 : Math.max(12, Math.round((bucket.total / max) * 100)) }))
}
