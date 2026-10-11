# Component: TopHeaderBar

## 1. Role & Responsibilities
The `<TopHeaderBar>` sits at the top of the Studio viewport. It provides clean generic project identity, asset switching, new asset creation, asset deletion trigger, and asset dimension controls ($W \times H$).

## 2. Child Components & Controls
* **Project Brand**: Clean generic text/icon logo ("Brick Wargame Terrain Studio") with no third-party trademark branding.
* **Asset Selector Dropdown**:
  * Dropdown populated via `listAssets` displaying active asset name (e.g. "Modular Outpost").
  * Selecting an asset switches the active studio session.
* **Bootstrapping & Empty State Prompt**:
  * If the database contains no assets when the application loads, the studio immediately prompts the user with a modal dialog to create their first asset.
  * When the active asset is deleted: if other assets exist, the studio switches to the next available asset; if no assets remain, the studio presents the create asset prompt.
* **New Asset Button**:
  * Action button `[+ New]` opening creation dialog/prompt.
* **Delete Asset Button**:
  * Destructive action button `[🗑 Delete]` styled with warning/danger hover feedback (`text-red-400 hover:text-red-300 hover:bg-red-950/40 border border-red-900/50`).
  * Clicking triggers the confirmation modal `<DeleteAssetModal>` (see [`delete_asset_modal.md`](./delete_asset_modal.md)).
* **Dimensions Controls**:
  * Numeric input for `Width` ($W \ge 1, \le 1000$).
  * Numeric input for `Height` ($H \ge 1, \le 1000$).
  * Changing dimensions triggers `updateAsset(assetId, width, height)`.
  * **Crop Warning on Downsizing**: When shrinking an asset dimension (e.g. from $32 \times 32$ to $16 \times 16$), cells outside the new dimensions will be permanently removed. The UI prompts with a confirmation warning before applying the reduction if painted cells will be cropped.
* **Grid Mode Toggle**:
  * Toggle button `[Grid: On / Off]` switching continuous stud surface versus overlaid reference grid lines on the canvas viewport.

## 3. Visual Ergonomics & Layout
* Height: 48px fixed banner (`h-12`).
* Background: `bg-zinc-900 border-b border-zinc-800`.
* Left section: Branding, Asset selector dropdown, `[+ New]` button, and `[Delete]` button.
* Right section: Dimension inputs ($W \times H$) and Grid Mode toggle.

## 4. Acceptance Criteria & Test IDs
* `TEST-UI-HEADER-01`: Displays the currently selected asset name.
* `TEST-UI-HEADER-02`: Changing width or height input values dispatches dimension updates and resizes the displayed asset grid.
* `TEST-UI-HEADER-03`: Width and height inputs enforce minimum values ($W \ge 1, H \ge 1$).
* `TEST-UI-HEADER-04`: Clicking the `[Delete]` button opens the `<DeleteAssetModal>` confirmation dialog.
