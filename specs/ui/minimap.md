# Component: Minimap

## 1. Role & Responsibilities
The `<Minimap>` is embedded inside the `<RightInspectorSidebar>`. It provides a birds-eye overview thumbnail of the entire terrain asset ($W \times H$) and visually displays where the current active bounding box $(x, y, \text{width}, \text{height})$ is positioned within the overall asset.

---

## 2. Component Contract

### Input Props
| Prop | Type | Description |
| :--- | :--- | :--- |
| `assetWidth` | Integer | Total asset width in studs ($W$) |
| `assetHeight` | Integer | Total asset height in studs ($H$) |
| `cells` | Array of CellData | Complete list of painted cells for the active asset |
| `colorsById` | Map<Integer, BrickColor> | Color lookup map for thumbnail stud coloring |
| `boundingBox` | BoundingBox object | Active framed region coordinates $(x, y, \text{width}, \text{height})$ |

### Callbacks
| Callback | Arguments | Trigger Condition |
| :--- | :--- | :--- |
| `onCenterAt` | `targetX: Integer, targetY: Integer` | User clicks a point within the minimap canvas |

---

## 3. Visual Representation & Behavior

* **Whole Asset Overview**:
  * Always renders the entire terrain asset from coordinate $(0, 0)$ to $(W - 1, H - 1)$.
  * Renders painted cells using official brick hex colors, and unpainted cells using neutral dark checkerboard matching main canvas transparency.
* **Active Bounding Box Indicator**:
  * Renders a clearly framed region indicator showing the position and size of the current bounding box relative to the full asset:
    $$\text{indicatorX} = \frac{x}{W} \times \text{minimapWidth}, \quad \text{indicatorY} = \frac{y}{H} \times \text{minimapHeight}$$
    $$\text{indicatorW} = \frac{\text{width}}{W} \times \text{minimapWidth}, \quad \text{indicatorH} = \frac{\text{height}}{H} \times \text{minimapHeight}$$
  * When the bounding box equals the full asset ($(0, 0, W, H)$), the indicator covers the entire minimap thumbnail.
* **Interactive Click-to-Center Navigation**:
  * Clicking anywhere on the minimap thumbnail repositions the active bounding box such that its center moves to the clicked asset coordinate $(C_{\text{target}}, R_{\text{target}})$.
  * Current bounding box dimensions ($\text{width}, \text{height}$) are preserved, clamped to valid bounds:
    $$x = \mathrm{clamp}\left(C_{\text{target}} - \left\lfloor\frac{\text{width}}{2}\right\rfloor, 0, W - \text{width}\right)$$
    $$y = \mathrm{clamp}\left(R_{\text{target}} - \left\lfloor\frac{\text{height}}{2}\right\rfloor, 0, H - \text{height}\right)$$
* **Dynamic Responsive Scaling**:
  * The entire $W \times H$ asset is scaled to best fit available container space while preserving stud aspect ratio ($W/H$).
  * Container content box is observed dynamically (`ResizeObserver`), centering the thumbnail with zero stretching.
* **Metrics Badge**:
  * `<wa-badge variant="neutral">` displays current asset dimensions and framed bounding box metrics.

---

## 4. Visual Ergonomics & Layout
* **Container**: `.studio-minimap-container` card with centered content alignment.
* **Thumbnail**: Immediate-mode `<canvas>` element rendered with crosshair cursor.
* **Indicator**: `.studio-minimap-indicator` amber border overlay positioned using percentage coordinates.
* **Footer**: Centered `<wa-badge>` displaying metrics summary.

---

## 5. Acceptance Criteria & Test IDs
* `TEST-UI-MINIMAP-01`: Minimap renders the entire asset ($W \times H$) scaled to fit within the thumbnail container.
* `TEST-UI-MINIMAP-02`: When the active bounding box changes, the bounding box indicator on the minimap updates its position and dimensions proportionally.
* `TEST-UI-MINIMAP-03`: When "Fit to Asset" is clicked, the bounding box indicator expands to cover the entire minimap.
* `TEST-UI-MINIMAP-04`: Painting cells on the canvas immediately reflects those color changes in the minimap thumbnail.
* `TEST-UI-MINIMAP-05`: Clicking a point on the minimap centers the bounding box on that coordinate, preserving dimensions and clamping within asset boundaries.
* `TEST-UI-MINIMAP-06`: Minimap canvas strictly preserves the asset stud aspect ratio ($W/H$) and centers the thumbnail within the container without distortion.
