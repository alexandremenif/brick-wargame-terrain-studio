# Component: RightInspectorSidebar

## 1. Role & Responsibilities
The `<RightInspectorSidebar>` hosts the `<Minimap>` thumbnail overview and provides numerical coordinate controls to configure active bounding box parameters $(x, y, \text{width}, \text{height})$ alongside framing actions (Fit to Asset, Zoom In, Zoom Out).

---

## 2. Component Contract

### Input Props
| Prop | Type | Description |
| :--- | :--- | :--- |
| `assetWidth` | Integer | Total asset width in studs ($W$) |
| `assetHeight` | Integer | Total asset height in studs ($H$) |
| `cells` | 2D Array of Integer (`number[][]`) | Row-major 2D matrix of cell color IDs (`0` for unpainted) across the entire asset |
| `colorsById` | Map<Integer, BrickColor> | Color catalog map for rendering minimap thumbnails |
| `boundingBox` | BoundingBox object | Active framed region coordinates $(x, y, \text{width}, \text{height})$ |

### Callbacks
| Callback | Arguments | Trigger Condition |
| :--- | :--- | :--- |
| `onBoundingBoxChange` | `bbox: BoundingBox` | User commits valid numeric changes to $x, y, \text{width}$, or $\text{height}$ |
| `onFitToAsset` | None | User clicks the `[Fit to Asset]` button |
| `onZoomIn` | None | User clicks the `[Zoom In (+)]` button |
| `onZoomOut` | None | User clicks the `[Zoom Out (-)]` button |
| `onCenterAt` | `x: Integer, y: Integer` | User clicks a point on the minimap canvas |

---

## 3. Child Controls & Web Awesome Primitives
* **Minimap Panel**: Hosts `<Minimap>` providing thumbnail overview with real-time bounding box indicator.
* **Coordinate Inputs**: Four `<wa-input type="number" size="small">` elements for $X, Y, \text{Width}, \text{Height}$ organized within `.studio-grid-2col`. Inputs validate ranges and reject invalid or out-of-bounds coordinates on commit.
* **Zoom Buttons**: Two `<wa-button size="small">` elements for `Zoom In (+)` and `Zoom Out (-)`. Zoom In is disabled when the bounding box reaches $1\times 1$. Zoom Out is disabled when framing the full asset.
* **Fit to Asset Button**: Full-width `<wa-button size="small">` disabled when already matching full asset dimensions.

---

## 4. Visual Ergonomics & Layout
* **Container**: `.studio-sidebar .studio-sidebar-right .wa-stack` fixed at $16\text{rem}$ ($256\text{px}$) width with standard padding.
* **Upper Section**: Minimap thumbnail container and metric badge.
* **Separator**: 1px horizontal surface border divider.
* **Middle Section**: Numerical coordinate grid and zoom action buttons.
* **Lower Section**: Full-width "Fit to Asset" action button.

---

## 5. Acceptance Criteria & Test IDs
* `TEST-UI-INSPECTOR-01`: Editing X, Y, Width, or Height values to valid numbers updates the active bounding box parameters, shifts the framed area in the canvas viewport, and moves the minimap indicator.
* `TEST-UI-INSPECTOR-02`: Entering an invalid bounding box value rejects the input and reverts to the previous valid value.
* `TEST-UI-INSPECTOR-03`: Clicking "Fit to Asset" sets bounding box dimensions to match the full asset ($0, 0, W, H$).
* `TEST-UI-INSPECTOR-04`: Clicking "Zoom In" scales down bounding box dimensions by ~25% down to $1 \times 1$, centered at the current view center.
* `TEST-UI-INSPECTOR-05`: Clicking "Zoom Out" scales up bounding box dimensions by ~25% up to full asset dimensions, centered at the current view center.
* `TEST-UI-INSPECTOR-06`: "Zoom In" is disabled when bounding box is $1\times 1$.
* `TEST-UI-INSPECTOR-07`: "Zoom Out" and "Fit to Asset" are disabled when bounding box equals the full asset $(0, 0, W, H)$.
