# AI Act Tracker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a source-backed React dashboard that tracks EU AI Act matters by authority lane and action type while keeping GDPR, consumer-protection, DMA, and DSA records out of AI Act KPIs.

**Architecture:** A React + Vite + TypeScript single-page workbench with local state and a pure data/query layer. `Matter` represents one matter with a current primary action plus historical events; shared filters derive Overview metrics, authority lanes, tables, timelines, and the Excluded view from the same seed data.

**Tech Stack:** React, TypeScript, Vite, CSS, Vitest, semantic HTML, inline SVG icons. No backend, auth, external chart library, or UI kit in the first version.

**Spec:** `docs/superpowers/specs/2026-11-19-ai-act-tracker-design.md`

## Global Constraints

- Default view is AI Act only; GDPR, consumer protection, DMA, DSA, and other regimes are retained as excluded/adjacent records and never count in Overview KPI.
- A `Matter` is one matter thread; investigation, remediation, penalty, and guidance are explicit action types and events, not generic labels.
- Overview always uses AI Act-only data; the adjacent-regime switch affects list/activity surfaces without polluting KPI, authority lanes, or trend calculations.
- Authorities contains the complete official Member State market-surveillance directory, including authorities with zero tracked matters, plus a separate EDPS context.
- Every seeded record carries an official source URL, publisher, evidence level, and last-verified date; the dataset is clearly labeled as a local seed set.
- Use the visual system from the spec: `#F6F8FB` background, white surfaces, deep ink text, `#1F5EFF` blue action color, restrained orange/red/purple semantic colors, and no decorative hero or fake metrics.
- UI controls and information labels are code-native, keyboard reachable, and do not depend on color alone.
- No live crawler or legal conclusion is implied by the UI; “no seed record” is not presented as “no real-world action.”

## Review Focus

- A matter with investigation and remediation history must count once under its current primary action, not once per historical event. Test in `src/lib/filters.test.ts` with a multi-event matter.
- A pure GDPR/consumer-protection/DMA/DSA matter must never affect AI Act KPI, lane, or trend counts. Test both `getOverviewMetrics()` and `getVisibleMatters()` with adjacent seed records.
- Turning off `AI Act only` must reveal adjacent rows/activity while Overview KPI and authority lanes remain AI Act-only. Test the two query paths separately.
- Supporting authorities must appear in matter detail without duplicating primary lane or KPI counts. Test `getAuthorityCounts()` with a multi-authority matter.
- Search and empty filters must remain usable: an unmatched query yields an explicit empty state, and clearing it restores the full AI Act seed set. Test `filterMatters()` for both cases.

## File Map

- Create `package.json`, `index.html`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `vite.config.ts`, `vitest.config.ts` — Vite app, TypeScript, test scripts, and browser-like test environment.
- Create `src/main.tsx` — React entry point and global stylesheet import.
- Create `src/types.ts` — domain types for matters, events, authorities, sources, filters, and derived metrics.
- Create `src/data/seed.ts` — official-source seed matters, excluded matters, and the complete authority directory captured on 2026-11-09/19 from the Commission pages.
- Create `src/lib/filters.ts` — pure filtering, grouping, KPI, sorting, and authority-count functions.
- Create `src/lib/filters.test.ts` — unit tests for the review focus and classification invariants.
- Create `src/styles/tokens.css` — color, type, spacing, radii, shadows, responsive breakpoints, and semantic status classes.
- Create `src/components/icons.tsx` — small inline SVG icon set using `currentColor` with consistent stroke weight.
- Create `src/components/AppShell.tsx` — top bar, side navigation, global search, AI Act-only control, and page frame.
- Create `src/components/FilterBar.tsx` — search, authority, action type, status, and regime controls.
- Create `src/components/MetricStrip.tsx` — KPI row with accessible labels and count descriptions.
- Create `src/components/AuthorityLanes.tsx` — AI Office and Member State market-surveillance lanes; EDPS stays separate.
- Create `src/components/MatterTable.tsx` — sortable table/list row presentation with keyboard selection and empty state.
- Create `src/components/MatterDrawer.tsx` — selected matter summary, inclusion boundary, event timeline, and source links.
- Create `src/components/Timeline.tsx` — reusable event list for matter details and recent activity.
- Create `src/components/Badge.tsx` — action-type, status, evidence, and regime badges with text plus icon.
- Create `src/pages/OverviewPage.tsx` — overview composition, metrics, lanes, activity feed, boundary callout, and trend strip.
- Create `src/pages/MattersPage.tsx` — matter table plus filters and selected drawer.
- Create `src/pages/AuthoritiesPage.tsx` — official directory with tracked-count and source metadata.
- Create `src/pages/ExcludedPage.tsx` — adjacent regime index with explicit non-AI-Act explanation.
- Create `src/pages/SourcesPage.tsx` — source methodology and official reference list.
- Create `src/App.tsx` — page state, derived data wiring, navigation state, and composition glue only.

