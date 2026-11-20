import type { AuthorityLane, ActionType, FilterState, MatterStatus } from '../types'
import Icon from './icons'

type FilterBarProps = {
  filters: FilterState
  includeAdjacent: boolean
  memberStates: string[]
  onChange: (filters: FilterState) => void
  onClear: () => void
}

const laneOptions: Array<{ value: AuthorityLane | 'all'; label: string }> = [
  { value: 'all', label: '全部监管轨道' },
  { value: 'ai-office', label: 'AI Office' },
  { value: 'member-state-msa', label: '成员国市场监管' },
  { value: 'edps', label: 'EDPS / EU 机构' },
]

const actionOptions: Array<{ value: ActionType | 'all'; label: string }> = [
  { value: 'all', label: '全部动作' },
  { value: 'investigation', label: '正式调查' },
  { value: 'remediation', label: '整改 / 纠正措施' },
  { value: 'penalty', label: '处罚 / 决定' },
  { value: 'guidance', label: '指南 / 实施' },
]

const statusOptions: Array<{ value: MatterStatus | 'all'; label: string }> = [
  { value: 'all', label: '全部状态' },
  { value: 'open', label: '开放' },
  { value: 'ongoing', label: '进行中' },
  { value: 'follow-up', label: '跟进中' },
  { value: 'concluded', label: '已结案' },
  { value: 'published', label: '已发布' },
]

function hasActiveFilters(filters: FilterState): boolean {
  return Boolean(filters.search || filters.authorityLane !== 'all' || filters.actionType !== 'all' || filters.status !== 'all' || filters.memberState !== 'all' || filters.regime !== 'all')
}

export default function FilterBar({ filters, includeAdjacent, memberStates, onChange, onClear }: FilterBarProps) {
  const update = <Key extends keyof FilterState>(key: Key, value: FilterState[Key]) => onChange({ ...filters, [key]: value })

  return (
    <div className="filter-bar">
      <div className="filter-bar-main">
        <label className="filter-search">
          <Icon name="search" size={16} />
          <span className="sr-only">Search matters, authorities, sources</span>
          <input type="search" aria-label="Search matters, authorities, sources" placeholder="搜索事项、机关、法律基础…" value={filters.search} onChange={(event) => update('search', event.target.value)} />
        </label>
        <label className="select-field">
          <span className="sr-only">监管轨道</span>
          <select value={filters.authorityLane ?? 'all'} onChange={(event) => update('authorityLane', event.target.value as FilterState['authorityLane'])}>
            {laneOptions.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
          </select>
        </label>
        <label className="select-field">
          <span className="sr-only">动作类型</span>
          <select value={filters.actionType ?? 'all'} onChange={(event) => update('actionType', event.target.value as FilterState['actionType'])}>
            {actionOptions.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
          </select>
        </label>
        <label className="select-field">
          <span className="sr-only">状态</span>
          <select value={filters.status ?? 'all'} onChange={(event) => update('status', event.target.value as FilterState['status'])}>
            {statusOptions.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
          </select>
        </label>
        <label className="select-field">
          <span className="sr-only">成员国</span>
          <select value={filters.memberState ?? 'all'} onChange={(event) => update('memberState', event.target.value)}>
            <option value="all">全部成员国</option>
            {memberStates.map((memberState) => <option value={memberState} key={memberState}>{memberState}</option>)}
          </select>
        </label>
        {includeAdjacent && (
          <label className="select-field">
            <span className="sr-only">监管制度</span>
            <select value={filters.regime ?? 'all'} onChange={(event) => update('regime', event.target.value as FilterState['regime'])}>
              <option value="all">全部制度</option>
              <option value="ai-act">AI Act</option>
              <option value="gdpr">GDPR</option>
              <option value="consumer-protection">消费者保护</option>
              <option value="dma">DMA</option>
              <option value="dsa">DSA</option>
              <option value="other">其他制度</option>
            </select>
          </label>
        )}
      </div>
      <div className="filter-summary">
        {includeAdjacent && <span className="adjacent-note"><Icon name="layers" size={13} /> 相邻制度可见，但不计入 AI Act KPI</span>}
        {hasActiveFilters(filters) && <button className="clear-filters" type="button" onClick={onClear}><Icon name="close" size={13} /> 清除筛选</button>}
      </div>
    </div>
  )
}
