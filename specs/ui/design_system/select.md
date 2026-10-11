# Design System Component: Select (Dropdown)

## 1. Role & Architectural Boundaries

The `<Select>` primitive provides a standardized, accessible dropdown selection control for switching between catalog items, active assets, or configuration modes in **Brick Wargame Terrain Studio**.

It replaces ad-hoc inline `<select>` markup in:
* **`<TopHeaderBar>`**: Active asset switcher dropdown.

---

## 2. Visual Representation & Design Tokens

| Element / State | Styling & Visual Tokens |
| :--- | :--- |
| **Container & Background** | `bg-zinc-950 border border-zinc-800 text-zinc-200 rounded px-2.5 py-1 text-xs outline-none cursor-pointer` |
| **Hover State** | `hover:border-zinc-700 transition-colors` |
| **Focus State** | `focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600` |
| **Dropdown Menu Options** | Options inherit dark background (`bg-zinc-950 text-zinc-200 py-1`) with high contrast. |
| **Chevron Indicator** | Custom subtle indicator (`text-zinc-400`) or styled native appearance. |

---

## 3. Keyboard Accessibility & Events

* Semantic HTML `<select>` with full native keyboard navigation (Up/Down arrow selection, Space/Enter activation).
* Dispatches `onChange(value)` immediately upon selecting an option.
* Accessible `aria-label` or programmatic association with form labels.

---

## 4. Acceptance Criteria & Test IDs

* `TEST-UI-SELECT-01`: Select renders dark container and border styling conforming to studio tokens.
* `TEST-UI-SELECT-02`: Selecting an option triggers the onChange handler with the selected value.
* `TEST-UI-SELECT-03`: Supports disabled state with lowered opacity and blocked pointer events.
