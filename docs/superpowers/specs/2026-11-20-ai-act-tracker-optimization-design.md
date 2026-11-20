# AI Act Tracker Optimization Design

## Intent

Turn the current source-backed AI Act tracker from a curated MVP into a durable editorial tracker: preserve the strict separation between the AI Office, Member State market-surveillance authorities, EDPS/EU institutions, and adjacent regimes, while making procedure type, multi-stage history, evidence lineage, coverage limits, and refresh health explicit.

## Goals

- Keep the four requested headline buckets distinct: formal investigation, remediation, penalty/decision, and guidance/implementation.
- Prevent information requests, serious-incident reviews, complaint channels, and authority directories from being presented as formal case investigations or penalties.
- Preserve a matter's current stage while exposing historical stages and event-level action labels.
- Tie each event to inspectable sources and retain coverage / last-searched metadata without claiming exhaustive enforcement coverage.
- Strengthen validation so broken authority joins, missing source snapshots, invalid event dates, and incompatible action/status combinations fail before publication.
- Improve authority navigation, filtering, CSV export, URL history behavior, and operational freshness controls.
- Keep the public deployment static and source-backed; no automatic discovery or automatic publication of new enforcement matters.

## Non-goals

- Do not infer enforcement from media coverage, an HTTP page change, a complaint form, or an authority directory alone.
- Do not count GDPR, consumer-protection, DMA, or DSA matters in AI Act KPIs.
- Do not claim that a zero-result Member State lane means zero enforcement.
- Do not add a backend, user accounts, or a case-management workflow in this pass.

## Architecture decisions

1. Keep `actionType` as the four dashboard buckets, and add `actionSubtype` to distinguish formal investigations from information requests, incident reviews, authority infrastructure, corrective measures, sanction decisions, and ordinary guidance.
2. Rename the Matter-level field to `currentActionType`; events remain the source of historical action stages. KPI helpers use `currentActionType`, while latest-activity rows use the latest event's action type and subtype.
3. Add event-level `sourceIds`, `citation`, and optional `sourceLocator` fields. Matter-level sources remain the source registry join and fallback context, but event claims must be traceable.
4. Add a lightweight `coverage` object to each Matter and authority profile. It records the public-source search date, searched source IDs, result status, and a plain-language limitation; it does not represent proof of no enforcement.
5. Keep the source snapshot as the latest health record, but make missing records, invalid metadata, and critical-source staleness visible and build-blocking under explicit thresholds. Content hashes are compared to the previous snapshot when available.
6. Treat the public repository as the canonical deployable tree. Remove flattened root duplicates created during the initial browser upload after the corrected tree is published.

## Review boundaries

- The current AI Office frontier-model record will be recategorized as an information-request / incident-review record unless its official source explicitly confirms a formal investigation.
- Germany's complaints and implementation pages remain authority infrastructure, not an individual investigation, remediation, or penalty.
- The Member State directory remains a 27-country authority directory with per-row links and designation status; it is not a case count.

## Acceptance criteria

- KPI cards and authority lanes distinguish formal investigations from information requests and infrastructure records.
- A multi-stage fixture proves that the latest activity label follows the latest event, while current-stage and historical-stage metrics remain separately queryable.
- Every published event has at least one valid event source reference; all referenced authorities and sources resolve.
- Data validation rejects missing source snapshots, invalid event dates, unknown primary authorities, broken source references, and invalid cross-field combinations.
- Sources show freshness and changed-content status; CI runs the full data/test/build suite and a browser smoke check.
- Local checks pass, the public Pages deployment is rebuilt, and the live Overview, Matters, Authorities, Excluded, and Sources flows are verified.
