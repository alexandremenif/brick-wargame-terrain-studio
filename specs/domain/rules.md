# Domain Rules & Invariants

This document formalizes the fundamental rules and invariants governing the domain layer of LEGO Wargame Terrain Studio.

---

## 1. Grid & Spatial Rules

1. **Stud Metric Unit**:
   * All spatial coordinates (`x`, `y`) and dimensions (`width`, `height`) are strictly measured in integral stud counts.
   * Standard physical stud pitch is $8.0\text{ mm} \times 8.0\text{ mm}$.
2. **Configurable Asset Dimensions & Resizing (Option A: Crop & Drop)**:
   * An asset has a name and positive stud dimensions ($width \ge 1$, $height \ge 1$).
   * When an asset is resized to smaller dimensions, any cells that fall outside the new boundary ($x \ge width$ or $y \ge height$) are **permanently cropped and dropped**.
   * If an active bounding box overflows the new dimensions, its boundaries are automatically clamped to fit within the new dimensions, or cleared if entirely outside.
3. **Lenient Surface Painting (Clipping)**:
   * When painting cells or areas, coordinates falling outside the asset surface ($x < 0$, $y < 0$, $x \ge width$, or $y \ge height$) are simply **ignored/clipped**.
   * Brush strokes or bounding box areas that partially overflow the asset boundary do **not** throw errors: only the intersecting cells within $[0, width - 1] \times [0, height - 1]$ are painted.
   * If an entire painted area falls completely outside the asset, 0 cells are affected and the operation completes smoothly without raising an error.
4. **Bounding Box Regions**:
   * An asset may have an active bounding box region $(x, y, width, height)$ defined within its grid.

---

## 2. Official LEGO Color Constraints

* Stud colors must map to standard official LEGO / BrickLink color identifiers (`colorId`).
* Unpainted cells have no applied color ID (`null` / transparent base).
* Standard core palette includes official LEGO shades (such as Bright Green, Dark Tan, Reddish Brown, Medium Stone Grey, Bright Blue, Black, White).
