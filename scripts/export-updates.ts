// 导出最近更新的执法事项为 public/data/updates.json，
// 供九号舆情工作台（妙搭应用）通过 raw.githubusercontent.com 机读消费。
import { mkdirSync, writeFileSync } from 'node:fs'
import { aiActMatters, VERIFIED_ON } from '../src/data/seed'

const ITEM_LIMIT = 8
const SUMMARY_LIMIT = 200

const items = aiActMatters
  .slice()
  .sort((left, right) => (right.lastUpdatedAt ?? '').localeCompare(left.lastUpdatedAt ?? ''))
  .slice(0, ITEM_LIMIT)
  .map((matter) => ({
    title: matter.title,
    link: matter.sources?.[0]?.url ?? '',
    date: matter.lastUpdatedAt ?? VERIFIED_ON,
    summary: (matter.summary ?? '').slice(0, SUMMARY_LIMIT),
  }))

const payload = {
  updated_at: new Date().toISOString().slice(0, 10),
  source: 'ai-act-enforcement-tracker src/data/seed.ts',
  items,
}

mkdirSync('public/data', { recursive: true })
writeFileSync('public/data/updates.json', JSON.stringify(payload, null, 2) + '\n')
console.log(`exported ${items.length} items to public/data/updates.json`)
