# Component: DeleteAssetModal

## 1. Role & Responsibilities
The `<DeleteAssetModal>` is an accessible confirmation modal dialog triggered when the operator clicks the `[Delete]` button in `<TopHeaderBar>`. Its purpose is to prevent accidental permanent deletion of terrain assets and their painted brick cells.

---

## 2. Visual Ergonomics & Dialog Structure

* **Backdrop**:
  * Semi-transparent dark overlay (`bg-black/70 backdrop-blur-sm fixed inset-0 z-50 flex items-center justify-center`).
  * Dismisses on backdrop click ("light dismiss") or `Escape` key press.
* **Dialog Card Container**:
  * Centered responsive modal container (`bg-zinc-900 border border-zinc-800 rounded-lg shadow-2xl max-w-md w-full p-6 text-zinc-100`).
* **Header & Warning Indicator**:
  * Destructive indicator icon: Red warning triangle / trash symbol (`text-red-500 w-6 h-6`).
  * Title: `"Delete Asset?"` (`text-lg font-semibold text-zinc-100`).
* **Body / Message**:
  * Detailed confirmation copy explicitly stating the target asset name and dimensions:
    > *"Are you sure you want to delete **\"Modular Outpost\"** (32×32 studs)? This action cannot be undone and will permanently remove all painted cells."*
* **Footer Actions**:
  * `[Cancel]` (`btn bg-zinc-800 hover:bg-zinc-700 text-zinc-200 px-4 py-2 rounded text-sm font-medium`):
    * Aborts deletion, closes the modal, and returns focus to the header delete button.
  * `[Delete Asset]` (`btn bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded text-sm font-medium`):
    * Dispatches `deleteAsset(assetId)` command to the backend.
    * Closes the dialog.
    * Switches the active session to the next available asset (or creates a blank default asset if none remain).

---

## 3. Web Standards & Accessibility Compliance

Following modern HTML dialog standards:
* **Native Dialog Element**: Implemented with `<dialog>` using the native `.showModal()` API.
* **Focus Management**:
  * Focus is automatically trapped within the modal while open.
  * Initial focus is placed safely on the `[Cancel]` button to avoid accidental keystroke deletion.
* **Keyboard Navigation**:
  * Pressing `Escape` triggers light dismiss / cancels deletion.
  * Standard `Tab` and `Shift+Tab` cycles between `[Cancel]` and `[Delete Asset]`.
* **ARIA Roles**:
  * `role="alertdialog"`, `aria-labelledby="delete-asset-title"`, `aria-describedby="delete-asset-desc"`.

---

## 4. Acceptance Criteria & Test IDs

* `TEST-UI-MODAL-01`: Clicking the `[Delete]` button in the header opens `<DeleteAssetModal>` with initial focus on the Cancel button.
* `TEST-UI-MODAL-02`: The modal body displays the active asset's exact name and dimensions.
* `TEST-UI-MODAL-03`: Clicking `[Cancel]` or pressing `Escape` dismisses the modal without deleting the asset.
* `TEST-UI-MODAL-04`: Clicking `[Delete Asset]` executes the `deleteAsset` API, closes the modal, and switches active asset.
