# AI Act Enforcement Tracker：设计文档

## Intent

这是一个面向政策、合规与研究团队的 EU AI Act 执法台账和看板。它的首要任务不是把所有“涉及 AI 的监管新闻”堆在一起，而是让用户快速回答四个问题：

1. 欧委会 AI Office 在做什么？
2. 哪些成员国市场监管机关在行动？
3. 当前记录处于正式调查、整改、处罚还是指南/实施阶段？
4. 这条记录是否真的属于 AI Act，而不是 GDPR、消费者保护、DMA 或 DSA？

官方执法架构将 AI Office 与成员国市场监管机关分开，并将 GPAI、特定 AI 系统与国家层面的市场监督分配给不同主体。本产品以此作为默认信息架构；EDPS 等针对 EU 机构的监督场景作为独立的附加筛选维度，不混入两个主看板泳道。

## Goals

- 用一张概览页看清 AI Office 与成员国市场监管机关两条执法轨道。
- 将正式调查、整改/纠正措施、处罚/决定、指南/实施材料做成明确且互斥的主要行动类型。
- 每条记录都显示监管机关、对象、法律基础、当前状态、关键事件、原始来源和最后核验时间。
- 默认只显示 AI Act 记录；GDPR、消费者保护、DMA、DSA 等相邻事项单独放入“排除项”视图，并显示排除理由。
- 提供可用的本地交互：搜索、按权限域/行动类型/状态/成员国筛选、打开详情抽屉、查看事件时间线和跳转原始来源。
- 用官方来源种子数据启动产品，明确“当前种子集没有记录”与“现实中没有发生”的差异。

## Non-goals and anti-goals

- 第一版不做实时爬虫、自动新闻聚合、后端数据库或自动法律判断。
- 不把 GDPR、消费者保护、反垄断、DMA、DSA 案件仅因为提到 AI 就算作 AI Act 执法。
- 不把监管机关发布的架构页、FAQ 或一般性说明伪装成正式调查或处罚。
- 不对尚未形成正式记录的媒体报道作“违法”结论；种子数据优先使用欧委会和主管机关的一手页面。
- 不做纯营销首页；第一屏必须是可用的研究/监测工作台。

## Scope rule

记录在数据层拥有 `regime` 字段：

- `ai-act`：纳入默认 KPI、时间线和案件列表。
- `gdpr`、`consumer-protection`、`dma`、`dsa`、`other`：保留在排除项/相邻监管视图中，但不计入 AI Act KPI。

纳入 AI Act 的最低条件是来源明确以 EU AI Act、其实施/授权文件，或依据该法行使职权的机构公告为法律或程序基础。只描述 AI 风险、个人数据、暗黑模式、平台内容或市场竞争，而没有 AI Act 依据的记录，必须标为排除项。详情页显示“收录理由/排除理由”和证据等级，避免用户把“提到 AI”误读为“AI Act 案件”。

## Information architecture

### App shell

- 顶部应用栏：产品名、数据截止/最后核验日期、全局搜索、一个“AI Act only”开关（默认开启）。
- 左侧窄导航：Overview、Matters、Authorities、Excluded、Sources；当前页以欧盟蓝色细线和浅色背景标示。
- 主内容为宽桌面工作台；窄屏时侧栏变成顶部水平滚动导航，表格改为可横向滚动的语义列表，不做不可读的卡片堆。

### Overview（默认页）

1. 一行摘要：纳入记录、开放调查、整改中、处罚/决定、指南/实施材料。
2. 两个主泳道：
   - **European Commission · AI Office**：GPAI、系统性风险、AI Office 直接权限和跨部门支持。
   - **Member State market surveillance**：成员国市场监管机关、单一联络点和国家层面的 AI 系统市场监督。
3. “最新动作”事件列表：按最近事件排序，左侧用行动类型色标区分，不用状态颜色替代行动类型。
4. “边界提示”小模块：说明 GDPR/消费者保护/ DMA/DSA 不计入，并给出排除项数量。
5. 一条轻量趋势带：按月显示种子数据中的行动类型分布；当数据不足时显示“种子集”说明，不制造趋势结论。

### Matters

- 可排序、可筛选的台账表；默认列为日期、事项、机关、对象、行动类型、状态、法律基础、来源。
- 点击一行打开右侧详情抽屉，不离开列表上下文。
- 详情抽屉包含：摘要、纳入判定、机构和权限、对象/系统、法律基础、事件时间线、来源列表、最后核验时间。

### Authorities

