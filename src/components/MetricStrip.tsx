import type { OverviewMetrics } from '../types'

type MetricStripProps = {
  metrics: OverviewMetrics
}

const metricDefinitions = [
  { key: 'total', label: 'AI Act 事项总数', note: '当前种子集', className: 'metric-neutral' },
  { key: 'investigations', label: '正式调查', note: '开放或进行中', className: 'metric-blue' },
  { key: 'remediation', label: '整改进行中', note: '纠正措施 / 跟进', className: 'metric-orange' },
  { key: 'penalties', label: '处罚 / 决定', note: '已结案决定', className: 'metric-red' },
  { key: 'guidance', label: '指南 / 实施', note: '已发布材料', className: 'metric-purple' },
] as const

export default function MetricStrip({ metrics }: MetricStripProps) {
  return (
    <section className="metric-strip" aria-label="AI Act tracker summary">
      {metricDefinitions.map((metric) => (
        <div className={`metric-item ${metric.className}`} key={metric.key}>
          <span className="metric-accent" aria-hidden="true" />
          <div>
            <div className="metric-label">{metric.label}</div>
            <div className="metric-value">{metrics[metric.key]}</div>
            <div className="metric-note">{metric.note}</div>
          </div>
        </div>
      ))}
    </section>
  )
}
