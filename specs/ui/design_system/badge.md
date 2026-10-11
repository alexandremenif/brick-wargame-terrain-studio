# Design System Component: Badge (Tag / Metric Pill)

## 1. Role & Architectural Boundaries

The `<Badge>` primitive renders compact metadata pills, status indicators, and coordinate dimensions in **Brick Wargame Terrain Studio**.

It replaces ad-hoc inline pill spans in:
* **`<TopHeaderBar>`**: Active asset name badge.
* **`<Minimap>`**: Thumbnail footer metrics (`Asset: 32×32 | BBox: 15×13 at [9, 5]`).

---

## 2. Visual Representation & Variants

| Variant | Purpose | Styling & Visual Tokens |
| :--- | :--- | :--- |
| `neutral` *(default)* | Structural info, coordinate metrics, dimensions. | `bg-zinc-800/60 border border-zinc-700/50 text-zinc-300 font-mono text-[11px] px-2 py-0.5 rounded` |
| `accent` | Highlighted active selection or asset name. | `bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] px-2 py-0.5 rounded font-medium` |
| `subtle` | De-emphasized background tags. | `bg-zinc-900 text-zinc-400 text-[10px] px-1.5 py-0.5 rounded` |

---

## 3. Acceptance Criteria & Test IDs

* `TEST-UI-BADGE-01`: Badge renders specified variant styling tokens (`neutral`, `accent`, `subtle`).
* `TEST-UI-BADGE-02`: Badge displays children content cleanly with tabular numbers or monospace font when displaying coordinates.
