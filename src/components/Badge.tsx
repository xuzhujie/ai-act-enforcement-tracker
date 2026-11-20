import Icon, { type IconName } from './icons'

export type BadgeKind = 'action' | 'status' | 'regime' | 'evidence'

type BadgeProps = {
  kind: BadgeKind
  value: string
  compact?: boolean
}

const actionIcons: Record<string, IconName> = {
  investigation: 'search',
  remediation: 'wrench',
  penalty: 'gavel',
  guidance: 'guide',
}

const actionClasses: Record<string, string> = {
  investigation: 'badge-action-investigation',
  remediation: 'badge-action-remediation',
  penalty: 'badge-action-penalty',
  guidance: 'badge-action-guidance',
}

const valueLabels: Record<string, string> = {
  investigation: '正式调查',
  remediation: '整改 / 纠正措施',
  penalty: '处罚 / 决定',
  guidance: '指南 / 实施',
  open: '开放',
  ongoing: '进行中',
  concluded: '已结案',
  'follow-up': '跟进中',
  published: '已发布',
  'ai-act': 'AI Act',
  dma: 'DMA',
  dsa: 'DSA',
  gdpr: 'GDPR',
  'consumer-protection': '消费者保护',
  other: '其他制度',
  decision: '正式决定',
  'official-announcement': '官方公告',
  'authority-page': '主管机关页面',
  secondary: '二手来源',
}

function getIcon(kind: BadgeKind, value: string): IconName {
  if (kind === 'action') return actionIcons[value] ?? 'spark'
  if (kind === 'evidence') return value === 'decision' ? 'gavel' : 'file'
  if (kind === 'regime') return value === 'ai-act' ? 'shield' : 'layers'
  return value === 'concluded' || value === 'published' ? 'check' : 'info'
}

export default function Badge({ kind, value, compact = false }: BadgeProps) {
  const className = [
    'badge',
    `badge-${kind}`,
    kind === 'action' ? actionClasses[value] : '',
    compact ? 'badge-compact' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <span className={className}>
      <Icon name={getIcon(kind, value)} size={compact ? 13 : 14} />
      <span>{valueLabels[value] ?? value}</span>
    </span>
  )
}
