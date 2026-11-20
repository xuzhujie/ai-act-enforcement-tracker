import { describe, expect, it } from 'vitest'
import { extractTitle, parseArgs, refreshSources } from './refresh-sources.mjs'
import { validateRegistryAndSnapshot } from './validate-data.mjs'

describe('refresh-sources', () => {
  it('extracts and decodes an HTML title', () => {
    expect(extractTitle('<html><head><title>  Official &amp; source  </title></head></html>')).toBe('Official & source')
  })

  it('retains per-source success and failure records', async () => {
    const sources = [
      { id: 'ok', url: 'https://example.com/ok' },
      { id: 'bad', url: 'https://example.com/bad' },
    ]
    const snapshot = await refreshSources({
      sources,
      now: new Date('2026-11-20T00:00:00Z'),
      retries: 0,
      fetchImpl: async (url) => {
        if (url.endsWith('/bad')) throw new Error('network unavailable')
        return { ok: true, status: 200, headers: { get: () => 'text/html' }, text: async () => '<title>OK page</title>' }
      },
    })

    expect(snapshot.records).toEqual(expect.arrayContaining([
      expect.objectContaining({ sourceId: 'ok', ok: true, httpStatus: 200, title: 'OK page' }),
      expect.objectContaining({ sourceId: 'bad', ok: false, error: 'network unavailable' }),
    ]))
  })

  it('retries transient HTTP failures and records the successful attempt count', async () => {
    let calls = 0
    const waits = []
    const snapshot = await refreshSources({
      sources: [{ id: 'flaky', url: 'https://example.com/flaky' }],
      now: new Date('2026-11-20T00:00:00Z'),
      retries: 2,
      retryDelayMs: 10,
      sleep: async (delay) => waits.push(delay),
      fetchImpl: async () => {
        calls += 1
        if (calls === 1) return { ok: false, status: 429, headers: { get: (name) => name === 'retry-after' ? '0' : 'text/html' }, text: async () => '' }
        return { ok: true, status: 200, headers: { get: () => 'text/html' }, text: async () => '<title>Recovered</title>' }
      },
    })

    expect(calls).toBe(2)
    expect(waits).toEqual([0])
    expect(snapshot.records[0]).toEqual(expect.objectContaining({ sourceId: 'flaky', ok: true, attempts: 2, title: 'Recovered' }))
  })

  it('parses refresh command options', () => {
    expect(parseArgs(['--fixture', 'fixture.json', '--allow-failures', '--timeout-ms', '5000'])).toEqual({
      manifestPath: undefined,
      outputPath: undefined,
      fixturePath: 'fixture.json',
      allowFailures: true,
      timeoutMs: 5000,
      retries: 2,
      retryDelayMs: 500,
    })
  })

  it('rejects duplicate or unsafe registry entries and unknown snapshot sources', () => {
    const issues = validateRegistryAndSnapshot(
      [
        { id: 'duplicate', url: 'https://example.com/one', evidenceLevel: 'authority-page' },
        { id: 'duplicate', url: 'http://example.com/two', evidenceLevel: 'not-valid' },
      ],
      { generatedAt: '2026-11-20T00:00:00Z', records: [{ sourceId: 'missing', ok: true }] },
    )

    expect(issues.map((issue) => issue.code)).toEqual(expect.arrayContaining(['duplicate-source-id', 'source-url-not-https', 'invalid-evidence-level', 'snapshot-source-not-in-registry']))
  })
})
