# Component: TopHeaderBar

## 1. Role & Responsibilities
The `<TopHeaderBar>` sits at the top of the Studio viewport. It provides clean project identity, asset switching, new asset creation, asset deletion trigger, dimension controls ($W \times H$), grid visibility toggle, and print export triggers.

---

## 2. Component Contract

### Input Props
| Prop | Type | Description |
| :--- | :--- | :--- |
| `assetName` | String | Name of the active asset displayed in the header badge |
| `width` | Integer ($\ge 1, \le 1000$) | Width of the active asset in studs |
| `height` | Integer ($\ge 1, \le 1000$) | Height of the active asset in studs |
| `availableAssets` | Array of AssetSummary | List of existing assets available in the studio session |
| `currentAssetId` | String | Identifier of the currently selected asset |
| `showGrid` | Boolean | Whether the canvas reference grid lines are currently active |

### Callbacks
| Callback | Arguments | Trigger Condition |
| :--- | :--- | :--- |
| `onSelectAsset` | `assetId: String` | User selects an asset from the `<wa-select>` dropdown |
| `onNewAsset` | None | User clicks the `[+ New]` button |
| `onDeleteClick` | None | User clicks the `[🗑 Delete]` button |
| `onDimensionsChange` | `width: Integer, height: Integer` | User commits valid new dimensions via `<wa-input>` |
| `onToggleGrid` | None | User clicks the grid toggle button |
| `onExportPrint` | None | User clicks the `[🖨️ Export for Printing]` button |

---

## 3. Child Controls & Web Awesome Primitives
* **Branding Badge & Title**: Visual amber marker and title text within `.wa-cluster`.
* **Asset Selector Dropdown**: `<wa-select size="small">` with child `<wa-option>` elements.
* **Asset Name Badge**: `<wa-badge variant="neutral" appearance="accent">` displaying the current asset name.
* **New Asset Button**: `<wa-button variant="neutral" size="small">` labelled `+ New`.
* **Delete Asset Button**: `<wa-button variant="danger" size="small">` labelled `🗑 Delete`.
* **Dimension Inputs**: Two `<wa-input type="number" size="small">` elements for width and height ($W, H \in [1, 1000]$).
* **Grid Mode Toggle**: `<wa-button size="small">` with active variant highlighting.
* **Export for Printing Button**: `<wa-button variant="neutral" size="small">` triggering JSON-RPC image export.

---

## 4. Visual Ergonomics & Layout
* **Container**: `.studio-header` flex bar spanning full width with `wa-split` distribution.
* **Left Section**: `.wa-cluster` containing brand icon, title, separator divider, `<wa-select>`, `<wa-badge>`, and action buttons.
* **Right Section**: `.wa-cluster` containing dimension inputs, separator divider, grid toggle, and export button.

---

## 5. Acceptance Criteria & Test IDs
* `TEST-UI-HEADER-01`: Displays the currently selected asset name.
* `TEST-UI-HEADER-02`: Changing width or height input values dispatches dimension updates and resizes the displayed asset grid.
* `TEST-UI-HEADER-03`: Width and height inputs enforce minimum values ($W \ge 1, H \ge 1$).
* `TEST-UI-HEADER-04`: Clicking the `[Delete]` button opens the `<DeleteAssetModal>` confirmation dialog.
* `TEST-UI-HEADER-05`: Clicking `[🖨️ Export for Printing]` dispatches an image export request with profile 'print' and downloads `${asset.name}_print.png`.
