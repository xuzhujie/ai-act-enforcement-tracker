# 运维与编辑规则

## 1. 来源准入

来源必须是 HTTPS。AI Act 事项优先使用欧委会、AI Office、成员国市场监管机关、EDPS 或正式法律/决定页面；DMA 和 DSA 仅作为相邻制度参考。每个事项至少保留一个原始来源，来源页需要能解释证据等级和最后检查时间。

### 可以进入 AI Act KPI 的内容

- AI Act 下的正式调查、信息请求或事故审查（动作写作 `investigation`，不得提前写成违法认定）。
- AI Act 下公开的整改 / 纠正措施或处罚 / 决定。
- 直接支撑 AI Act 实施的官方指南、监管框架、机关目录和生效说明（动作写作 `guidance`）。

### 必须排除的内容

涉及 AI 但主要法律基础是 GDPR、消费者保护、DMA 或 DSA 的案件不得放入 AI Act KPI；它们只能进入相邻制度视图并填写 `exclusionReason`。没有官方个案来源的新闻、评论或推测也不得当作处罚、整改或正式调查。

## 2. 每日来源刷新

本地或 CI 执行：

```bash
npm run refresh:data -- --allow-failures --retries 2 --retry-delay-ms 500
npm run validate:data
```

刷新器读取 `src/data/source-registry.json`，对每个 URL 使用 Node `fetch`，记录 `checkedAt`、HTTP 状态、content type、HTML title、内容哈希、上次哈希和错误。单个来源失败不会抹掉其他来源；失败记录必须保留错误文本，并在 Sources 页面显示为“访问失败”。默认最多 4 个来源并发，避免一次刷新压垮官方站点。

对 HTTP 429、5xx 和网络异常，刷新器默认最多再试 2 次，等待时间按 500ms、1s 递增；如果响应带 `Retry-After`，优先使用该值（单次等待上限 10 秒）。快照还会保留 `attempts`、`retryAfterSeconds` 和内容变化标记，Sources 页面会在顶部单独提示失败来源、等待信息和变化来源。默认情况下，存在失败来源会使刷新命令返回非零；每日 GitHub Actions 使用 `--allow-failures`，这样可以提交包含失败状态的快照供人工处理。`npm run validate:data` 仍会阻止重复 ID、非 HTTPS、非法 evidence level、未知快照来源、缺失快照记录和缺失错误信息进入构建；应用层校验还会检查主责任机关、Matter 来源、事件来源、事件日期、动作细分与状态兼容性。

合并刷新 PR 前：

1. 检查来源是否只是临时 429 / 5xx，必要时重新手动运行 workflow。
2. 对页面标题或内容哈希变化做人工抽查。
3. 只有在官方页面确认后，才编辑 `src/data/seed.ts` 加入新事项。

## 3. 编辑审核门槛

每条 Matter 都必须在 `src/data/editorial-review.json` 中有审核记录。只有 `status: "verified"` 的记录进入看板、KPI、机关计数和趋势；`needs-review` / `rejected` 会被数据层挡在发布视图之外。审核记录必须包含核验日期、审核人和说明，说明应解释官方来源支持的动作边界。新增记录的默认流程是：先录入 Matter 和官方来源，再以 `needs-review` 提交，确认事实、动作类型、法律基础和相邻制度边界后改为 `verified`。

成员国个案必须有主管机关的官方个案来源，才能标记为调查、整改或处罚。当前已核验的德国 Bundesnetzagentur 页面只证明国家实施角色和投诉入口，因此台账将其记录为 `guidance` / 基础设施，不包装成个案执法结果；目前没有公开可核验的成员国个案调查、整改或处罚记录。

## 4. 新事项录入

一条 Matter 是一个监管线程；历史节点放入 `events`。至少填写：监管轨道、主机关、当前动作类型、当前动作细分、状态、法律基础、来源、首次发布日期、最后更新时间、最后核验日期和日期依据。每个事件都要填写 `sourceIds`；来源已发布事件还要填写简短 `citation`，必要时填写 `sourceLocator`。

AI Office RFI、事故报告、信息请求等事项：

- `currentActionType: investigation`
- `currentActionSubtype: information-request` 或 `incident-review`，除非官方来源明确确认了正式调查
- 说明是否为调查 / RFI / incident review
- 明确写出“未公开违法认定 / 整改 / 处罚”（如果来源确实没有这些内容）
- 不填写 `penaltyAmount`，除非正式决定披露了罚款

来源发布日期、事件日期与 tracker capture 日期要区分。`isTrackerCapture` 只表示台账首次记录或重新核验的时间，不是机关行动日期。

## 5. 发布前检查

```bash
npm run check
```

CI 使用 Node 22 LTS；GitHub Actions 依赖使用 major 版本并在依赖更新 PR 中复核。CI 同时运行构建产物 smoke test，确保 Pages / Netlify 的静态入口和 module asset 能被实际服务；刷新 workflow 设有并发锁，避免定时任务重叠。

检查通过后运行本地预览，核验：Overview 的两条监管泳道、Matters 的当前动作 / 历史动作 / 范围 / 证据筛选和 URL、浏览器前进后退、排序、CSV 导出、About 边界说明、Authorities 的成员国目录与覆盖边界、Excluded 的相邻制度、Sources 的健康状态 / 内容变化和事项详情抽屉。

Netlify 使用仓库根目录的 `netlify.toml`：构建命令为 `npm run build`，发布目录为 `dist`，所有前端路径回退到 `index.html`。GitHub Actions 配置已经放入 `.github/workflows/`，但必须先把当前工作区推送到一个 GitHub 仓库，CI 和每日刷新 PR 才会实际运行。