- 以两列为主：AI Office 与 Member State market surveillance authorities。
- 成员国行显示国家、主管机关/单一联络点、权限说明、来源和“记录数”；没有已发布执法记录的机关仍可作为目录项，但不会自动创建案件。
- EDPS 以“EU institutions / separate supervisory context”单独列出，避免用户误以为它属于成员国市场监管机关。

### Excluded

- 保留相邻监管事项的最小索引：标题、主体、所属制度、排除理由、来源、是否可能形成交叉引用。
- 顶部明确显示：排除项不计入 Overview KPI、趋势或 AI Act 案件总数。

## Data model

使用 TypeScript 类型分离主体、事项、事件和来源，避免把一条新闻硬编码成一个状态。

```ts
type Regime = 'ai-act' | 'gdpr' | 'consumer-protection' | 'dma' | 'dsa' | 'other'
type AuthorityLane = 'ai-office' | 'member-state-msa' | 'edps' | 'other'
type ActionType = 'investigation' | 'remediation' | 'penalty' | 'guidance'
type MatterStatus = 'open' | 'ongoing' | 'concluded' | 'follow-up' | 'published'
type EvidenceLevel = 'decision' | 'official-announcement' | 'authority-page' | 'secondary'

type Matter = {
  id: string
  title: string
  shortTitle: string
  regime: Regime
  authorityLane: AuthorityLane
  authorityName: string
  memberState?: string
  actionType: ActionType
  status: MatterStatus
  subject: string
  scope: 'gpai' | 'prohibited-practices' | 'transparency' | 'high-risk' | 'governance' | 'other'
  legalBasis: string[]
  summary: string
  inclusionNote: string
  exclusionReason?: string
  firstPublishedAt: string
  lastUpdatedAt: string
  lastVerifiedAt: string
  events: Event[]
  sources: Source[]
}

type Event = {
  id: string
  date: string
  label: string
  detail: string
  actionType: ActionType
}

type Source = {
  id: string
  title: string
  url: string
  publisher: string
  publishedAt?: string
  evidenceLevel: EvidenceLevel
}
```

### Classification decisions

- “调查”只用于明确的正式调查、调查程序、信息请求/模型评估等已由主管机关公开的执法步骤；一般监测、呼吁或政治表态不自动升级。
- “整改”用于纠正措施、限制公开、召回、承诺或明确的合规跟进；“整改中”不等同于已认定违法。
- “处罚”用于正式处罚、罚款或具有制裁效果的决定；不要把调查中的罚款上限说明当作处罚记录。
- “指南”用于 FAQ、实施/授权材料、指南、代码、机构架构或其他帮助执行但不针对具体对象的公开材料。
- `status` 描述程序状态，`actionType` 描述动作类型；二者不能互换。

## Seed data strategy

第一版使用官方页面作为来源种子，至少包含：

- AI Office 的治理与执法架构页；
- AI Office 的执法框架/执法工具说明；
- 成员国市场监管机关列表与职责页；
- GPAI 规则 FAQ、AI Office 权限或实施材料；
- 一到两条明确标为相邻制度、但排除出 AI Act 统计的 DMA/DSA 记录，用来展示边界防误计。

种子数据中的“指导/实施材料”会被真实标为 `guidance`；如果官方来源没有公开具体调查或处罚，就显示“当前种子集无处罚记录”，而不是填入虚构案件。每条记录保存原始 URL、来源标题、证据等级和最后核验日期。

## Reference to DMA/DSA projects

只借鉴它们已被验证的台账形态，不把制度内容混合进 AI Act：

- DMA 的“specification proceedings / non-compliance decision”启发我们把程序动作和最终决定分开记录。
- DSA 的“investigation / proceeding / non-compliance / interim measures”启发我们保留事件时间线、调查与决定的阶段关系，并在 UI 中提示“调查步骤不等同于已认定违法”。
- 两者的单独制度筛选和来源页模式启发 `regime` 和 `sources` 字段；DMA/DSA 项目本身只出现在 Excluded/Adjacent 视图。

## Visual and interaction direction

- 视觉主题：冷白工作台 + 深墨色文本 + 欧盟蓝色动作色 + 低饱和橙色提醒，整体像一份现代政策研究工作台，而不是 SaaS KPI 墙。
- 背景颜色锁定为 `#F6F8FB`，内容表面为 `#FFFFFF`；文本为深蓝黑，边框为冷灰，强调色为 `#1F5EFF`。
- 字体使用系统无衬线栈，标题采用紧凑的中等粗细；表格与元数据使用较小但不低于 12px 的清晰字号。
- 少用嵌套卡片；主列表、泳道、表格和右侧抽屉承担信息密度。圆角保持克制，阴影只用于抽屉和浮层。
- 行动类型采用稳定的颜色/图标组合：调查蓝、整改橙、处罚红、指南紫；状态使用文字和细线，不依赖颜色单独传达。
- 交互必须有真实本地状态：筛选会重算 KPI、泳道和列表；打开事项会显示对应详情；“AI Act only”关闭后才显示排除项。

