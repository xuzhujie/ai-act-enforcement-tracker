import { describe, expect, it } from 'vitest'
import { aiActMatters } from '../data/seed'
import { mattersToCsv } from './csv'

describe('mattersToCsv', () => {
  it('escapes commas, quotes, newlines, and preserves UTF-8 with a BOM', () => {
    const csv = mattersToCsv([{ ...aiActMatters[0], subject: 'A, B "quoted"\nline' }])

    expect(csv.startsWith('\ufeff')).toBe(true)
    expect(csv).toContain('Matter ID,Regime,Title')
    expect(csv).toContain('"A, B ""quoted""\nline"')
  })

  it('exports current action, history, and latest event evidence', () => {
    const csv = mattersToCsv([aiActMatters[2]])

    expect(csv).toContain('Current action subtype')
    expect(csv).toContain('information-request')
    expect(csv).toContain('event-frontier-rfi-sent')
    expect(csv).toContain('source-ai-scientific-panel')
  })
})