### Task 1: Scaffold the app and visual concept

**Files:**
- Create: `package.json`, `index.html`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `vite.config.ts`, `vitest.config.ts`
- Create: `src/main.tsx`
- Create: `src/styles/tokens.css`
- Create: `docs/superpowers/specs/2026-11-19-ai-act-tracker-visual-spec.md`

**Interfaces:**
- Produces `npm run dev`, `npm run build`, and `npm test` scripts plus the global token layer that later components import.

- [ ] **Step 1: Generate the complete primary-screen visual concept**

  Use Image Gen for one readable 1440×960 desktop dashboard concept that includes the full shell, KPI strip, the two authority lanes, latest-activity table, exclusion callout, and a closed detail-drawer affordance. Require the approved visual direction: cold white workbench, deep ink, EU blue, restrained semantic colors, open table/list layout, no marketing hero, no fake logos, no extra product claims, and no decorative gradients.

- [ ] **Step 2: Record the visual inventory in `docs/superpowers/specs/2026-11-19-ai-act-tracker-visual-spec.md`**

  Capture the concept’s exact background/surface colors, type hierarchy, component geometry, spacing scale, border/radius/shadow choices, icon treatment, first-viewport composition, responsive collapse, and the allowed visible copy. This file becomes the implementation reference alongside the approved product design.

- [ ] **Step 3: Write the Vite/TypeScript/test scaffold**

  Add React 18/19-compatible dependencies, `vite`, `typescript`, `vitest`, `jsdom`, and the React type packages. Expose scripts `dev`, `build`, `preview`, and `test`. Configure Vitest for TypeScript and jsdom without adding a browser E2E runner.

- [ ] **Step 4: Implement the entry point and base tokens**

  Mount `<App />` in `src/main.tsx`; import `tokens.css`; define CSS custom properties for the approved palette, semantic action colors, type scale, spacing, focus ring, drawer shadow, and mobile breakpoint. Include a reduced-motion rule and global box-sizing/reset styles.

- [ ] **Step 5: Run the scaffold checks**

  Run `npm install`, `npm test -- --run`, and `npm run build`.

  Expected: install completes, Vitest reports no test files yet without failing, and Vite emits a production build.

### Task 2: Build the domain model, official seed data, and pure query layer

**Files:**
- Create: `src/types.ts`
- Create: `src/data/seed.ts`
- Create: `src/lib/filters.ts`
- Create: `src/lib/filters.test.ts`

**Interfaces:**
- Produces `Matter`, `Event`, `Source`, `AuthorityProfile`, `FilterState`, and `OverviewMetrics` types.
- Produces `filterMatters(matters, filters, includeAdjacent): Matter[]`, `getOverviewMetrics(aiActMatters): OverviewMetrics`, `getLatestEvent(matter): Event`, `getAuthorityCounts(matters, authorities): AuthorityCount[]`, and `sortMatters(matters, sort): Matter[]`.

- [ ] **Step 1: Write failing tests for the classification invariants**

  Add tests named `counts_current_action_once`, `excludes_adjacent_regimes_from_ai_act_metrics`, `keeps_overview_ai_act_only_when_adjacent_is_visible`, `does_not_duplicate_supporting_authorities`, and `returns_empty_state_input_for_unmatched_search`. Assert exact counts and IDs using a small in-test fixture before relying on the full seed data.

- [ ] **Step 2: Define the domain types**

  Add discriminated string unions for `Regime`, `AuthorityLane`, `ActionType`, `MatterStatus`, `EvidenceLevel`, `Scope`, and `AppPage`. Extend the approved model with `relatedRegimes?: Regime[]` and `supportingAuthorities?: string[]`. Add `primaryAuthorityId` so authority counts never depend on display strings.

- [ ] **Step 3: Implement the query functions**

  Keep functions pure and deterministic. `getOverviewMetrics()` must operate only on records with `regime === 'ai-act'` and use the current `actionType`/status combinations from the spec. `filterMatters()` must default to AI Act-only, optionally include adjacent records only in list/activity surfaces, and never mutate inputs. `getAuthorityCounts()` increments only `primaryAuthorityId`; `getLatestEvent()` returns the newest event by ISO date, with the matter’s update date as a tie-breaker.

