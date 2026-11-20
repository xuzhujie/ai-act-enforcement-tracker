export type Regime = 'ai-act' | 'gdpr' | 'consumer-protection' | 'dma' | 'dsa' | 'other'

export type AuthorityLane = 'ai-office' | 'member-state-msa' | 'edps' | 'other'

export type ActionType = 'investigation' | 'remediation' | 'penalty' | 'guidance'

export type ActionSubtype =
  | 'formal-investigation'
  | 'information-request'
  | 'incident-review'
  | 'corrective-measure'
  | 'sanction-decision'
  | 'guidance'
  | 'authority-infrastructure'

export type MatterStatus = 'open' | 'ongoing' | 'concluded' | 'follow-up' | 'published'

export type EvidenceLevel = 'decision' | 'official-announcement' | 'authority-page' | 'secondary'

export type Scope = 'gpai' | 'prohibited-practices' | 'transparency' | 'high-risk' | 'governance' | 'other'

export type AppPage = 'overview' | 'matters' | 'authorities' | 'excluded' | 'sources'

export type SortKey = 'date' | 'title' | 'authority'

export type SortDirection = 'asc' | 'desc'

export type MatterSort = {
  key: SortKey
  direction: SortDirection
}

export type Source = {
  id: string
  title: string
  url: string
  publisher: string
  publishedAt?: string
  evidenceLevel: EvidenceLevel
  refreshIntervalDays?: number
}

export type SourceRefreshRecord = {
  sourceId: string
  checkedAt?: string
  httpStatus?: number
  contentType?: string
  title?: string
  contentHash?: string
  previousContentHash?: string
  contentChanged?: boolean
  attempts?: number
  retryAfterSeconds?: number
  ok: boolean
  error?: string
}

export type SourceRefreshSnapshot = {
  generatedAt: string
  records: SourceRefreshRecord[]
}

export type SourceHealth = 'fresh' | 'stale' | 'error' | 'unverified'

export type CoverageStatus = 'case-found' | 'searched-no-case' | 'directory-only' | 'not-reviewed'

export type CoverageRecord = {
  status: CoverageStatus
  checkedAt: string
  sourceIds: string[]
  queryScope: string
  resultCount: number
  limitation: string
}

export type ReviewStatus = 'verified' | 'needs-review' | 'rejected'

export type EditorialReviewRecord = {
  status: ReviewStatus
  reviewedAt: string
  reviewer: string
  note: string
}

export type DataValidationIssue = {
  code: string
  path: string
  message: string
  severity: 'error' | 'warning'
}

export type Event = {
  id: string
  date: string
  label: string
  detail: string
  actionType: ActionType
  actionSubtype: ActionSubtype
  sourceIds: string[]
  citation?: string
  sourceLocator?: string
  isTrackerCapture?: boolean
}

export type Matter = {
  id: string
  title: string
  shortTitle: string
  regime: Regime
  relatedRegimes?: Regime[]
  authorityLane: AuthorityLane
  authorityName: string
  primaryAuthorityId: string
  supportingAuthorities?: string[]
  memberState?: string
  currentActionType: ActionType
  currentActionSubtype: ActionSubtype
  status: MatterStatus
  subject: string
  scope: Scope
  legalBasis: string[]
  summary: string
  inclusionNote: string
  exclusionReason?: string
  firstPublishedAt: string
  lastUpdatedAt: string
  lastVerifiedAt: string
  dateBasis?: 'source-published' | 'tracker-capture'
  events: Event[]
  sources: Source[]
  coverage?: CoverageRecord
}

export type AuthorityProfile = {
  id: string
  name: string
  country: string
  lane: AuthorityLane
  source: Source
  website?: string
  isSinglePointOfContact?: boolean
  designationPending?: boolean
  description?: string
  coverage?: CoverageRecord
}

export type FilterState = {
  search: string
  authorityLane?: AuthorityLane | 'all'
  actionType?: ActionType | 'all'
  actionSubtype?: ActionSubtype | 'all'
  actionHistory?: ActionType | 'all'
  status?: MatterStatus | 'all'
  memberState?: string | 'all'
  regime?: Regime | 'all'
  scope?: Scope | 'all'
  evidenceLevel?: EvidenceLevel | 'all'
}

export type OverviewMetrics = {
  total: number
  investigations: number
  remediation: number
  penalties: number
  guidance: number
}

export type AuthorityCount = {
  authorityId: string
  authorityName: string
  country: string
  lane: AuthorityLane
  matterCount: number
  isSinglePointOfContact?: boolean
  designationPending?: boolean
  source: Source
  coverage?: CoverageRecord
}
