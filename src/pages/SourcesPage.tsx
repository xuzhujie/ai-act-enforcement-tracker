import type { DataValidationIssue, Matter, Source, SourceHealth, SourceRefreshSnapshot } from '../types'
import Badge from '../components/Badge'
import Icon from '../components/icons'
import { getRefreshRecord, getSourceHealth } from '../lib/dataValidation'
import { VERIFIED_ON } from '../data/seed'

type SourcesPageProps = {
  matters: Matter[]
  sources?: Source[]
  snapshot?: SourceRefreshSnapshot
  validationIssues?: DataValidationIssue[]
  reviewSummary?: { total: number; verified: number; needsReview: number; rejected: number }
}

const healthLabels: Record<SourceHealth, string> = {
  fresh: '可用',
  stale: '需刷新',
  error: '访问失败',
  unverified: '未核验',
}

export default function SourcesPage({ matters, sources: sourceInput, snapshot = { generatedAt: '', records: [] }, validationIssues = [], reviewSummary }: SourcesPageProps) {
  const sources = sourceInput ?? Array.from(new Map(matters.flatMap((matter) => matter.sources).map((source) => [source.id, source])).values())
  const errorIssues = validationIssues.filter((issue) => issue.severity === 'error')
  const refreshFailures = snapshot.records.filter((record) => !record.ok)
  const snapshotDate = snapshot.generatedAt ? snapshot.generatedAt.slice(0, 10) : '—'

  return (
    <div className="page-stack sources-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">METHOD / PROVENANCE</p>
          <h1>来源</h1>
          <p className="page-description">来源优先于推断：每条记录都保留原始页面、证据等级和最后核验日期。</p>
        </div>
        <div className="data-cutoff">{sources.length} 个来源 · 快照 {snapshotDate}</div>
      </div>
      <section className="source-method-grid">
        <div className="panel method-panel"><span className="method-index">01</span><h2>官方来源优先</h2><p>首选欧委会、AI Office、成员国主管机关的页面和决定。媒体或二手来源不自动产生 AI Act 事项。</p></div>
        <div className="panel method-panel"><span className="method-index">02</span><h2>动作与状态分开</h2><p>调查、整改、处罚、指南是动作；开放、进行中、已结案、跟进和已发布是程序状态。</p></div>
        <div className="panel method-panel"><span className="method-index">03</span><h2>相邻制度不混算</h2><p>DMA / DSA / GDPR / 消费者保护事项放在 Excluded，除非来源明确建立 AI Act 的主要法律基础。</p></div>
      </section>
      {refreshFailures.length > 0 && (
        <section className="panel data-health-callout data-health-error">
          <div className="callout-icon"><Icon name="info" size={20} /></div>
          <div>
            <h2>来源刷新失败 {refreshFailures.length} 个</h2>
            <p>{refreshFailures.map((record) => {
              const source = sources.find((item) => item.id === record.sourceId)
              const retryDetail = record.retryAfterSeconds !== undefined ? `重试等待 ${record.retryAfterSeconds} 秒` : '已应用退避重试'
              return `${source?.title ?? record.sourceId}：${record.error ?? '未知错误'}（${retryDetail}）`
            }).join(' · ')}</p>
          </div>
        </section>
      )}
      <section className={`panel data-health-callout ${errorIssues.length > 0 ? 'data-health-error' : ''}`}>
        <div className="callout-icon"><Icon name={errorIssues.length > 0 ? 'info' : 'check'} size={20} /></div>
        <div>
          <h2>{errorIssues.length > 0 ? `数据校验发现 ${errorIssues.length} 个问题` : '数据校验通过'}</h2>
          <p>{errorIssues.length > 0 ? errorIssues.map((issue) => issue.message).join(' · ') : `来源注册表、Matter 边界和机关引用已核验；最后核验日期：${VERIFIED_ON}。${reviewSummary ? ` 编辑审核：${reviewSummary.verified}/${reviewSummary.total} 条已核验。` : ''}`}</p>
        </div>
      </section>
      <section className="panel sources-list-panel">
        <div className="panel-heading"><div><h2>已使用来源</h2><p>按来源注册表展示；健康状态来自最近一次可复核的刷新快照。</p></div><span className="table-count">official first</span></div>
        <div className="sources-list">
          {sources.map((source) => (
            <a className="source-row" href={source.url} target="_blank" rel="noreferrer" key={source.id}>
              <div className="source-row-icon"><Icon name="file" size={17} /></div>
              <div className="source-row-copy"><strong>{source.title}</strong><span>{source.publisher}{source.publishedAt ? ` · ${source.publishedAt}` : ''}</span></div>
              <div className="source-row-status"><Badge kind="evidence" value={source.evidenceLevel} compact /><span className={`source-health source-health-${getSourceHealth(source, getRefreshRecord(snapshot, source.id))}`}>{healthLabels[getSourceHealth(source, getRefreshRecord(snapshot, source.id))]}</span></div>
              <Icon name="external-link" size={15} />
            </a>
          ))}
        </div>
      </section>
    </div>
  )
}
