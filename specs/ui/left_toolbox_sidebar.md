# Component: LeftToolboxSidebar

## 1. Role & Responsibilities
The `<LeftToolboxSidebar>` manages the active drawing modes (Brush, Eraser, Pan), brush size presets ($1\times 1$ up to $32\times 32$), and the catalog of 41 official brick colors.

---

## 2. Component Contract

### Input Props
| Prop | Type | Description |
| :--- | :--- | :--- |
| `toolMode` | Enum (`Brush`, `Eraser`, `Pan`) | Current active interaction mode |
| `brushSize` | Enum (`1x1`, `2x2`, `4x4`, `8x8`, `16x16`, `32x32`) | Footprint dimensions of the painting tool |
| `selectedColorId` | Integer | Identifier of the selected official brick color |
| `colors` | Array of BrickColor | List of 41 official brick colors loaded from domain catalog |

### Callbacks
| Callback | Arguments | Trigger Condition |
| :--- | :--- | :--- |
| `onSelectToolMode` | `mode: ToolMode` | User selects Brush, Eraser, or Pan button |
| `onSelectBrushSize` | `size: BrushSize` | User selects a brush preset button |
| `onSelectColor` | `colorId: Integer` | User clicks an enabled color swatch |

---

## 3. Child Controls & Web Awesome Primitives
* **Tool Mode Selector**: Three `<wa-button size="small">` components (`Brush`, `Eraser`, `Pan`) within `.studio-grid-3col`. The active mode displays the brand variant.
* **Brush Size Presets**: Six `<wa-button size="small">` components representing preset footprints ($1\times 1$, $2\times 2$, $4\times 4$, $8\times 8$, $16\times 16$, $32\times 32$). The active preset displays the brand variant.
* **Official Color Swatches**: Grid of `.color-swatch` tiles displaying exact brick color hex codes, each wrapped or associated with `<wa-tooltip>` displaying color name and hex value. When Tool Mode is `Eraser` or `Pan`, swatches are visually dimmed and interaction is disabled.

---

## 4. Visual Ergonomics & Layout
* **Container**: `.studio-sidebar .studio-sidebar-left .wa-stack` fixed at $19\text{rem}$ ($304\text{px}$) width to comfortably fit tool labels and controls without vertical scrolling.
* **Tool Mode Section**: Upper section with section label and a 3-column button grid.
* **Brush Size Section**: Middle section with section label and a 3-column button grid.
* **Palette Section**: Flexible container with section title and 7-column swatch grid displaying all 41 official brick colors.

---

## 5. Acceptance Criteria & Test IDs
* `TEST-UI-TOOLBOX-01`: Clicking the "Eraser" tool switches drawing mode to clear cells.
* `TEST-UI-TOOLBOX-02`: Selecting any brush size ($1\times 1$, $2\times 2$, $4\times 4$, $8\times 8$, $16\times 16$, $32\times 32$) updates the active brush footprint.
* `TEST-UI-TOOLBOX-03`: Clicking a 1x1 color swatch selects it as active brush color and highlights its visual ring.
* `TEST-UI-TOOLBOX-04`: Clicking the "Pan" tool switches mode to viewport dragging / navigation, disabling color swatch selection.
