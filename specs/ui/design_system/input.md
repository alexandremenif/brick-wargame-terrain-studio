# Design System Component: Input & NumberInput

## 1. Role & Architectural Boundaries

The `<Input>` and `<NumberInput>` primitives are the standard single-line text and numeric entry components for **Brick Wargame Terrain Studio**. They provide uniform dark industrial aesthetics, consistent keyboard interaction, validation states, and accessible labels.

They replace ad-hoc inline `<input>` markup in:
* **`<TopHeaderBar>`**: Asset width (`W`) and height (`H`) dimensions inputs.
* **`<RightInspectorSidebar>`**: Bounding box coordinate inputs (`X Origin`, `Y Origin`, `Width`, `Height`).

---

## 2. Visual Variants & Styling Tokens

| Element / State | Styling & Visual Tokens |
| :--- | :--- |
| **Container & Background** | `bg-zinc-950 border border-zinc-800 text-zinc-200 rounded px-2 py-1 text-xs` |
| **Hover State** | `hover:border-zinc-700 transition-colors` |
| **Focus State** | `focus:border-zinc-600 focus:outline-none focus:ring-1 focus:ring-zinc-600` |
| **Invalid State (`isInvalid`)** | `border-red-800 bg-red-950/20 text-red-300 focus:border-red-600 focus:ring-red-600` |
| **Disabled State (`disabled`)** | `opacity-50 cursor-not-allowed bg-zinc-900 border-zinc-800 text-zinc-500` |

---

## 3. Specialized Behaviors: `<NumberInput>`

* **Alignment**: Numeric values in compact inline forms are right-aligned or centered (`text-right` or `text-center`).
* **Value Commit on Blur & Enter**:
  * Input value is buffered in local component state while typing.
  * Value is committed to the parent onChange callback upon `blur` or when the operator presses the `Enter` key.
* **Rejection / Revert Animation**:
  * When an entered value violates domain boundaries (e.g. non-positive dimension or coordinate overflowing asset bounds), `<NumberInput>` displays the invalid state momentarily and safely reverts to the previous valid value upon blur.
* **Step Controls / Up-Down Arrows**:
  * Native spin buttons are styled or suppressed (`[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none`) in favor of keyboard arrow handling.

---

## 4. Acceptance Criteria & Test IDs

* `TEST-UI-INPUT-01`: Input renders dark container, font, and border styling matching the studio palette.
* `TEST-UI-INPUT-02`: When `isInvalid` is true, displays error border and focus ring styling.
* `TEST-UI-INPUT-03`: NumberInput commits changes on blur and on Enter key press.
* `TEST-UI-INPUT-04`: Disabled input prevents user interaction and displays disabled styling tokens.
