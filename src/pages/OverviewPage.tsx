import type { AuthorityProfile, Matter, OverviewMetrics } from '../types'
import { getLatestEvent, sortMatters } from '../lib/filters'
import Badge from '../components/Badge'
import AuthorityLanes from '../components/AuthorityLanes'
import Icon from '../components/icons'
import MetricStrip from '../components/MetricStrip'
import { VERIFIED_ON } from '../data/seed'
import { buildTrend, TREND_ACTIONS } from '../lib/trend'

type OverviewPageProps = {
  matters: Matter[]
  authorities: AuthorityProfile[]
  metrics: OverviewMetrics
  onSelectMatter: (matterId: string) => void
  hasActiveFilters?: boolean
  onClearFilters: () => void
  onOpenMatters?: () => void
}

export default function OverviewPage({ matters, authorities, metrics, onSelectMatter, hasActiveFilters = false, onClearFilters, onOpenMatters }: OverviewPageProps) {
  const aiActMatters = matters.filter((matter) => matter.regime === 'ai-act')
  const latestActivity = sortMatters(matters).slice(0, 8)
  const trend = buildTrend(aiActMatters)

  return (
    <div className="page-stack overview-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">监管工作台 / AI ACT</p>
          <h1>概览</h1>
          <p className="page-description">按监管机关和程序动作读取 AI Act 的公开实施与执法记录。</p>
        </div>
        <div className="data-cutoff"><span className="live-dot" /> 数据核验至 {VERIFIED_ON}</div>
      </div>

      <MetricStrip metrics={metrics} />

      <section className="section-heading-row">
        <div>
          <h2>执法轨道</h2>
          <p>两条主泳道保持分开；EDPS 等 EU 机构监督场景单独处理。</p>
        </div>
        <span className="section-meta">{aiActMatters.length} 条 AI Act 记录</span>
      </section>
      <AuthorityLanes matters={aiActMatters} authorities={authorities} onSelectMatter={onSelectMatter} hasActiveFilters={hasActiveFilters} />

      <section className="panel activity-panel">
        <div className="panel-heading">
          <div>
            <h2>最新活动</h2>
            <p>按事项最新事件排序；调查步骤不等于已认定违法。</p>
          </div>
          <div className="panel-heading-actions">
              <span className="table-count">显示 {latestActivity.length} 条</span>
            <button className="quiet-button" type="button" onClick={onOpenMatters ?? (() => window.scrollTo({ top: 0, behavior: 'smooth' }))}>
              <Icon name="sliders" size={15} />
              <span>查看事项台账</span>
            </button>
          </div>
        </div>
        {latestActivity.length === 0 ? (
          <div className="empty-state overview-empty-state">
            <div className="empty-state-icon"><Icon name="search" size={22} /></div>
            <h2>没有匹配的最新活动</h2>
            <p>清除当前筛选后可恢复 AI Act 种子集。</p>
            {hasActiveFilters && <button className="quiet-button" type="button" onClick={onClearFilters}>清除当前筛选</button>}
          </div>
        ) : (
          <div className="table-scroll">
            <table className="matter-table activity-table">
              <caption className="sr-only">AI Act 最新活动</caption>
              <thead>
                <tr>
                  <th scope="col">日期</th>
                  <th scope="col">监管机关</th>
                  <th scope="col">动作</th>
                  <th scope="col">事项</th>
                  <th scope="col">状态</th>
                  <th scope="col">来源</th>
                </tr>
              </thead>
              <tbody>
                {latestActivity.map((matter) => {
                  const event = getLatestEvent(matter)
                  const isAdjacent = matter.regime !== 'ai-act'
                  return (
                    <tr className={isAdjacent ? 'adjacent-row' : undefined} key={matter.id}>
                      <td><span className="date-stack"><time dateTime={event.date}>{event.date}</time>{event.isTrackerCapture && <span className="date-basis">tracker capture</span>}</span></td>
                      <td><span className="authority-cell">{matter.authorityName}</span></td>
                      <td><div className="activity-badges"><button className="table-action" type="button" onClick={() => onSelectMatter(matter.id)}><Badge kind="action" value={event.actionType} subtype={event.actionSubtype} compact /></button>{isAdjacent && <Badge kind="regime" value={matter.regime} compact />}</div></td>
                      <td><button className="matter-link" type="button" onClick={() => onSelectMatter(matter.id)}>{matter.shortTitle}</button></td>
                      <td><Badge kind="status" value={matter.status} compact /></td>
                      <td><a className="source-link" href={matter.sources[0]?.url} target="_blank" rel="noreferrer">来源 <Icon name="external-link" size={13} /></a></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="support-grid">
        <div className="panel boundary-callout">
          <div className="callout-icon"><Icon name="info" size={20} /></div>
          <div>
            <h2>GDPR、消费者保护、DMA 和 DSA 不计入 AI Act KPI。</h2>
            <p>它们保留在“排除项 / 相邻制度”视图中，用于防止把涉及 AI 的其他监管事项误算为 AI Act 执法。</p>
          </div>
        </div>
        <div className="panel trend-panel">
          <div className="trend-heading"><div><h2>种子集活动</h2><p>按最新事件月份</p></div><span className="section-meta">仅作工作台导航</span></div>
          <div className="trend-legend" aria-label="动作图例">{TREND_ACTIONS.map((action) => <span key={action}><i className={`trend-legend-dot trend-${action}`} />{action === 'investigation' ? '调查' : action === 'remediation' ? '整改' : action === 'penalty' ? '处罚' : '指南'}</span>)}</div>
          <div className="trend-bars" aria-label="Seed set activity by month">
            {trend.map((item) => <div className="trend-bar-column" key={item.month} aria-label={`${item.month} ${item.total} events`}><span className="trend-bar-value">{item.total}</span><span className="trend-bar-stack" style={{ height: `${item.height}%` }}>{TREND_ACTIONS.map((action) => item.actionCounts[action] > 0 && <span className={`trend-segment trend-${action}`} key={action} style={{ height: `${(item.actionCounts[action] / item.total) * 100}%` }} />)}</span><span className="trend-bar-label">{item.month}</span></div>)}
          </div>
        </div>
      </section>
    </div>
  )
}
