import { spawn } from 'node:child_process'

const port = Number(process.env.SMOKE_PORT ?? 4173)
const baseUrl = `http://127.0.0.1:${port}`
const server = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', String(port)], {
  stdio: ['ignore', 'pipe', 'pipe'],
})

function sleep(delay) {
  return new Promise((resolve) => setTimeout(resolve, delay))
}

async function fetchWithRetry(url, attempts = 30) {
  let lastError
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(url)
      if (response.ok) return response
      lastError = new Error(`${url} returned HTTP ${response.status}`)
    } catch (error) {
      lastError = error
    }
    await sleep(200)
  }
  throw lastError ?? new Error(`Unable to fetch ${url}`)
}

try {
  const response = await fetchWithRetry(`${baseUrl}/`)
  const html = await response.text()
  if (!html.includes('<div id="root"></div>')) throw new Error('Built page is missing the React root')
  const assetMatch = html.match(/<script[^>]+src="([^"]+)"/)
  if (!assetMatch) throw new Error('Built page is missing its module script')
  const assetResponse = await fetchWithRetry(new URL(assetMatch[1], `${baseUrl}/`))
  if (!assetResponse.headers.get('content-type')?.includes('javascript')) throw new Error('Built module asset is not served as JavaScript')
  console.log(`Smoke test passed: ${baseUrl}/ and ${assetMatch[1]}`)
} finally {
  server.kill('SIGTERM')
}
