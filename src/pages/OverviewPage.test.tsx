import { render, screen, within } from '@testing-library/react'
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

  it('labels latest activity with the latest event action rather than the matter current action', () => {
    const multiStageMatter = {
      ...aiActMatters[0],
      id: 'multi-stage-latest-activity',
      currentActionType: 'penalty' as const,
      currentActionSubtype: 'sanction-decision' as const,
      status: 'concluded' as const,
      events: [{ ...aiActMatters[0].events[0], actionType: 'investigation' as const, actionSubtype: 'formal-investigation' as const, date: '2026-11-20' }],
    }
    render(<OverviewPage matters={[multiStageMatter]} authorities={authorities} metrics={getOverviewMetrics([multiStageMatter])} onSelectMatter={vi.fn()} hasActiveFilters={false} onClearFilters={vi.fn()} />)

    const row = screen.getByRole('row', { name: /multi-stage-latest-activity|Governance & enforcement architecture/ })
    expect(within(row).getByText('正式调查')).toBeTruthy()
  })
})
