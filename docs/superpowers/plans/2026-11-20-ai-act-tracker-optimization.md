# AI Act Tracker Optimization Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the AI Act tracker production-grade for editorial monitoring without overstating formal investigations, enforcement outcomes, or Member State coverage.

**Architecture:** Keep the static Vite/React architecture and curated seed workflow. Split current action from event history, add action subtypes and event-level evidence/coverage metadata, then strengthen validation and operational gates. Publish the corrected tree to the existing GitHub repository and verify the Pages build.

**Tech Stack:** React 19, TypeScript, Vite, Vitest, jsdom, GitHub Actions, GitHub Pages.

**Spec:** `docs/superpowers/specs/2026-11-20-ai-act-tracker-optimization-design.md`

## Global Constraints

- AI Act KPI includes only records whose primary legal basis is the AI Act.
- Headline buckets remain formal investigation, remediation, penalty/decision, and guidance/implementation.
- Information requests, incident reviews, complaints channels, authority directories, GDPR, consumer protection, DMA, and DSA remain explicitly distinguishable and excluded from the wrong KPI.
- No automatic creation of new enforcement matters from source refresh; editorial verification remains mandatory.
- The local workspace remains non-Git; publication uses the existing GitHub Native workflow.

## Review Focus

- A multi-stage matter must not show its current action when the latest event has a different action.
- A source can be reachable while its content changes, so snapshot diffs must be visible and reviewable.
- A source registry can be valid while its snapshot is incomplete; missing records must be detected.
- An authority directory row can exist without being a case; authority infrastructure must not inflate enforcement counts.
- URL back/forward navigation and filtered CSV exports must preserve the same reviewed population.

---

### Task 1: Separate current action, action subtype, and event history

**Files:**
- Modify: `src/types.ts`, `src/data/seed.ts`, `src/lib/filters.ts`, `src/components/Badge.tsx`, `src/components/Timeline.tsx`, `src/components/AuthorityLanes.tsx`, `src/pages/OverviewPage.tsx`, `src/components/MatterTable.tsx`, `src/components/MatterDrawer.tsx`, `src/components/FilterBar.tsx`, `src/lib/urlState.ts`, `src/lib/csv.ts`.
- Test: `src/lib/filters.test.ts`, `src/pages/OverviewPage.test.tsx`, `src/components/Timeline.test.tsx` (create if absent), `src/lib/urlState.test.ts`.

**Interfaces:**
- Produces `ActionSubtype`, `Matter.currentActionType`, `Event.actionSubtype`, `getMatterActionHistory`, and `isFormalInvestigation` helpers.
- Later tasks consume `Matter.currentActionType` and event source references without changing the four headline action buckets.

- [ ] **Step 1: Write failing tests** for an information-request record not counting as a formal investigation, a multi-stage matter exposing historical actions, and Overview latest activity using the latest event action.
- [ ] **Step 2: Run the focused tests** and confirm they fail for the missing fields / current `matter.actionType` behavior.
- [ ] **Step 3: Implement the minimum type, seed, helper, and UI changes**; recategorize the frontier-model record as an information-request subtype and preserve the four headline cards.
- [ ] **Step 4: Run focused tests, then the full Vitest suite** and confirm all pass.

### Task 2: Add event-level evidence and coverage metadata

**Files:**
- Modify: `src/types.ts`, `src/data/seed.ts`, `src/data/editorial-review.json`, `src/components/Timeline.tsx`, `src/components/MatterDrawer.tsx`, `src/pages/AuthoritiesPage.tsx`, `src/lib/csv.ts`.
- Test: `src/lib/dataValidation.test.ts`, `src/components/MatterDrawer.test.tsx`, `src/pages/AuthoritiesPage.test.tsx`.

**Interfaces:**
- Produces `Event.sourceIds`, `Event.citation`, `Event.sourceLocator`, `CoverageRecord`, and event/authority coverage labels.
- Consumes source IDs from the existing source registry and authority IDs from the existing directory.

- [ ] **Step 1: Write failing tests** for invalid event source IDs, missing citations on published events, coverage status rendering, and export of event evidence.
- [ ] **Step 2: Run the focused tests** and observe the expected validation / rendering failures.
- [ ] **Step 3: Implement event evidence, source links, coverage metadata, and the explicit “not publicly verifiable” language.
- [ ] **Step 4: Run the full suite and inspect the drawer, Authorities, and CSV behavior locally.

### Task 3: Strengthen data validation and source freshness

