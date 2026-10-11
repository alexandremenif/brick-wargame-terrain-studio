# Component: TopHeaderBar

## 1. Role & Responsibilities
The `<TopHeaderBar>` sits at the top of the Studio viewport. It provides clean generic project identity, asset switching, new asset creation, and asset dimension controls ($W \times H$).

## 2. Child Components & Controls
* **Project Brand**: Clean generic text/icon logo ("Brick Terrain Studio") with no third-party trademark branding.
* **Asset Selector Dropdown**:
  * Dropdown populated via `listAssets` displaying active asset name (e.g. "Modular Outpost").
  * Selecting an asset switches the active studio session.
* **New Asset Button**:
  * Action button `[+ New Asset]` opening creation dialog/prompt.
* **Dimensions Controls**:
  * Numeric input for `Width` ($W \ge 1, \le 1000$).
  * Numeric input for `Height` ($H \ge 1, \le 1000$).
  * Changing dimensions triggers `updateAssetDimensions(assetId, width, height)`.

## 3. Visual Ergonomics & Layout
* Height: 48px fixed banner (`h-12`).
* Background: `bg-zinc-900 border-b border-zinc-800`.
* Flex layout with left-aligned branding/asset switcher and right-aligned dimensions controls.

## 4. Acceptance Criteria & Test IDs
* `TEST-UI-HEADER-01`: Displays the currently selected asset name.
* `TEST-UI-HEADER-02`: Changing width or height input values dispatches dimension updates and resizes the displayed asset grid.
* `TEST-UI-HEADER-03`: Width and height inputs enforce minimum values ($W \ge 1, H \ge 1$).
