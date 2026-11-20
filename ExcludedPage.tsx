import type { Matter } from '../types'
import Badge from '../components/Badge'
import Icon from '../components/icons'

type ExcludedPageProps = {
  matters: Matter[]
  onSelectMatter: (matterId: string) => void
}

export default function ExcludedPage({ matters, onSelectMatter }: ExcludedPageProps) {
  return (
    <div className="page-stack excluded-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">BOUNDARY / ADJACENT REGIMES</p>
          <h1>排除项</h1>
          <p className="page-description">这些公开事项可能涉及 AI 或数字监管，但不属于 AI Act 执法统计。</p>
        </div>
        <div className="data-cutoff"><span className="scope-dot" /> 不计入 Overview</div>
      </div>
      <section className="panel excluded-callout"><Icon name="info" size={19} /><p><strong>边界规则：</strong>GDPR、消费者保护、DMA、DSA 及其他制度的记录会保留为相邻参考，但不会增加 AI Act 事项、调查、整改、处罚或指南数量。</p></section>
      <section className="panel excluded-list-panel">
        <div className="panel-heading"><div><h2>相邻制度索引</h2><p>只收录来源明确的官方页面/公告。</p></div><span className="table-count">{matters.length} 条</span></div>
        <div className="excluded-list">
          {matters.map((matter) => (
            <button className="excluded-row" type="button" key={matter.id} onClick={() => onSelectMatter(matter.id)}>
              <div className="excluded-row-main"><Badge kind="regime" value={matter.regime} /><strong>{matter.shortTitle}</strong><span>{matter.authorityName}</span></div>
              <div className="excluded-row-reason"><span>{matter.exclusionReason}</span><Icon name="arrow-right" size={16} /></div>
            </button>
          ))}
        </div>
      </section>
    </div>
  )
}
