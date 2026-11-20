# AI Act tracker productionization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Upgrade the local AI Act tracker from a source-backed seed dashboard into a continuously refreshable, validated, exportable, and deployable enforcement tracker without collapsing AI Act enforcement into GDPR, consumer-protection, DMA, or DSA matters.

**Architecture:** Keep the existing React/Vite workbench and pure query layer. Add a typed source registry plus generated source-health snapshot, a small Node refresh/validation toolchain, and an explicit official AI Office RFI matter. Keep UI state in local React state while synchronizing non-identity filters and page scope to the URL.

**Tech Stack:** React 19, TypeScript, Vite, Vitest, Testing Library, Node 20+ built-in `fetch`, GitHub Actions, Netlify static deploy configuration.

**Spec:** `docs/superpowers/specs/2026-11-19-ai-act-tracker-design.md`

## Global Constraints

- A Matter remains one regulatory thread with a current action and historical events.
- AI Act KPI calculations include only `regime === 'ai-act'`; AI-related GDPR, consumer-protection, DMA, and DSA records remain adjacent or excluded.
- AI Office, Member State market-surveillance authorities, and EDPS remain separate authority contexts.
- Official source pages are required for seeded enforcement records; an information request or incident review must not be presented as a finding, remediation, or penalty.
- Source publication dates and tracker-capture dates must remain visibly distinct.
- No live credentials, signed URLs, or private identifiers may enter the app or snapshots.

## Review Focus

- A refresh response is partial or unavailable: the snapshot must retain per-source failure state and never silently mark a failed source healthy.
- A source registry contains duplicate IDs, non-HTTPS URLs, or an invalid evidence level: validation must fail with actionable messages.
- A URL contains an adjacent regime or invalid enum: parsing must fall back to safe AI Act-only defaults.
- A CSV field contains commas, quotes, newlines, or non-ASCII text: export must preserve the value with correct quoting and UTF-8 BOM.
- Sorting and trend bucketing cross year boundaries or contain zero-count months: the view must remain chronologically correct and explicit.

### Task 1: Source-backed data contract and real official enforcement records

**Files:**
- Create: `src/data/source-registry.json`, `src/data/source-snapshot.json`, `src/data/sourceRegistry.ts`, `src/lib/dataValidation.ts`, `src/lib/dataValidation.test.ts`
- Modify: `src/types.ts`, `src/data/seed.ts`, `src/pages/OverviewPage.tsx`, `src/pages/SourcesPage.tsx`, `src/App.tsx`

**Interfaces:**
- Produces `SourceRefreshSnapshot`, `SourceRefreshRecord`, `DataValidationIssue`, `validateTrackerData`, and `sourceRegistry` for later refresh/UI tasks.
- Consumes existing `Matter`, `Source`, `AuthorityProfile`, and AI Act KPI query contracts.

- [x] Write failing validation tests for duplicate IDs, invalid source URLs, AI Act exclusion fields, unknown supporting authorities, and adjacent records with exclusion reasons.
- [x] Add the shared source registry and an initial empty/seeded refresh snapshot.
- [x] Add the official 12 October 2026 AI Office Scientific Panel/RFI matter and the 31 July 2026 official enforcement-start implementation record; preserve the RFI caveat that no infringement, remediation, or penalty has been announced.
- [x] Refactor seed source constants to use the registry and update verification date to 2026-11-20.
- [x] Add validation status to Sources and update Overview copy/counts from the derived dataset.
- [x] Run targeted validation tests and the full suite.

### Task 2: Continuous source refresh and freshness monitoring

**Files:**
- Create: `scripts/refresh-sources.mjs`, `scripts/validate-data.mjs`, `scripts/refresh-sources.test.mjs`, `.github/workflows/refresh-data.yml`
- Modify: `package.json`, `src/pages/SourcesPage.tsx`, `src/lib/dataValidation.ts`

