import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import AuthoritiesPage from './AuthoritiesPage'
import { authorities, seedMatters } from '../data/seed'

describe('AuthoritiesPage', () => {
  it('makes the national case-coverage limitation explicit', () => {
    render(<AuthoritiesPage matters={seedMatters} authorities={authorities} />)

    expect(screen.getByText(/当前没有公开可核验的成员国个案调查、整改或处罚/)).toBeTruthy()

    const nationalSummary = screen.getByRole('heading', { name: 'Member State market surveillance authorities' }).parentElement!
    expect(within(nationalSummary).getByText('2')).toBeTruthy()
  })
})
