import { readFile } from 'node:fs/promises'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const REGISTRY_PATH = path.join(ROOT, 'src/data/source-registry.json')
const SNAPSHOT_PATH = path.join(ROOT, 'src/data/source-snapshot.json')
const EVIDENCE_LEVELS = new Set(['decision', 'official-announcement', 'authority-page', 'secondary'])

function issue(code, pathName, message) {
  return { code, path: pathName, message }
}

function isHttps(url) {
  return typeof url === 'string' && /^https:\/\/[^\s]+$/i.test(url)
}

export function validateRegistryAndSnapshot(registry, snapshot) {
  const issues = []
  const ids = new Set()
  for (const source of registry) {
    if (ids.has(source.id)) issues.push(issue('duplicate-source-id', `registry.${source.id}`, `Duplicate source id: ${source.id}`))
    ids.add(source.id)
    if (!isHttps(source.url)) issues.push(issue('source-url-not-https', `registry.${source.id}.url`, `Source URL must use HTTPS: ${source.url}`))
    if (!EVIDENCE_LEVELS.has(source.evidenceLevel)) issues.push(issue('invalid-evidence-level', `registry.${source.id}.evidenceLevel`, `Invalid evidence level: ${source.evidenceLevel}`))
  }

  const recordIds = new Set()
  for (const record of snapshot.records ?? []) {
    if (recordIds.has(record.sourceId)) issues.push(issue('duplicate-snapshot-source-id', `snapshot.${record.sourceId}`, `Duplicate snapshot source id: ${record.sourceId}`))
    recordIds.add(record.sourceId)
    if (!ids.has(record.sourceId)) issues.push(issue('snapshot-source-not-in-registry', `snapshot.${record.sourceId}`, `Snapshot source is not present in registry: ${record.sourceId}`))
    if (record.checkedAt && Number.isNaN(new Date(record.checkedAt).getTime())) issues.push(issue('invalid-snapshot-date', `snapshot.${record.sourceId}.checkedAt`, `Invalid snapshot date: ${record.checkedAt}`))
    if (record.ok === false && !record.error) issues.push(issue('failed-snapshot-without-error', `snapshot.${record.sourceId}`, 'A failed source snapshot must retain an error message'))
  }
  return issues
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, 'utf8'))
}

async function main() {
  const registry = await readJson(REGISTRY_PATH)
  const snapshot = await readJson(SNAPSHOT_PATH)
  const issues = validateRegistryAndSnapshot(registry, snapshot)
  if (issues.length > 0) {
    for (const item of issues) console.error(`${item.code} at ${item.path}: ${item.message}`)
    process.exitCode = 1
    return
  }
  console.log(`Data validation passed: ${registry.length} sources, ${snapshot.records?.length ?? 0} refresh records.`)
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
}
