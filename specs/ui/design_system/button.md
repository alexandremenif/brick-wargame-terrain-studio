# Design System Component: Button

## 1. Role & Architectural Boundaries

The `<Button>` component is the foundational interactive trigger primitive for **Brick Wargame Terrain Studio**. It provides consistent visual hierarchy, focus feedback, keyboard accessibility, and state handling across the studio interface.

It replaces ad-hoc inline `<button>` markup in:
* **`<TopHeaderBar>`**: `+ New`, `🗑 Delete`.
* **`<LeftToolboxSidebar>`**: Tool modes (`Brush`, `Eraser`, `Pan`), brush size presets (`1x1` to `32x32`).
* **`<RightInspectorSidebar>`**: Quick actions (`Fit to Asset`, `Zoom In`, `Zoom Out`).
* **`<DeleteAssetModal>`**: Dialog actions (`Cancel`, `Delete Asset`).

---

## 2. Visual Variants & Design Tokens

The button primitive adheres to the studio's dark industrial palette (`zinc-900` / `zinc-950` backdrop with high-contrast accents):

| Variant | Purpose & Context | Styling & Visual Tokens |
| :--- | :--- | :--- |
| `secondary` *(default)* | Standard neutral studio action (`+ New`, `Fit to Asset`, `Cancel`). | Background: `bg-zinc-800 hover:bg-zinc-700`<br/>Border: `border-zinc-700`<br/>Text: `text-zinc-200 hover:text-white` |
| `primary` | Highlighted affirmative action or active confirmation. | Background: `bg-amber-500/20 hover:bg-amber-500/30`<br/>Border: `border-amber-500/80`<br/>Text: `text-amber-300 hover:text-amber-200` |
| `destructive` | Permanent data removal (`Delete Asset`). | Background: `bg-red-950/20 hover:bg-red-950/40`<br/>Border: `border-red-900/50`<br/>Text: `text-red-400 hover:text-red-300` |
| `ghost` / `icon` | Compact framing / zoom buttons (`Zoom In [+]`, `Zoom Out [-]`) and toggles. | Background: `bg-transparent hover:bg-zinc-800`<br/>Border: `border-zinc-800 hover:border-zinc-700`<br/>Text: `text-zinc-300 hover:text-white` |

---

## 3. Sizes & Proportions

| Size | Padding & Typography | Context |
| :--- | :--- | :--- |
| `xs` | `px-2 py-1 text-xs font-medium` | Toolbar tiles, header buttons, inspector zoom/fit actions. |
| `sm` | `px-3 py-1.5 text-xs font-medium` | Inspector full-width triggers, modal confirmation actions. |
| `icon-xs` | `h-7 w-7 p-0 flex items-center justify-center text-xs` | Square icon triggers (Zoom `+` / `-`, pan hand toggle). |

---

## 4. Interactive States & Accessibility

* **Hover State**: Distinct brightness shift and border transition (`transition-colors duration-150`).
* **Active / Selected State (`isActive`)**:
  * Used for selectable tool modes (`Brush`, `Eraser`, `Pan`) and brush size presets.
  * When `isActive={true}`, displays high-contrast selection highlights (`border-amber-500/80 bg-amber-500/20 text-amber-300` or `ring-1 ring-amber-500`).
* **Disabled State (`disabled`)**:
  * Applies `opacity-50 cursor-not-allowed pointer-events-none`.
  * Sets `aria-disabled="true"`.
* **Focus State**:
  * Accessible visible keyboard focus outline: `focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400`.
* **Touch & Keyboard Ergonomics**:
  * Semantic HTML `<button type="button">`.
  * Activatable via both `Enter` and `Space` keys.

---

## 5. Acceptance Criteria & Test IDs

* `TEST-UI-BUTTON-01`: Button renders appropriate styling tokens for each variant (`secondary`, `primary`, `destructive`, `ghost`).
* `TEST-UI-BUTTON-02`: Button renders with specified size tokens (`xs`, `sm`, `icon-xs`).
* `TEST-UI-BUTTON-03`: When `isActive` is true, button renders active selection ring/highlight styling.
* `TEST-UI-BUTTON-04`: Disabled button prevents click dispatch and displays disabled cursor and opacity styling.
* `TEST-UI-BUTTON-05`: Button displays visible focus ring when navigated via keyboard.
