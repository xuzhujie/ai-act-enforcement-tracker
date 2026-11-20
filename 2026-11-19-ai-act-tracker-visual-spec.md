# AI Act Tracker：视觉实现规格

Reference concept: `public/design/ai-act-tracker-concept.png`

## First viewport

- 1440px desktop workbench with a narrow left rail, a simple top bar, a main content canvas, and no marketing hero.
- Top bar: compact brand mark, page context, `AI Act only` control, info affordance, and global search.
- Main rhythm: KPI strip → two authority lanes → latest activity table → scope boundary callout.
- Keep one dominant information frame per section; no nested card grid, no decorative illustration, no full-bleed chart.

## Tokens

- Background: `#F6F8FB` (cool light blue-gray, not cream).
- Surface: `#FFFFFF`.
- Ink: `#16202A`.
- Muted text: `#566274`.
- Border: `#D6DEE9`.
- Primary blue: `#1F5EFF`.
- Investigation: `#1F5EFF`.
- Remediation: `#F29A2E`.
- Penalty: `#E5454C`.
- Guidance: `#7546C9`.
- Success/confirmed: `#2F8F67`.
- Focus: `#1F5EFF` with a 2px outside ring.
- Radius: 10px for surfaces, 7px for controls, 999px only for compact status badges.
- Shadow: low contrast, used only for the drawer and focused floating surfaces.

## Typography

- System sans stack: `Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`.
- Page title: 22px / 1.15 / 700.
- Section title: 18px / 1.2 / 700.
- KPI value: 29px / 1 / 750.
- Body: 14px / 1.45 / 450.
- Table: 13px / 1.35 / 500.
- Labels/meta: 11px / 1.3 / 650 with slight tracking; never below 11px.

## Components

- Top bar is open and flat with a single bottom border.
- Rail is white with a thin right border; the active row is a blue-filled rectangle with a white icon and label.
- KPI strip is one horizontal surface with vertical separators; each metric has a semantic line accent and one descriptive label.
- Authority lanes are two equal-width white surfaces with a blue left rule, a concise description, and four inline action counts.
- Latest activity is a wide white table surface with a simple header, 8 visible rows at desktop, and explicit columns for date, authority, action, matter, status, and source.
- Action badges pair an icon/dot with text. Status badges use text and a light border/fill; color is never the only signal.
- Boundary callout is a bordered white surface with an info icon and two lines of copy.
- Detail drawer is a right-side white sheet with a top close button, matter title, metadata rows, vertical event timeline, and source links.

## Responsive behavior

- Under 960px, the rail becomes a top horizontal scroll row and the two lanes stack.
- Under 720px, the KPI strip becomes a two-column grid, table keeps semantic columns in a horizontal scroll container, and the drawer becomes a full-width bottom/side sheet with a visible close button.
- Preserve text hierarchy and action labels; do not hide the authority split or scope boundary on mobile.

## Motion

- Use a short opacity/translate reveal for the detail drawer and active row only.
- Respect `prefers-reduced-motion: reduce` by removing transitions.
