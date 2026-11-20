# AI Act enforcement tracker

一个面向 EU AI Act 的 source-backed tracker 和看板。它把欧委会 AI Office、成员国市场监管机关和 EDPS / EU institutions 分开呈现，并把事项动作拆成：正式调查、整改 / 纠正措施、处罚 / 决定、指南 / 实施。

## 范围边界

- 只有明确以 AI Act 为主要法律基础的事项才计入 AI Act KPI。
- 涉及 AI 的 GDPR、消费者保护、DMA、DSA 事项保留在“排除项 / 相邻制度”中，不算 AI Act 执法。
- 信息请求、事故报告审查和实施说明不会自动被写成违法认定、整改或处罚。
- 事项同时保留来源发布日期、事件日期、日期依据、证据等级和原始链接。

当前 seed 集包含欧委会官方框架/目录记录、AI Office 的信息请求事项，以及德国 Bundesnetzagentur 的 AI Act 实施角色和投诉入口。后者是监管基础设施说明，不是个案调查、整改或处罚。2026-10-12 AI Office frontier-model information requests 事项也只进入“正式调查 / 进行中”：官方材料披露了严重事故报告和 RFI，但没有公开收件方、违法认定、整改或处罚，因此不进入处罚或整改计数。当前没有公开可核验的成员国个案调查、整改或处罚记录。

## 本地运行

```bash
npm ci
npm run dev -- --host 127.0.0.1
```

生产构建和本地预览：

```bash
npm run build
npm run preview -- --host 127.0.0.1
```

## 数据与验证

来源清单在 `src/data/source-registry.json`；刷新脚本把逐来源状态写入 `src/data/source-snapshot.json`。快照保留 HTTP 状态、内容类型、标题、SHA-256 内容哈希、检查时间和错误信息。

```bash
npm run refresh:data -- --allow-failures --retries 2 --retry-delay-ms 500
npm run validate:data
npm test -- --run
npm run build
```

`npm run check` 会按同样顺序执行数据校验、完整测试和生产构建。刷新器对 429、5xx 和网络异常自动退避重试，并把失败、尝试次数和 `Retry-After` 信息保存在来源快照；网络不可用时可用 `--fixture` 配合自定义 manifest 做离线刷新测试。正式刷新只允许 HTTPS 官方来源。编辑审核记录位于 `src/data/editorial-review.json`，只有 `verified` Matter 进入看板和 KPI。

## 自动刷新与部署

- `.github/workflows/refresh-data.yml` 每日检查官方页面，也支持手动触发，并通过 PR 更新来源快照。
- 刷新 PR 只更新来源健康快照，不会自动创建新的执法事项；新事项必须经过人工核验和来源审阅。
- `.github/workflows/ci.yml` 在 push / pull request 上执行校验、测试和构建。
- `.github/workflows/deploy-pages.yml` 提供 GitHub Pages 的手动 / `main` 分支部署；仓库设置中的 Pages 来源需选择 GitHub Actions。
- `netlify.toml` 将 `dist` 作为静态站点目录，并为 React 路由提供 SPA fallback。

部署前先将工作区推送到目标 GitHub 仓库。Netlify 可直接导入该仓库，构建命令为 `npm run build`、发布目录为 `dist`；GitHub Pages 则在仓库 Settings → Pages 中选择 GitHub Actions，然后运行 `Deploy to GitHub Pages` workflow。

详细的来源准入、失败处理、人工录入和发布步骤见 [`docs/operations.md`](docs/operations.md)。