## Technical plan

- 新建 React + Vite + TypeScript 应用。
- 组件按职责拆分：`AppShell`、`Overview`、`MetricStrip`、`AuthorityLanes`、`MatterTable`、`MatterDrawer`、`FilterBar`、`Timeline`、`SourcesPanel`、`ExcludedView`。
- 数据与视图分离：`src/data/seed.ts`、`src/types.ts`、`src/lib/filters.ts`、`src/components/`、`src/styles/`。
- 使用本地 React state 保存当前筛选、选中事项和搜索词；将筛选状态写入 URL query string 不是第一版必要条件。
- 不引入后端、认证或外部图表库；趋势带用语义化 CSS/SVG，确保构建轻量且可读。
- 通过 `prefers-reduced-motion` 关闭抽屉和列表的非必要动效。

## Verification plan

1. `npm run build` 验证生产构建。
2. 在浏览器中验证默认 Overview、AI Office / Member State 筛选、行动类型筛选、搜索、详情抽屉、AI Act only 开关和 Excluded 视图。
3. 验证桌面首屏与窄屏布局，确保表格不被压成不可读卡片、详情抽屉不会溢出。
4. 用官方来源链接逐条抽查种子数据，确认所有 AI Act KPI 都能回到来源；确认排除项不会影响 KPI。
5. 对设计概念和浏览器截图做至少五项视觉核对：首屏层级、两条机构泳道、表格密度、行动类型标识、详情抽屉、移动端溢出。

## Decision

采用“执法台账优先”方案。选择 React + Vite + TypeScript 是因为当前工作区为空、目标是一个可交互的数据工作台，并且第一版需要在没有后端的情况下先建立清晰的数据分类和可核验 UI。实时数据接入、后台编辑与自动采集留作后续迭代。

## Open builder calls

- 当前种子数据不宣称穷尽现实世界；所有数量均由本地种子集计算。
- 默认展示 AI Act only；用户主动关闭后才能看到排除项。
- EDPS 保留为独立附加权限域，因为官方执法框架将其与 AI Office 和成员国市场监管机关分开。
- 初版以官方英文来源为主，UI 文案使用中文并保留原始来源标题，便于审计。

## Builder review resolution

独立 builder check 提出了六个会影响实现计划的问题，现按以下规则解决：

1. **一个 `Matter` 是一条案件/事项主线，而不是一个单独动作。** 调查、整改、处罚等按时间顺序进入 `events`；`Matter.actionType` 表示当前/最新的主要动作，Overview KPI 按当前主要动作统计，避免同一案件在多个主指标中重复计数。
2. **混合制度事项保留关系但不混算。** 只有来源明确以 AI Act 为主要法律基础的事项进入 AI Act；GDPR、消费者保护、DMA、DSA 相关内容作为 `relatedRegimes`/关联说明显示，不单独增加 AI Act KPI。纯相邻制度事项进入 Excluded。
3. **KPI 采用可复核的组合规则。** Open investigations = `actionType=investigation` 且 `status=open|ongoing`；remediation in progress = `actionType=remediation` 且 `status=ongoing|follow-up`；penalties/decisions = `actionType=penalty` 且 `status=concluded`；guidance/implementation = `actionType=guidance` 且 `status=published`。
4. **`AI Act only` 不会改变 Overview 的制度边界。** Overview 的 KPI、机构泳道和趋势始终只计算 AI Act；关闭开关后，Matters/Latest activity 可以显示灰显的相邻制度事项，并提供跳转到 Excluded 的入口。这样不会因为查看相邻制度而污染主看板。
5. **Authorities 默认采用完整的官方成员国目录。** 目录保留没有案件记录的机关，显示 0 条记录和官方来源；“没有记录”不推断为“没有执法”。目录随官方来源核验日期展示。
6. **支持/协同机关不会制造重复计数。** 每个事项有一个 `primaryAuthority`/主泳道；可选的 `supportingAuthorities` 只在详情与事件中展示，KPI 和泳道计数只按主责任机关计算。

这些是实施层的默认调用，不改变用户已经确认的产品目标；若无特别更改，它们视为本设计的批准细节。
