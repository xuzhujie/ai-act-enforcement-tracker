import type { Matter, MatterSort, SortKey } from '../types'
import { getLatestEvent, sortMatters } from '../lib/filters'
import Badge from './Badge'
import Icon from './icons'

type MatterTableProps = {
  matters: Matter[]
  onSelect: (matterId: string) => void
  sort?: MatterSort
  onSortChange?: (sort: MatterSort) => void
}

const sortLabels: Record<SortKey, string> = { date: '最新日期', title: '事项名称', authority: '监管机关' }

export default function MatterTable({ matters, onSelect, sort = { key: 'date', direction: 'desc' }, onSortChange }: MatterTableProps) {
  if (matters.length === 0) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon"><Icon name="search" size={22} /></div>
        <h2>没有匹配的事项</h2>
        <p>清除筛选或放宽搜索条件后再试。</p>
      </div>
    )
  }

  return (
    <div className="table-scroll">
      <table className="matter-table full-matter-table">
        <caption className="sr-only">AI Act 事项台账</caption>
        <thead>
          <tr>
            <th scope="col" aria-sort={sort.key === 'date' ? sort.direction === 'asc' ? 'ascending' : 'descending' : 'none'}><button className="sort-button" type="button" aria-label={`按${sortLabels.date}排序`} onClick={() => onSortChange?.({ key: 'date', direction: sort.key === 'date' && sort.direction === 'asc' ? 'desc' : 'asc' })}>最新日期</button></th>
            <th scope="col" aria-sort={sort.key === 'title' ? sort.direction === 'asc' ? 'ascending' : 'descending' : 'none'}><button className="sort-button" type="button" aria-label={`按${sortLabels.title}排序`} onClick={() => onSortChange?.({ key: 'title', direction: sort.key === 'title' && sort.direction === 'asc' ? 'desc' : 'asc' })}>事项</button></th>
            <th scope="col" aria-sort={sort.key === 'authority' ? sort.direction === 'asc' ? 'ascending' : 'descending' : 'none'}><button className="sort-button" type="button" aria-label={`按${sortLabels.authority}排序`} onClick={() => onSortChange?.({ key: 'authority', direction: sort.key === 'authority' && sort.direction === 'asc' ? 'desc' : 'asc' })}>监管机关</button></th>
            <th scope="col">动作</th>
            <th scope="col">状态</th>
            <th scope="col">法律基础</th>
            <th scope="col">来源</th>
          </tr>
        </thead>
        <tbody>
          {sortMatters(matters, sort).map((matter) => {
            const latestEvent = getLatestEvent(matter)
            const isAdjacent = matter.regime !== 'ai-act'
            return (
              <tr className={isAdjacent ? 'adjacent-row' : undefined} key={matter.id}>
                <td><span className="date-stack"><time dateTime={latestEvent.date}>{latestEvent.date}</time>{latestEvent.isTrackerCapture && <span className="date-basis">tracker capture</span>}</span></td>
                <td>
                  <button className="matter-link matter-title-cell" type="button" onClick={() => onSelect(matter.id)}>
                    <strong>{matter.shortTitle}</strong>
                    <span>{matter.subject}</span>
                    {isAdjacent && <Badge kind="regime" value={matter.regime} compact />}
                  </button>
                </td>
                <td><span className="authority-cell">{matter.authorityName}</span></td>
                <td><Badge kind="action" value={matter.actionType} compact /></td>
                <td><Badge kind="status" value={matter.status} compact /></td>
                <td><span className="legal-basis-cell">{matter.legalBasis.join(' · ')}</span></td>
                <td><a className="source-link" href={matter.sources[0]?.url} target="_blank" rel="noreferrer">查看 <Icon name="external-link" size={13} /></a></td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
