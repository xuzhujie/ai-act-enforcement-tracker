import type { ActionSubtype, ActionType, AuthorityLane, EvidenceLevel, FilterState, MatterStatus, Scope } from '../types'
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

const scopeOptions: Array<{ value: Scope | 'all'; label: string }> = [
  { value: 'all', label: '全部范围' },
  { value: 'gpai', label: 'GPAI' },
  { value: 'prohibited-practices', label: '禁止性实践' },
  { value: 'transparency', label: '透明度' },
  { value: 'high-risk', label: '高风险' },
  { value: 'governance', label: '治理 / 机构' },
  { value: 'other', label: '其他范围' },
]

const subtypeOptions: Array<{ value: ActionSubtype | 'all'; label: string }> = [
  { value: 'all', label: '全部动作细分' },
  { value: 'formal-investigation', label: '正式调查' },
  { value: 'information-request', label: '信息请求' },
  { value: 'incident-review', label: '严重事件复核' },
  { value: 'corrective-measure', label: '整改措施' },
  { value: 'sanction-decision', label: '处罚 / 决定' },
  { value: 'guidance', label: '指南 / 实施' },
  { value: 'authority-infrastructure', label: '机关基础设施' },
]

const evidenceOptions: Array<{ value: EvidenceLevel | 'all'; label: string }> = [
  { value: 'all', label: '全部证据等级' },
  { value: 'decision', label: '正式决定' },
  { value: 'official-announcement', label: '官方公告' },
  { value: 'authority-page', label: '主管机关页面' },
  { value: 'secondary', label: '二手来源' },
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
  return Boolean(filters.search || filters.authorityLane !== 'all' || filters.actionType !== 'all' || filters.actionSubtype !== 'all' || filters.actionHistory !== 'all' || filters.status !== 'all' || filters.memberState !== 'all' || filters.regime !== 'all' || filters.scope !== 'all' || filters.evidenceLevel !== 'all')
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
          <span className="sr-only">动作历史</span>
          <select value={filters.actionHistory ?? 'all'} onChange={(event) => update('actionHistory', event.target.value as FilterState['actionHistory'])}>
            <option value="all">历史动作不限</option>
            {actionOptions.slice(1).map((option) => <option value={option.value} key={option.value}>{`曾经历：${option.label}`}</option>)}
          </select>
        </label>
        <label className="select-field">
          <span className="sr-only">动作细分</span>
          <select value={filters.actionSubtype ?? 'all'} onChange={(event) => update('actionSubtype', event.target.value as FilterState['actionSubtype'])}>
            {subtypeOptions.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
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
        <label className="select-field">
          <span className="sr-only">范围</span>
          <select value={filters.scope ?? 'all'} onChange={(event) => update('scope', event.target.value as FilterState['scope'])}>
            {scopeOptions.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
          </select>
        </label>
        <label className="select-field">
          <span className="sr-only">证据等级</span>
          <select value={filters.evidenceLevel ?? 'all'} onChange={(event) => update('evidenceLevel', event.target.value as FilterState['evidenceLevel'])}>
            {evidenceOptions.map((option) => <option value={option.value} key={option.value}>{option.label}</option>)}
          </select>
        </label>
      </div>
      <div className="filter-summary">
        {includeAdjacent && <span className="adjacent-note"><Icon name="layers" size={13} /> 相邻制度可见，但不计入 AI Act KPI</span>}
        {hasActiveFilters(filters) && <button className="clear-filters" type="button" onClick={onClear}><Icon name="close" size={13} /> 清除筛选</button>}
      </div>
    </div>
  )
}
