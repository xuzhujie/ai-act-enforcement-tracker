import { useState } from 'react'
import type { FilterState, Matter, MatterSort } from '../types'
import FilterBar from '../components/FilterBar'
import MatterTable from '../components/MatterTable'
import Icon from '../components/icons'
import { downloadMattersCsv } from '../lib/csv'

type MattersPageProps = {
  matters: Matter[]
  filters: FilterState
  includeAdjacent: boolean
  memberStates: string[]
  onFiltersChange: (filters: FilterState) => void
  onClearFilters: () => void
  onSelectMatter: (matterId: string) => void
}

export default function MattersPage({ matters, filters, includeAdjacent, memberStates, onFiltersChange, onClearFilters, onSelectMatter }: MattersPageProps) {
  const [sort, setSort] = useState<MatterSort>({ key: 'date', direction: 'desc' })

  return (
    <div className="page-stack matters-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">AI ACT WORKBENCH / LEDGER</p>
          <h1>事项台账</h1>
          <p className="page-description">一条 Matter 是一条主线；调查、整改、处罚和指南按事件与当前动作分开记录。</p>
        </div>
        <div className="data-cutoff">当前显示 <strong>{matters.length}</strong> 条</div>
      </div>
      <FilterBar filters={filters} includeAdjacent={includeAdjacent} memberStates={memberStates} onChange={onFiltersChange} onClear={onClearFilters} />
      <section className="panel matters-panel">
        <div className="panel-heading">
          <div><h2>全部事项</h2><p>{includeAdjacent ? '相邻制度记录以灰色边界保留，不进入 AI Act KPI。' : '默认只显示 AI Act 记录。'}</p></div>
          <div className="panel-heading-actions"><span className="table-count">{matters.length} 条</span><button className="quiet-button" type="button" onClick={() => downloadMattersCsv(matters)}><Icon name="download" size={15} /> 导出 CSV</button></div>
        </div>
        <MatterTable matters={matters} onSelect={onSelectMatter} sort={sort} onSortChange={setSort} />
      </section>
    </div>
  )
}
