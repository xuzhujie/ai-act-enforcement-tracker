import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import SourcesPage from './SourcesPage'
import { aiActMatters } from '../data/seed'
import type { DataValidationIssue, Source, SourceRefreshSnapshot } from '../types'

const source: Source = {
  id: 'source-health-test',
  title: 'Health test source',
  url: 'https://example.com/health',
  publisher: 'Test publisher',
  evidenceLevel: 'authority-page',
  refreshIntervalDays: 7,
}

const snapshot: SourceRefreshSnapshot = {
  generatedAt: '2026-11-20T00:00:00.000Z',
  records: [{ sourceId: source.id, checkedAt: '2026-11-19T00:00:00.000Z', httpStatus: 200, ok: true }],
}

describe('SourcesPage', () => {
  it('shows source health and data validation state', () => {
    const validationIssues: DataValidationIssue[] = []
    render(<SourcesPage matters={aiActMatters} sources={[source]} snapshot={snapshot} validationIssues={validationIssues} />)

    expect(screen.getByText('Health test source')).toBeTruthy()
    expect(screen.getByText('可用')).toBeTruthy()
    expect(screen.getByText('数据校验通过')).toBeTruthy()
  })

  it('surfaces refresh failures and retry metadata', () => {
    const failedSnapshot: SourceRefreshSnapshot = {
      ...snapshot,
      records: [{ sourceId: source.id, checkedAt: '2026-11-20T00:00:00.000Z', httpStatus: 429, attempts: 3, retryAfterSeconds: 4, ok: false, error: 'HTTP 429 after 3 attempts' }],
    }

    render(<SourcesPage matters={aiActMatters} sources={[source]} snapshot={failedSnapshot} validationIssues={[]} />)

    expect(screen.getByText('来源刷新失败 1 个')).toBeTruthy()
    expect(screen.getByText(/HTTP 429 after 3 attempts/)).toBeTruthy()
    expect(screen.getByText(/重试等待 4 秒/)).toBeTruthy()
  })
})
