# Design System Component: Tooltip

## 1. Role & Architectural Boundaries

The `<Tooltip>` component provides non-disruptive, instant contextual information (e.g. brick color name, hex value, tool name, or keyboard shortcut) when hovering or focusing an interactive element in **Brick Wargame Terrain Studio**.

It replaces browser-default `title="..."` attributes in:
* **`<LeftToolboxSidebar>`**: 41 Official brick color swatches (e.g. showing `"Bright Green (#58AB41)"`).
* **Tool Mode & Framing Buttons**: Shortcuts like `Fit to Asset`, `Zoom In (+)` and `Zoom Out (-)`.

---

## 2. Visual Representation & Positioning

* **Container Styling**:
  * `bg-zinc-900 border border-zinc-700 text-zinc-100 text-[11px] font-medium px-2 py-1 rounded shadow-xl pointer-events-none z-50 whitespace-nowrap`.
* **Positioning**:
  * Appears above, below, or to the side of the trigger element with a slight offset (4–6px).
  * Automatically clamped within browser window boundaries to avoid edge clipping.
* **Timing & Transitions**:
  * Micro-delay on hover (~100–150ms) to prevent visual noise during rapid cursor motion.
  * Instant dismiss on mouse leave or `Escape` key press.

---

## 3. Accessibility

* Associates with trigger via `aria-describedby` referencing the tooltip's unique ID.
* Displays upon keyboard focus (`focus-visible`) as well as mouse hover.

---

## 4. Acceptance Criteria & Test IDs

* `TEST-UI-TOOLTIP-01`: Tooltip renders content upon trigger hover or keyboard focus.
* `TEST-UI-TOOLTIP-02`: Pressing `Escape` or moving pointer away dismisses the tooltip immediately.
* `TEST-UI-TOOLTIP-03`: Associates with trigger element via `aria-describedby`.
