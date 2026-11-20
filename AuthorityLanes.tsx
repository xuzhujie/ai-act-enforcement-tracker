import type { AuthorityProfile, Matter, ActionType } from '../types'
import { getLatestEvent, sortMatters } from '../lib/filters'
import Badge from './Badge'
import Icon from './icons'

type AuthorityLanesProps = {
  matters: Matter[]
  authorities: AuthorityProfile[]
  onSelectMatter: (matterId: string) => void
  hasActiveFilters?: boolean
}

const laneDefinitions = [
  {
    lane: 'ai-office' as const,
    title: 'European Commission · AI Office',
    description: 'GPAI、系统性风险及 AI Office 直接权限下的实施与监督。',
  },
  {
    lane: 'member-state-msa' as const,
    title: 'Member State market surveillance',
    description: '成员国市场监管机关对投放欧盟市场的 AI 系统进行市场监督。',
  },
]

const actionTypes: ActionType[] = ['investigation', 'remediation', 'penalty', 'guidance']

export default function AuthorityLanes({ matters, authorities, onSelectMatter, hasActiveFilters = false }: AuthorityLanesProps) {
  const edpsMatters = matters.filter((matter) => matter.authorityLane === 'edps')

  return (
    <div className="authority-lanes">
      {laneDefinitions.map((lane) => {
        const laneMatters = matters.filter((matter) => matter.authorityLane === lane.lane)
        const recentMatters = sortMatters(laneMatters).slice(0, 2)
        const authority = authorities.find((candidate) => candidate.lane === lane.lane && candidate.country === 'EU')

        return (
          <section className="lane-panel" key={lane.lane}>
            <div className="section-rule" aria-hidden="true" />
            <div className="lane-heading">
              <div>
                <h2>{lane.title}</h2>
                <p>{authority?.description ?? lane.description}</p>
              </div>
              <span className="lane-count">{laneMatters.length} 条</span>
            </div>
            <div className="lane-metrics">
              {actionTypes.map((actionType) => (
                <div className="lane-metric" key={actionType}>
                  <span>{actionType === 'investigation' ? '调查' : actionType === 'remediation' ? '整改' : actionType === 'penalty' ? '处罚 / 决定' : '指南'}</span>
                  <strong>{laneMatters.filter((matter) => matter.actionType === actionType).length}</strong>
                </div>
              ))}
            </div>
            {recentMatters.length > 0 ? (
              <div className="lane-recent">
                {recentMatters.map((matter) => (
                  <button className="lane-row" type="button" key={matter.id} onClick={() => onSelectMatter(matter.id)}>
                    <span className="lane-row-title">{matter.shortTitle}</span>
                    <Badge kind="action" value={matter.actionType} compact />
                    <span className="lane-row-date">{getLatestEvent(matter).date}</span>
                    <Icon name="arrow-right" size={15} />
                  </button>
                ))}
              </div>
            ) : (
              <div className="empty-inline">{hasActiveFilters ? '没有匹配事项。' : '当前种子集没有已发布事项。'}</div>
            )}
          </section>
        )
      })}
      {edpsMatters.length > 0 && (
        <section className="edps-context-row">
          <Icon name="shield" size={17} />
          <span><strong>EDPS · EU institutions</strong> 作为独立监督场景展示，不计入成员国泳道。</span>
          <span className="lane-count">{edpsMatters.length} 条</span>
        </section>
      )}
    </div>
  )
}
