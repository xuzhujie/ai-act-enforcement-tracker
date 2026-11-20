import { fireEvent, render, screen, within } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import AuthoritiesPage from './AuthoritiesPage'
import { authorities, seedMatters } from '../data/seed'

describe('AuthoritiesPage', () => {
  it('makes the national case-coverage limitation explicit', () => {
    render(<AuthoritiesPage matters={seedMatters} authorities={authorities} />)

    expect(screen.getByText(/当前没有公开可核验的成员国个案调查、整改或处罚/)).toBeTruthy()
    expect(screen.getAllByText(/目录级覆盖/).length).toBeGreaterThan(0)

    const nationalSummary = screen.getByRole('heading', { name: 'Member State market surveillance authorities' }).parentElement!
    expect(within(nationalSummary).getByText('2')).toBeTruthy()
  })

  it('offers authority-scoped navigation into the matter ledger', () => {
    const onSelectAuthority = vi.fn()
    render(<AuthoritiesPage matters={seedMatters} authorities={authorities} onSelectAuthority={onSelectAuthority} />)

    fireEvent.click(screen.getByRole('button', { name: /按 Germany 的记录筛选/ }))

    expect(onSelectAuthority).toHaveBeenCalledWith('msa-de')
  })
})
