import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const DEFAULT_MANIFEST = path.join(ROOT, 'src/data/source-registry.json')
const DEFAULT_OUTPUT = path.join(ROOT, 'src/data/source-snapshot.json')
const DEFAULT_RETRIES = 2
const DEFAULT_RETRY_DELAY_MS = 500

export function extractTitle(html) {
  const match = String(html).match(/<title[^>]*>([\s\S]*?)<\/title>/i)
  if (!match) return undefined
  return match[1].replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim() || undefined
}

function hashContent(body) {
  return createHash('sha256').update(body).digest('hex')
}

export function parseArgs(argv) {
  const result = { manifestPath: undefined, outputPath: undefined, fixturePath: undefined, allowFailures: false, timeoutMs: 15000, retries: DEFAULT_RETRIES, retryDelayMs: DEFAULT_RETRY_DELAY_MS }
  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]
    if (arg === '--manifest') result.manifestPath = argv[++index]
    else if (arg === '--output') result.outputPath = argv[++index]
    else if (arg === '--fixture') result.fixturePath = argv[++index]
    else if (arg === '--allow-failures') result.allowFailures = true
    else if (arg === '--timeout-ms') result.timeoutMs = Number(argv[++index])
    else if (arg === '--retries') result.retries = Number(argv[++index])
    else if (arg === '--retry-delay-ms') result.retryDelayMs = Number(argv[++index])
    else if (arg === '--help') result.help = true
    else throw new Error(`Unknown option: ${arg}`)
  }
  return result
}

function normalizeError(error) {
  return error instanceof Error ? error.message : String(error)
}

function isRetryableStatus(status) {
  return status === 429 || status >= 500
}

function parseRetryAfter(value, now) {
  if (!value) return undefined
  const seconds = Number(value)
  if (Number.isFinite(seconds)) return Math.max(0, seconds)
  const timestamp = Date.parse(value)
  if (Number.isNaN(timestamp)) return undefined
  return Math.max(0, Math.ceil((timestamp - now.getTime()) / 1000))
}

export async function refreshSources({
  sources,
  fetchImpl = fetch,
  now = new Date(),
  timeoutMs = 15000,
  retries = DEFAULT_RETRIES,
  retryDelayMs = DEFAULT_RETRY_DELAY_MS,
  sleep = (delay) => new Promise((resolve) => setTimeout(resolve, delay)),
}) {
  const checkedAt = now.toISOString()
  const records = await Promise.all(sources.map(async (source) => {
    let retryAfterSeconds
    for (let attempt = 1; attempt <= retries + 1; attempt += 1) {
      try {
        const response = await fetchImpl(source.url, {
          headers: { accept: 'text/html,application/pdf,*/*', 'user-agent': 'ai-act-tracker-refresh/1.0' },
          signal: typeof AbortSignal !== 'undefined' && typeof AbortSignal.timeout === 'function' ? AbortSignal.timeout(timeoutMs) : undefined,
        })
        const body = await response.text()
        const contentType = response.headers?.get?.('content-type') ?? undefined
        retryAfterSeconds = parseRetryAfter(response.headers?.get?.('retry-after'), now) ?? retryAfterSeconds
        if (!response.ok && isRetryableStatus(response.status) && attempt <= retries) {
          const delay = retryAfterSeconds === undefined ? retryDelayMs * 2 ** (attempt - 1) : retryAfterSeconds * 1000
          await sleep(Math.min(delay, 10000))
          continue
        }
        return {
          sourceId: source.id,
          checkedAt,
          attempts: attempt,
          httpStatus: response.status,
          contentType,
          title: contentType?.includes('html') ? extractTitle(body) : undefined,
          contentHash: hashContent(body),
          ok: Boolean(response.ok),
          ...(response.ok ? {} : { error: `HTTP ${response.status} after ${attempt} attempts` }),
          ...(retryAfterSeconds === undefined ? {} : { retryAfterSeconds }),
        }
      } catch (error) {
        if (attempt <= retries) {
          await sleep(Math.min(retryDelayMs * 2 ** (attempt - 1), 10000))
          continue
        }
        return { sourceId: source.id, checkedAt, attempts: attempt, ok: false, error: normalizeError(error) }
      }
    }
    return { sourceId: source.id, checkedAt, attempts: retries + 1, ok: false, error: 'Refresh exhausted without a response' }
  }))
  return { generatedAt: checkedAt, records }
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'))
}

async function fixtureFetch(fixturePath) {
  const fixture = await readJson(fixturePath)
  return async (url) => {
    const entry = fixture[url]
    if (!entry) throw new Error(`No fixture for ${url}`)
    return {
      ok: entry.status >= 200 && entry.status < 400,
      status: entry.status,
      headers: { get: (name) => entry.headers?.[name.toLowerCase()] ?? entry.contentType ?? 'text/html' },
      text: async () => entry.body ?? '',
    }
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2))
  if (options.help) {
    console.log('Usage: npm run refresh:data -- [--fixture path] [--allow-failures] [--timeout-ms 15000] [--retries 2] [--retry-delay-ms 500]')
    return
  }
  const manifestPath = options.manifestPath ?? DEFAULT_MANIFEST
  const outputPath = options.outputPath ?? DEFAULT_OUTPUT
  const sources = await readJson(manifestPath)
  const fetchImpl = options.fixturePath ? await fixtureFetch(options.fixturePath) : fetch
  const snapshot = await refreshSources({ sources, fetchImpl, timeoutMs: options.timeoutMs, retries: options.retries, retryDelayMs: options.retryDelayMs })
  await writeFile(outputPath, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8')
  const failures = snapshot.records.filter((record) => !record.ok)
  console.log(`Refreshed ${snapshot.records.length} sources; ${failures.length} failed; wrote ${outputPath}`)
  if (failures.length > 0 && !options.allowFailures) process.exitCode = 1
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
}
