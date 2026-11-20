import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import MatterTable from './MatterTable'
import { aiActMatters } from '../data/seed'

describe('MatterTable', () => {
  it('renders an explicit empty state when no matter matches', () => {
    render(<MatterTable matters={[]} onSelect={vi.fn()} />)

    expect(screen.getByText('没有匹配的事项')).toBeTruthy()
    expect(screen.getByText('清除筛选或放宽搜索条件后再试。')).toBeTruthy()
  })

  it('exposes a keyboard-selectable matter row', () => {
    const onSelect = vi.fn()
    render(<MatterTable matters={[aiActMatters[0]]} onSelect={onSelect} />)

    const row = screen.getByRole('button', { name: /Governance & enforcement architecture/ })
    expect(row).toBeTruthy()
    row.click()
    expect(onSelect).toHaveBeenCalledWith(aiActMatters[0].id)
  })

  it('exposes accessible sort controls for date, title, and authority', () => {
    const onSortChange = vi.fn()
    render(<MatterTable matters={[aiActMatters[0]]} onSelect={vi.fn()} onSortChange={onSortChange} />)

    fireEvent.click(screen.getByRole('button', { name: '按事项名称排序' }))
    expect(onSortChange).toHaveBeenCalledWith({ key: 'title', direction: 'asc' })
  })
})
