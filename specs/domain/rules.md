# Domain Rules & Invariants

This document formalizes the fundamental rules and invariants governing the domain layer of LEGO Wargame Terrain Studio.

---

## 1. Grid & Spatial Invariants

1. **Stud Metric Unit**:
   * All spatial coordinates (`x`, `y`) and dimensions (`width`, `height`) are strictly measured in integral stud counts.
   * Standard physical stud pitch is $8.0\text{ mm} \times 8.0\text{ mm}$.
2. **Arbitrary Asset Dimensions**:
   * Terrain maps and presets are unified assets that can have any positive stud dimensions ($width \ge 1$, $height \ge 1$).
   * Real-world gaming table dimensions (such as $95\text{ cm} \times 180\text{ cm} \approx 118 \times 225$ studs) are contextual presets, not fixed architectural bounds.
3. **Strict Bounds Checking**:
   * Any cell modification at coordinate $(x, y)$ must strictly satisfy:
     $$0 \le x < width \quad \text{and} \quad 0 \le y < height$$
   * Any rectangular operation defined by $\text{BoundingBox}(x, y, w, h)$ must strictly satisfy:
     $$0 \le x \le x + w \le width \quad \text{and} \quad 0 \le y \le y + h \le height$$
   * Any violation must immediately reject the operation and raise a boundary invariant error.

---

## 2. Official LEGO Color Constraints

* Stud colors must map to standard official LEGO / BrickLink color identifiers.
* Unpainted cells have no applied color ID (`null` / transparent base).
* Standard core palette includes:
  * ID 1: Bright Green (`#4B9F4A`)
  * ID 2: Dark Tan (`#958A73`)
  * ID 3: Reddish Brown (`#582A12`)
  * ID 4: Medium Stone Grey (`#A0A5A9`)
  * ID 5: Dark Stone Grey (`#6C6E68`)
  * ID 6: Black (`#05131D`)
  * ID 7: White (`#FFFFFF`)
  * ID 8: Bright Blue (`#0D69AB`)
