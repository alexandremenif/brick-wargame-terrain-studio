# Design System Component: Modal (Dialog)

## 1. Role & Architectural Boundaries

The `<Modal>` component provides an accessible, high-contrast dialog overlay for critical confirmation prompts, destructive warnings, or focused forms in **Brick Wargame Terrain Studio**.

It encapsulates accessible backdrop dimming, modal container framing, keyboard escape handling, and focus management. It is consumed by:
* **`<DeleteAssetModal>`**: Permanent asset deletion confirmation.
* Future studio dialogs (New Asset creation dialog, Export dialog).

---

## 2. Visual Representation & Design Tokens

* **Backdrop Overlay**:
  * Fixed full-screen backdrop: `fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm`.
  * Click on backdrop optionally dismisses non-destructive modals.
* **Dialog Container**:
  * Fixed width or responsive card: `w-full max-w-md rounded-lg border border-zinc-800 bg-zinc-900 p-6 shadow-2xl text-zinc-100`.
* **Standard Layout Sections**:
  * **Header**: Title (`font-semibold text-base text-zinc-100`) and optional descriptive subtitle (`text-xs text-zinc-400 mt-1`).
  * **Body Content**: Modal children/message (`mt-4 text-xs text-zinc-300 leading-relaxed`).
  * **Actions Footer**: Right-aligned action buttons (`mt-6 flex justify-end gap-3`).

---

## 3. Accessibility & Keyboard Interaction (WAI-ARIA)

* **HTML Semantics**: Uses HTML `<dialog>` or `role="dialog"` with `aria-modal="true"`.
* **Focus Management**:
  * Traps focus within the modal container while active (`tab` cycles within modal triggers).
  * Safely defaults initial focus to the least destructive action (e.g. `[Cancel]`).
  * Restores focus to the triggering element upon closure.
* **Escape Key**: Pressing `Escape` dispatches the `onClose` callback to dismiss the modal.

---

## 4. Acceptance Criteria & Test IDs

* `TEST-UI-MODAL-01`: Modal renders centered dialog over semi-transparent dimmed backdrop when `isOpen` is true.
* `TEST-UI-MODAL-02`: Pressing `Escape` key closes the modal and triggers `onClose`.
* `TEST-UI-MODAL-03`: Focus is placed automatically on the configured initial focus element upon opening.
* `TEST-UI-MODAL-04`: Modal does not render in the DOM (or remains hidden) when `isOpen` is false.
