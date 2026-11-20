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
})