**Files:**
- Modify: `src/lib/dataValidation.ts`, `scripts/validate-data.mjs`, `scripts/refresh-sources.mjs`, `src/types.ts`, `src/data/source-snapshot.json`, `src/pages/SourcesPage.tsx`.
- Test: `src/lib/dataValidation.test.ts`, `scripts/refresh-sources.test.mjs`.

**Interfaces:**
- Produces validation rules for primary authority joins, event/source joins, date ordering, source snapshot completeness, and refresh change status.
- Keeps `getSourceHealth` compatible with the existing Sources page.

- [ ] **Step 1: Write failing tests** for missing snapshot records, unknown primary authorities, invalid event dates, missing event sources, and changed content hashes.
- [ ] **Step 2: Run focused tests and confirm they fail for each missing invariant.
- [ ] **Step 3: Implement validation and snapshot-diff metadata with a bounded refresh concurrency limit.
- [ ] **Step 4: Run fixture refresh, live validation, full tests, and production build.

### Task 4: Improve filters, authority navigation, URL history, and exports

**Files:**
- Modify: `src/types.ts`, `src/lib/filters.ts`, `src/components/FilterBar.tsx`, `src/pages/AuthoritiesPage.tsx`, `src/pages/MattersPage.tsx`, `src/App.tsx`, `src/lib/urlState.ts`, `src/lib/csv.ts`.
- Test: `src/lib/filters.test.ts`, `src/lib/urlState.test.ts`, `src/pages/AuthoritiesPage.test.tsx`, `src/App.test.tsx`, `src/lib/csv.test.ts`.

**Interfaces:**
- Preserves existing query parameters and adds scope, evidence level, and action-history filters without changing adjacent-regime exclusion semantics.
- Authority directory links remain source-backed and do not become case counts.

- [ ] **Step 1: Write failing tests** for browser popstate restoration, event-search coverage, authority selection, and evidence/event columns in CSV.
- [ ] **Step 2: Run the focused tests and confirm the new interaction assertions fail.
- [ ] **Step 3: Implement the scoped filters, clickable authority navigation, popstate synchronization, and richer export.
- [ ] **Step 4: Run the full suite and verify the relevant rendered flows.

### Task 5: Harden CI, deployment, and review operations

**Files:**
- Modify: `.github/workflows/ci.yml`, `.github/workflows/refresh-data.yml`, `.github/workflows/deploy-pages.yml`, `README.md`, `docs/operations.md`, `netlify.toml` if needed.
- Create: `scripts/smoke-test.mjs` or a minimal browser smoke workflow using the already available test stack.
- Test: CI configuration parsing / smoke command locally, then GitHub Actions runs after publication.

**Interfaces:**
- CI must continue to run data validation, tests, and build; refresh PRs remain manual-review gates.
- Pages remains the public deployment; Netlify configuration remains a secondary import path.

- [ ] **Step 1: Write the failing smoke assertion / freshness gate test** and verify it detects an invalid or stale snapshot.
- [ ] **Step 2: Implement supported Node version, action pinning or documented upgrade policy, freshness threshold, and browser smoke coverage.
- [ ] **Step 3: Run local CI-equivalent commands and inspect generated production output.
- [ ] **Step 4: Publish workflow changes and verify CI, Pages, and scheduled-refresh configuration on GitHub.

### Task 6: Clean the public repository tree and publish the optimized artifact

**Files:**
- Modify/remove: flattened duplicate files at the GitHub repository root created by the initial browser upload; preserve canonical files under `src/`, `scripts/`, `docs/`, `public/`, and `.github/workflows/`.
- Update: optimization plan ledger and public README if paths change.

- [ ] **Step 1: Verify the corrected canonical tree and enumerate duplicates before deletion.
- [ ] **Step 2: Delete only confirmed flattened duplicates through GitHub Native UI, leaving root build files intact.
- [ ] **Step 3: Upload changed canonical files in directory-scoped batches and confirm the latest main tree.

### Task 7: Final rendered and requirement-level verification

**Files:**
- Verify: local app, public Pages app, GitHub Actions runs, source snapshot, and optimization ledger.

- [ ] **Step 1: Run `npm run check` and record exact counts.
- [ ] **Step 2: Verify Overview, Matters, Authorities, Excluded, Sources, drawer, filters, URL back/forward, CSV, mobile layout, and console logs.
- [ ] **Step 3: Verify public Pages deployment and CI run against the final commit.
- [ ] **Step 4: Reconcile every acceptance criterion in the design spec and mark the goal complete only after all are evidenced.