- [ ] **Step 4: Add official seed data**

  Add a small, honest AI Act seed set focused on official guidance/implementation records and any official formal action pages that are explicitly available. Add adjacent DMA/DSA/GDPR/consumer-protection examples only when the source itself is official and label them with an exclusion reason. Add the official Member State authority directory, including zero-record authorities, and a separate EDPS profile. Every record must include source URL, evidence level, publication/update date, and `lastVerifiedAt`.

- [ ] **Step 5: Run the unit tests and fix classification failures**

  Run `npm test -- --run src/lib/filters.test.ts`.

  Expected: all classification, KPI, exclusion, authority-count, and empty-search tests pass; no test asserts a global claim about real-world enforcement.

### Task 3: Implement the application shell and Overview workbench

**Files:**
- Create: `src/components/icons.tsx`, `src/components/Badge.tsx`, `src/components/AppShell.tsx`, `src/components/MetricStrip.tsx`, `src/components/AuthorityLanes.tsx`, `src/components/Timeline.tsx`
- Create: `src/pages/OverviewPage.tsx`
- Modify: `src/App.tsx`
- Modify: `src/styles/tokens.css`

**Interfaces:**
- `AppShell` consumes current page, search, adjacent-regime toggle, and navigation callbacks.
- `OverviewPage` consumes `Matter[]`, `AuthorityProfile[]`, `OverviewMetrics`, and a selected-matter callback.
- `Badge` consumes `{ kind, value }` and renders text plus an inline SVG icon; it never uses color alone.

- [ ] **Step 1: Implement the shell frame**

  Create semantic top bar, left navigation, skip link, main landmark, global search input, and `AI Act only` switch. Navigation buttons update local `AppPage` state without a router. The shell must preserve focus visibility and expose the current page to assistive technology.

- [ ] **Step 2: Implement shared badges and icons**

  Use inline SVG with a shared viewBox and consistent stroke width for search, building, investigation, wrench/remediation, gavel/penalty, guide, arrow, close, and external-link metaphors. Action badges must show both an icon and text; status badges use text and a neutral border.

- [ ] **Step 3: Implement KPI strip and authority lanes**

  Render the five approved summary metrics with a small label, count, and descriptive line. Render exactly two primary lanes—AI Office and Member State MSA—with current matters sorted by latest event; render EDPS only in a separate context row if it has data.

- [ ] **Step 4: Implement Overview activity and boundary callout**

  Add the latest-activity list and a compact CSS/SVG trend strip derived from AI Act seed data. Add the boundary callout stating that GDPR, consumer protection, DMA, and DSA items are not included in AI Act KPI. Make each row selectable for the detail drawer that Task 4 supplies.

- [ ] **Step 5: Wire App state to Overview**

  Keep `App.tsx` as composition glue: initialize page/search/filters/selected matter/adjacent toggle, derive AI Act-only metrics separately from list-visible matters, and pass callbacks down. Do not duplicate classification rules in components.

- [ ] **Step 6: Run build and a smoke test**

  Run `npm run build` and `npm test -- --run`.

  Expected: the app builds and the existing query tests remain green; opening the dev server renders the Overview without console errors.

### Task 4: Implement Matters, Authorities, Excluded, Sources, and the detail drawer

**Files:**
- Create: `src/components/FilterBar.tsx`, `src/components/MatterTable.tsx`, `src/components/MatterDrawer.tsx`
- Create: `src/pages/MattersPage.tsx`, `src/pages/AuthoritiesPage.tsx`, `src/pages/ExcludedPage.tsx`, `src/pages/SourcesPage.tsx`
- Modify: `src/App.tsx`, `src/components/AppShell.tsx`, `src/components/Timeline.tsx`, `src/styles/tokens.css`

**Interfaces:**
- `FilterBar` consumes/updates `FilterState` and emits a normalized filter object.
- `MatterTable` consumes visible matters and `onSelect(matterId)`; it renders an explicit empty state when the array is empty.
- `MatterDrawer` consumes `Matter | null` and `onClose`; it must render the inclusion/exclusion note, event timeline, evidence level, and source links.

- [ ] **Step 1: Implement filter controls and list behavior**

  Add search, authority lane, action type, status, and member-state selectors. Search title, short title, authority, subject, and legal basis case-insensitively. Show active filters as removable tokens; clearing all restores the AI Act seed set.

