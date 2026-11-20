import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import MatterDrawer from './MatterDrawer'
import { aiActMatters, authorities } from '../data/seed'

describe('MatterDrawer', () => {
  it('shows matter boundaries, timeline, evidence, and sources', () => {
    render(<MatterDrawer matter={aiActMatters[0]} authorities={authorities} onClose={vi.fn()} />)

    expect(screen.getByRole('dialog', { name: aiActMatters[0].title })).toBeTruthy()
    expect(screen.getByText('收录理由')).toBeTruthy()
    expect(screen.getByText(aiActMatters[0].inclusionNote)).toBeTruthy()
    expect(screen.getByText('最后核验')).toBeTruthy()
    expect(screen.getByText(aiActMatters[0].sources[0].title)).toBeTruthy()
    expect(screen.getByText('Guidance captured')).toBeTruthy()
  })

  it('shows supporting authorities and restores focus while trapping the drawer', () => {
    const opener = document.createElement('button')
    opener.textContent = 'Open matter'
    document.body.appendChild(opener)
    opener.focus()
    const close = vi.fn()
    const { rerender } = render(
      <MatterDrawer
        matter={{ ...aiActMatters[0], supportingAuthorities: ['member-state-msas'] }}
        authorities={authorities}
        onClose={close}
      />,
    )

    expect(screen.getByText('Member State market surveillance authorities')).toBeTruthy()
    const dialog = screen.getByRole('dialog')
    const closeButton = screen.getByRole('button', { name: 'Close matter details' })
    const focusable = dialog.querySelectorAll<HTMLElement>('button, a[href]')
    focusable[focusable.length - 1].focus()
    fireEvent.keyDown(document, { key: 'Tab' })
    expect(document.activeElement).toBe(closeButton)

    rerender(<MatterDrawer matter={null} authorities={authorities} onClose={close} />)
    expect(document.activeElement).toBe(opener)
    opener.remove()
  })
})