**Interfaces:**
- Consumes `src/data/source-registry.json` and writes `src/data/source-snapshot.json`.
- Produces `npm run refresh:data`, `npm run validate:data`, and per-source health states (`fresh`, `stale`, `error`, `unverified`).

- [x] Write failing script tests for title extraction, snapshot success/failure records, and `--fixture` execution.
- [x] Implement fetch with timeout, HTTP status, title/hash capture, per-source error retention, and non-zero exit only when required sources fail.
- [x] Implement validation of the JSON registry and snapshot, including stale-after-days checks and source URL safety.
- [x] Add daily scheduled refresh plus manual dispatch workflow that opens a pull request with refreshed snapshots.
- [x] Run fixture refresh, validation, and the full suite; run one live refresh against the official URLs when network approval is available.

### Task 3: Complete product interactions and exports

**Files:**
- Create: `src/lib/urlState.ts`, `src/lib/urlState.test.ts`, `src/lib/trend.ts`, `src/lib/trend.test.ts`, `src/lib/csv.ts`, `src/lib/csv.test.ts`, `src/components/AboutDialog.tsx`, `src/components/AboutDialog.test.tsx`
- Modify: `src/App.tsx`, `src/App.test.tsx`, `src/types.ts`, `src/components/MatterTable.tsx`, `src/components/MatterTable.test.tsx`, `src/pages/MattersPage.tsx`, `src/pages/OverviewPage.tsx`, `src/pages/OverviewPage.test.tsx`, `src/pages/AuthoritiesPage.tsx`, `src/data/seed.ts`, `src/styles/app.css`

**Interfaces:**
- `parseTrackerUrl(search): TrackerUrlState` and `serializeTrackerUrl(state): string` own URL filter parsing/serialization.
- `buildTrend(matters, bucketCount): TrendBucket[]` owns cross-year monthly aggregation.
- `mattersToCsv(matters): string` and `downloadMattersCsv(matters)` own export behavior.

- [x] Write failing tests for URL round-trip/safe fallback, cross-year trend buckets, CSV escaping/BOM, table sort controls, About dialog, and Overview navigation.
- [x] Implement sortable matter table columns for date/title/authority.
- [x] Implement URL-synchronized page, scope, search, and non-identity filters.
- [x] Replace the single-count trend strip with an action-aware monthly trend and legend.
- [x] Populate/display single-point-of-contact flags in the authority directory.
- [x] Wire About and “查看事项台账” actions and add CSV export.
- [x] Run targeted UI tests, full tests, and build.

### Task 4: CI, deploy configuration, and operator documentation

**Files:**
- Create: `.github/workflows/ci.yml`, `netlify.toml`, `README.md`, `docs/operations.md`
- Modify: `package.json`, `docs/superpowers/verification/2026-11-19-ai-act-tracker-fidelity.md`

**Interfaces:**
- CI runs `npm ci`, `npm run validate:data`, `npm test -- --run`, and `npm run build`.
- Deploy configuration serves `dist` as an SPA with loopback/local preview instructions preserved.

- [x] Write/adjust command-level validation expectations in operator docs.
- [x] Add CI and Netlify configuration, including SPA fallback and daily refresh handoff.
- [x] Document source inclusion/exclusion rules, refresh workflow, review states, and deployment steps.
- [x] Run the exact CI command sequence locally.

### Task 5: Final rendered verification and handoff

**Files:**
- Modify: `.superpowers/sdd/2026-11-20-ai-act-tracker-production/progress.md`, `docs/superpowers/verification/2026-11-19-ai-act-tracker-fidelity.md`

- [x] Verify Overview, Matters sorting/filter URL, CSV export, About, Authorities, Excluded, Sources health, detail drawer, and adjacent-regime boundary in Browser/IAB.
- [x] Verify narrow-width layout and no uncaught runtime errors.
- [x] Run `npm run validate:data`, `npm test -- --run`, and `npm run build` freshly.
- [x] Record evidence, remaining limitations, and deferred items; only then mark the goal complete.
