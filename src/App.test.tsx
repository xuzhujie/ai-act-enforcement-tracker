import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import App from './App'

describe('AI Act tracker app entry', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/')
  })

  it('renders the product name', () => {
    render(<App />)
    expect(screen.getByText('AI Act tracker')).toBeTruthy()
  })

  it('clears an adjacent regime filter when AI Act-only is re-enabled', () => {
    render(<App />)
    const scopeToggle = screen.getByRole('checkbox', { name: 'AI Act only' })
    fireEvent.click(scopeToggle)
    fireEvent.click(screen.getByRole('button', { name: '事项' }))
    fireEvent.change(screen.getByRole('combobox', { name: '监管制度' }), { target: { value: 'dsa' } })
    expect(screen.getByText('DSA enforcement framework')).toBeTruthy()
    fireEvent.click(scopeToggle)

    expect(screen.queryByText('DSA enforcement framework')).toBeNull()
    expect(screen.getByText('AI Office role & tasks')).toBeTruthy()
  })

  it('opens About and navigates from Overview to the matter ledger', () => {
    render(<App />)

    fireEvent.click(screen.getByRole('button', { name: 'About AI Act tracker' }))
    expect(screen.getByRole('dialog', { name: 'About AI Act tracker' })).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Close about' }))
    fireEvent.click(screen.getByRole('button', { name: '查看事项台账' }))
    expect(screen.getByRole('heading', { name: '事项台账' })).toBeTruthy()
  })

  it('restores page and filters from browser history', () => {
    render(<App />)

    window.history.pushState({}, '', '/?page=matters&action=investigation&history=remediation&scope=gpai')
    fireEvent.popState(window)

    expect(screen.getByRole('heading', { name: '事项台账' })).toBeTruthy()
    expect((screen.getByRole('combobox', { name: '动作类型' }) as HTMLSelectElement).value).toBe('investigation')
    expect((screen.getByRole('combobox', { name: '动作历史' }) as HTMLSelectElement).value).toBe('remediation')
    expect((screen.getByRole('combobox', { name: '范围' }) as HTMLSelectElement).value).toBe('gpai')
  })
})
