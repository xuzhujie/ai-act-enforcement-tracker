import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import OverviewPage from './OverviewPage'
import { aiActMatters, authorities, excludedMatters } from '../data/seed'
import { getOverviewMetrics } from '../lib/filters'

describe('OverviewPage', () => {
  it('shows adjacent activity when adjacent regimes are visible without changing AI Act metrics', () => {
    const matters = [aiActMatters[0], excludedMatters[1]]
    render(<OverviewPage matters={matters} authorities={authorities} metrics={getOverviewMetrics(matters)} onSelectMatter={vi.fn()} hasActiveFilters={false} onClearFilters={vi.fn()} />)

    expect(screen.getByText('DSA enforcement framework')).toBeTruthy()
    expect(screen.getByText('DSA')).toBeTruthy()
    expect(screen.getByText('AI Act 事项总数')).toBeTruthy()
  })

  it('shows a filter-specific empty state for an unmatched overview search', () => {
    render(<OverviewPage matters={[]} authorities={authorities} metrics={getOverviewMetrics([])} onSelectMatter={vi.fn()} hasActiveFilters onClearFilters={vi.fn()} />)

    expect(screen.getByText('没有匹配的最新活动')).toBeTruthy()
    expect(screen.getByRole('button', { name: '清除当前筛选' })).toBeTruthy()
  })
})
