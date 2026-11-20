import rawSources from './source-registry.json'
import type { Source } from '../types'

export const sourceRegistry = rawSources as Source[]

const sourcesById = new Map(sourceRegistry.map((source) => [source.id, source]))

export function getSource(id: string): Source {
  const source = sourcesById.get(id)
  if (!source) throw new Error(`Unknown source id: ${id}`)
  return source
}
