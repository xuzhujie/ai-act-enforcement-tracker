import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import AboutDialog from './AboutDialog'

describe('AboutDialog', () => {
  it('explains the tracker boundary and closes', () => {
    const onClose = vi.fn()
    render(<AboutDialog open onClose={onClose} />)

    expect(screen.getByRole('dialog', { name: 'About AI Act tracker' })).toBeTruthy()
    expect(screen.getByText(/GDPR、消费者保护、DMA 和 DSA/)).toBeTruthy()
    fireEvent.click(screen.getByRole('button', { name: 'Close about' }))
    expect(onClose).toHaveBeenCalledOnce()
  })
})
