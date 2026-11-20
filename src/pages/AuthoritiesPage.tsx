import type { AuthorityProfile, Matter } from '../types'
import { getAuthorityCounts } from '../lib/filters'
import Badge from '../components/Badge'
import Icon from '../components/icons'

type AuthoritiesPageProps = {
  matters: Matter[]
  authorities: AuthorityProfile[]
  onSelectAuthority?: (authorityId: string) => void
}

const coverageLabels = {
  'case-found': '已发现个案',
  'searched-no-case': '已检索，未发现个案',
  'directory-only': '目录级覆盖',
  'not-reviewed': '尚未检索',
} as const

export default function AuthoritiesPage({ matters, authorities, onSelectAuthority }: AuthoritiesPageProps) {
  const counts = getAuthorityCounts(matters, authorities)
  const memberStateCounts = counts.filter((authority) => authority.lane === 'member-state-msa' && authority.country !== 'EU').sort((a, b) => a.country.localeCompare(b.country))
  const aiOffice = counts.find((authority) => authority.authorityId === 'ai-office')
  const aggregateMsa = counts.find((authority) => authority.authorityId === 'member-state-msas')
  const edps = counts.find((authority) => authority.authorityId === 'edps')
  const nationalLaneCount = matters.filter((matter) => matter.authorityLane === 'member-state-msa').length
  const nationalCaseCount = matters.filter((matter) => matter.authorityLane === 'member-state-msa' && matter.currentActionType !== 'guidance').length
  const nationalInfrastructureCount = matters.filter((matter) => matter.authorityLane === 'member-state-msa' && matter.currentActionType === 'guidance').length

  return (
    <div className="page-stack authorities-page">
      <div className="page-heading">
        <div>
          <p className="eyebrow">AI ACT WORKBENCH / AUTHORITY MAP</p>
          <h1>监管机关</h1>
          <p className="page-description">按主责任机关计数；支持或协同机关只在事项详情中保留。</p>
        </div>
        <div className="data-cutoff">目录核验至 2026-11-09</div>
      </div>

      <div className="authority-summary-grid">
        {[aiOffice, aggregateMsa, edps].map((authority) => {
          if (!authority) return null
          const matterCount = authority.authorityId === 'member-state-msas' ? nationalLaneCount : authority.matterCount
          return (
            <section className="panel authority-summary" key={authority.authorityId}>
              <div className="summary-icon"><Icon name={authority.lane === 'edps' ? 'shield' : 'building'} size={18} /></div>
              <div><p>{authority.lane === 'ai-office' ? 'EU-level lane' : authority.lane === 'edps' ? 'EU institutions' : 'National lane'}</p><h2>{authority.authorityName}</h2><strong>{matterCount}</strong><span>条已追踪事项</span></div>
            </section>
          )
        })}
      </div>

      <section className="panel directory-panel">
        <div className="panel-heading">
          <div><h2>成员国市场监管机关目录</h2><p>完整保留官方目录中的 27 个成员国；零案件不代表没有执法。</p></div>
          <span className="table-count">{memberStateCounts.length} 个国家</span>
        </div>
        <div className="authority-directory">
          {memberStateCounts.map((authority) => (
            <div className="authority-directory-row" key={authority.authorityId}>
              <div className="authority-country"><span className="country-code">{authority.country.slice(0, 2).toUpperCase()}</span><strong>{authority.country}</strong></div>
              <div className="authority-name">
                <button className="authority-name-button" type="button" onClick={() => onSelectAuthority?.(authority.authorityId)} aria-label={'按 ' + authority.country + ' 的记录筛选'}>
                  <span>{authority.authorityName}</span>
                  <span className={'authority-spoc ' + (authority.isSinglePointOfContact ? 'authority-spoc-listed' : 'authority-spoc-missing')}>{authority.isSinglePointOfContact ? 'single point of contact listed' : 'single point of contact not listed'}</span>
                  {authority.designationPending && <span className="pending-mark">designation pending</span>}
                </button>
              </div>
              <div className="authority-count"><strong>{authority.matterCount}</strong><span>条记录</span></div>
              <div className="authority-coverage-status"><strong>{authority.coverage ? coverageLabels[authority.coverage.status] : '尚未检索'}</strong><span>{authority.coverage?.checkedAt ?? '—'} · {authority.coverage?.limitation ?? '暂无覆盖说明'}</span></div>
              <a className="source-link" href={authority.source.url} target="_blank" rel="noreferrer">官方目录 <Icon name="external-link" size={13} /></a>
            </div>
          ))}
        </div>
      </section>

      <section className="panel boundary-callout authority-coverage-note">
        <div className="callout-icon"><Icon name="info" size={20} /></div>
        <div>
          <h2>{nationalCaseCount === 0 ? '当前没有公开可核验的成员国个案调查、整改或处罚。' : `已收录 ${nationalCaseCount} 条成员国个案动作。`}</h2>
          <p>已收录的成员国记录（当前 {nationalInfrastructureCount} 条）是官方监管架构、投诉入口或实施说明；不会被包装成个案执法结果。成员国行显示的是目录级覆盖，不是穷尽式案件发现。新个案须经过来源和编辑审核后才进入 KPI。</p>
        </div>
      </section>

      <section className="panel edps-panel">
        <div className="summary-icon"><Icon name="shield" size={18} /></div>
        <div><Badge kind="regime" value="ai-act" /><h2>EDPS · EU institutions</h2><p>EDPS 是 EU 机构、机构和机构实体场景下的独立 AI Act 监督机关，不计入成员国市场监管目录。</p></div>
      </section>
    </div>
  )
}
