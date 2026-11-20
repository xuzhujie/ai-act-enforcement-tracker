import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import AppShell from './AppShell'

describe('AppShell', () => {
  it('renders accessible navigation, search, and AI Act-only control', () => {
    render(
      <AppShell
        currentPage="overview"
        search=""
        includeAdjacent={false}
        onNavigate={vi.fn()}
        onSearchChange={vi.fn()}
        onIncludeAdjacentChange={vi.fn()}
      >
        <p>Overview content</p>
      </AppShell>,
    )

    expect(screen.getByText('AI Act tracker')).toBeTruthy()
    expect(screen.getByRole('navigation', { name: 'Primary navigation' })).toBeTruthy()
    expect(screen.getByRole('searchbox', { name: 'Search matters, authorities, sources' })).toBeTruthy()
    expect(screen.getByRole('checkbox', { name: 'AI Act only' })).toBeTruthy()
    expect(screen.getByText('Overview content')).toBeTruthy()
  })
})
