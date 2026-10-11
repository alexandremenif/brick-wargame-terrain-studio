# Domain Specification

The domain layer encapsulates the core logic, entities, invariants, and commands of the Brick Wargame Terrain Studio without any knowledge of network protocols, databases, or user interfaces.

---

## 1. Ubiquitous Language

* **Stud**: The fundamental quantum of measurement ($8.0\text{ mm} \times 8.0\text{ mm}$).
* **Asset**: A 2D discrete coordinate grid with a name and configurable dimensions ($width \times height$) holding cells.
* **Cell**: A discrete stud position $(x, y)$ that can be unpainted or customized with an official brick color.
* **BoundingBox**: An axis-aligned rectangular region defined by $(x, y, width, height)$ in studs.
* **BrickColor**: An official brick color identified by numeric code, official name, and hexadecimal RGB value.

---

## 2. Declarative Domain Schemas & Catalogs

Domain entities, command contracts, and static catalogs are formally specified under `specs/domain/`:
* [`colors.csv`](./colors.csv): Canonical tabular list of all 41 official brick colors (`id`, `name`, `hex`).
* [`schemas/model.yaml`](./schemas/model.yaml): Domain entities (`BoundingBox`, `BrickColor`, `CellData`, `Asset`).
* [`schemas/commands.yaml`](./schemas/commands.yaml): Domain commands (`CreateAssetCommand`, `UpdateAssetCommand`, `GetAssetCommand`, `DeleteAssetCommand`, `PaintAreaCommand`, `ListAssetsCommand`, `ListColorsCommand`).
* [`bounding_box_math.md`](./bounding_box_math.md): Pure domain math operations and clamping invariants (`clampBoundingBox`, `panBoundingBox`, `centerBoundingBoxAt`, `zoomBoundingBox`, `recoverBoundingBox`).

---

## 3. Invariants & Acceptance Scenarios

* **Domain Rules & Color Invariants**: Defined in [`rules.md`](./rules.md).
* **Executable BDD Scenarios**:
  * [`features/asset.feature`](./features/asset.feature): Validates asset creation, dimension updates, bounding box setting, and lenient brush painting clipping.
  * [`features/colors.feature`](./features/colors.feature): Validates listing official brick colors and verifying palette completeness and attributes.
  * [`features/bounding_box_math.feature`](./features/bounding_box_math.feature): Validates pure domain math, boundary clamping, pan deltas, center repositioning, wheel zooming, and self-healing recovery.
