# Design System Specification

Brick Wargame Terrain Studio standardizes all user interface primitives, overlay components, and design tokens on **Web Awesome** (`@awesome.me/webawesome`) using the official **dark theme** (`wa-theme-default wa-dark`).

---

## 1. Design System & Dark Theme

1. **Web Awesome Adoption**: All standard UI controls, input fields, dropdown selectors, modal dialogs, metadata badges, and tooltips directly consume Web Awesome custom elements (`<wa-*>`) and layout utilities (`wa-stack`, `wa-cluster`, `wa-split`, `wa-grid`).
2. **Dark Theme**: The application interface exclusively runs on Web Awesome's dark theme (`wa-dark`). Surface colors, typography, borders, and interactive focus states resolve through Web Awesome dark theme tokens (`--wa-*`).
3. **No Reinvented Primitives**: Inlining raw unstyled HTML control elements (`<button>`, `<input>`, `<select>`, `<dialog>`) or creating custom primitive wrappers is strictly prohibited when a corresponding Web Awesome component exists.
4. **Mockup-to-Implementation Parity**: Declarative HTML mockups (`specs/ui/mockups/*.html`) author the exact same Web Awesome primitives and dark theme classes (`class="wa-theme-default wa-dark"`).

---

## 2. Allowed Domain Exceptions

The following domain-specific elements are exempt from using Web Awesome custom elements:

1. **Palette Color Swatches**: Interactive 1x1 color square buttons (`.color-swatch`) that represent physical brick plastic colors, paired with contextual tooltips for color name and hex identification.
2. **Immediate-Mode Graphics**: Raw HTML `<canvas>` elements utilized for high-performance immediate-mode 2D rendering of the studio grid viewport and minimap thumbnail.