- [ ] **Step 2: Implement the matters table**

  Render date, matter, authority, action type, status, legal basis, and source columns on desktop. On narrow screens keep the same semantic fields in a horizontally scrollable table with a sticky first column; do not replace the table with repeated cards. Rows are keyboard selectable and open the drawer.

- [ ] **Step 3: Implement the detail drawer and event timeline**

  The drawer shows title, authority lane, subject, current action/status, inclusion boundary, related regimes, legal basis, chronological events, source links with external-link icons, and last-verified date. Closing returns focus to the row that opened it.

- [ ] **Step 4: Implement Authorities**

  Render the full official directory with member state, authority, single-point-of-contact marker, tracked matter count, and source. Display a clear zero-record state for authorities with no seed matter. Put EDPS in a separate section labeled EU institutions.

- [ ] **Step 5: Implement Excluded and Sources**

  Excluded lists only non-AI-Act records, with regime badge, exclusion reason, source, and “not counted in Overview” copy. Sources explains the official-source-first method, evidence levels, last-verified date, and links to the AI Act governance/enforcement, market-surveillance, DMA, and DSA reference pages.

- [ ] **Step 6: Wire all pages and verify local state**

  Connect navigation and selected matter state in `App.tsx`. Verify that adjacent records can be revealed in Matters/Latest activity without changing Overview KPI/lanes/trend. Verify drawer selection survives filter changes by closing itself if the selected matter is no longer visible.

- [ ] **Step 7: Run tests and production build**

  Run `npm test -- --run` and `npm run build`.

  Expected: all unit tests pass and the production build completes with no TypeScript errors.

### Task 5: Browser verification, responsive fixes, and handoff

**Files:**
- Modify: any implementation files with verified visual/interaction fixes
- Create: `docs/superpowers/verification/2026-11-19-ai-act-tracker-fidelity.md`

**Interfaces:**
- Verification artifact records desktop/mobile viewport, core interaction path, at least five visual comparisons, copy diff, and any intentional deviations.

- [ ] **Step 1: Start the dev server and inspect in Browser/IAB**

  Run `npm run dev -- --host 127.0.0.1` and load the local app in the Browser/IAB first. Confirm first viewport, Overview scroll, navigation, search, filters, row selection, drawer, Excluded view, and Sources links.

- [ ] **Step 2: Verify responsive behavior**

  Inspect the desktop viewport and a mobile-sized viewport. Check that navigation collapses without hiding the current page, metrics remain readable, authority lanes stack, tables scroll intentionally, and the drawer fits or becomes a full-height sheet.

- [ ] **Step 3: Compare concept and implementation screenshots**

  Use `view_image` on the accepted Image Gen concept and latest browser screenshot. Inspect at least five concrete points: palette/background, first-viewport hierarchy, two authority lanes, table density and type scale, action badges/icons, drawer treatment, and mobile overflow.

- [ ] **Step 4: Write the fidelity ledger and copy diff**

  Record mismatches, evidence, fixes, and any intentional deviations in `docs/superpowers/verification/2026-11-19-ai-act-tracker-fidelity.md`. Confirm no unapproved visible hero copy, fake metrics, invented regimes, or adjacent-regime rows in AI Act KPI.

- [ ] **Step 5: Re-run final checks**

  Run `npm test -- --run` and `npm run build` after visual fixes. The handoff is complete only when the core interaction path works, the build is green, and no material visual mismatch remains.

## Self-review

- **Spec coverage:** scope rule and excluded regime separation are handled in Task 2 and Task 4; authority lanes/directory in Tasks 3–4; official sources and source methodology in Tasks 2 and 4; visual system and responsive behavior in Tasks 1, 3, and 5; verification in Task 5.
- **Step scan:** each step has a single checkable output; code tasks point to exact files and interfaces; tests are attached to the pure query layer and browser verification.
- **Type consistency:** `primaryAuthorityId`, `supportingAuthorities`, `relatedRegimes`, `FilterState`, and `OverviewMetrics` are introduced in Task 2 before any consuming component task.
- **Review focus:** all five failure modes have named tests in Task 2 and corresponding UI checks in Tasks 3–5.
- **Proportion:** the plan keeps logic and component boundaries explicit without prescribing implementation bodies beyond classification rules pinned by the spec.

## Execution note

The current workspace is not a Git repository, so implementation should not initialize Git or add commits. Keep the deliverable as a working file tree and report the lack of repository history during handoff.
