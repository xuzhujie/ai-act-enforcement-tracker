# AI Act tracker：视觉与交互核验记录

## Verification surface

- Concept reference: `public/design/ai-act-tracker-concept.png` (generated visual concept; inspected with `view_image`).
- Browser verification: Browser/IAB at the local Vite server (`http://127.0.0.1:4175/`) using the built-in CUA browser; the default desktop surface and a 390×844 viewport were both checked.
- Mobile note: the fresh browser review exercised the responsive layout at 390px. The rail became horizontal navigation, metrics stacked into a compact grid, and the main content remained readable without horizontal overflow in the first viewport.
- Seed verification date shown in UI: `2026-11-20`; official market-surveillance directory source reports `2026-11-09` as its page update.
- Source snapshot: 13 registered official sources were refreshed on `2026-11-19T17:22:23Z`; all 13 returned successfully after the retry-capable refresh. The Sources page retains a separate failure callout for any future 429 / 5xx / network failure and displays retry metadata when present.

## Core interaction path

1. Overview loads with `AI Act only` checked and 10 AI Act seed records: 1 investigation, 0 remediation, 0 penalties, and 9 guidance / implementation records.
2. Matters navigation opens the ledger with authority/action/status/member-state filters.
3. Search and action filters serialize to the URL (`?page=matters&q=Frontier&action=investigation`) and can be safely restored.
4. Unchecking `AI Act only` reveals the 2 adjacent DMA/DSA rows, while the Overview remains AI Act-only.
5. Sorting by matter name changes the table order; CSV export downloads `ai-act-tracker.csv` with the filtered rows.
6. Selecting the AI Office RFI row opens a detail drawer with its official caveat, event timeline, legal basis, evidence level, and source link.
7. Authorities shows the full 27-country directory, zero-count authorities, AI Office, aggregate Member State lane, single-point-of-contact flags, separate EDPS context, and an explicit statement that no public, verifiable Member State case-level investigation, remediation, or penalty is currently included. Germany's Bundesnetzagentur entry is intentionally guidance / implementation infrastructure, not a case action.
8. Excluded and Sources pages render the boundary and provenance views; Sources shows `12/12` editorially verified Matters and all `13/13` live sources currently healthy.

## Fidelity ledger

| Comparison point | Concept evidence | Render evidence | Result / fix |
|---|---|---|---|
| First-viewport hierarchy | Top bar → 5 metrics → 2 authority lanes → activity table | Browser screenshot and AX tree show the same order; the lower table/callout were verified by scroll | Matched; no change |
| Container model | Cool-white workbench, open table/list surfaces, restrained framing | `#F6F8FB` canvas, white surfaces, thin borders, two lanes, table panel, callout panel | Matched; no nested card grid added |
| Authority split | Two equal lanes titled AI Office and Member State market surveillance | Two primary lane panels; EDPS only appears as separate context when data exists | Matched; no material mismatch |
| Action semantics | Blue investigation, orange remediation, red penalties, purple guidance | `Badge` uses icon + text and stable semantic colors; current seed set truthfully shows 1/0/0/9 | Intentional data correction: generated concept’s illustrative counts were not copied into the product |
| Table density and type | Compact 8-row latest-activity table with readable metadata | 10 official AI Act records, 13px table type, source links, status badges, sortable columns, horizontal scroll container | Matched; row count follows source-backed seed data |
| Scope boundary | Prominent exclusion callout for GDPR, consumer protection, DMA, DSA | Chinese boundary callout, Excluded page, adjacent toggle, and KPI separation | Matched and made stricter for the user’s rule |
| Detail state | Closed drawer affordance in concept | Functional right-side drawer with timeline, legal basis, evidence, and source cards | Intentional extension required by the approved workflow; verified by selecting DSA row |
| Typography/copy | Concept uses English sample labels | Product uses Chinese UI labels with official English titles/authority names where useful | Intentional localization; no fake marketing copy added |
| Responsive behavior | Concept keeps rail/table hierarchy at desktop | CSS stacks lanes, changes rail to horizontal nav, makes metrics 2-column, and turns drawer into a full-width sheet under 720px | Matched at the 390×844 Native viewport |

## Above-the-fold copy diff

- No marketing hero, invented slogan, fake case count, or decorative badge was added.
- Visible app labels are limited to the approved shell, AI Act scope language, tracker metrics, authority lanes, latest activity, and boundary copy.
- Generated concept numbers were intentionally replaced by derived seed-set values; this is a source-integrity requirement, not a visual defect.

## Final status

No material desktop, mobile, or core-interaction mismatch remains. The implementation is source-backed and continuously refreshable: 35 tests pass, data validation passes, the production build passes, the live refresh currently reports 13/13 successful sources, and the CI / scheduled-refresh / Netlify handoff is documented. The remaining external step is connecting this workspace to a user-selected GitHub repository and deployment target.
