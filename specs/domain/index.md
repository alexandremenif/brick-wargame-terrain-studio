# Domain Specification

The domain layer encapsulates the core logic, entities, invariants, and commands of the LEGO Wargame Terrain Studio without any knowledge of network protocols, databases, or user interfaces.

---

## 1. Ubiquitous Language

* **Stud**: The fundamental quantum of measurement ($8.0\text{ mm} \times 8.0\text{ mm}$).
* **Asset**: A 2D discrete coordinate grid with a name and configurable dimensions ($width \times height$) holding cells.
* **Cell**: A discrete stud position $(x, y)$ that can be unpainted or customized with an official LEGO color.
* **BoundingBox**: An axis-aligned rectangular region defined by $(x, y, width, height)$ in studs.
* **LegoColor**: An official LEGO brick color identified by numeric code, official name, and hexadecimal RGB value.

---

## 2. Declarative Domain Schemas & Catalogs

Domain entities, command contracts, and static catalogs are formally specified under `specs/domain/`:
* [`colors.csv`](./colors.csv): Canonical tabular list of all 41 official LEGO colors (`id`, `name`, `hex`).
* [`schemas/model.yaml`](./schemas/model.yaml): Domain entities (`BoundingBox`, `LegoColor`, `CellData`, `Asset`).
* [`schemas/commands.yaml`](./schemas/commands.yaml): Domain commands (`CreateAssetCommand`, `UpdateAssetDimensionsCommand`, `SetBoundingBoxCommand`, `PaintAreaCommand`, `ListAssetsCommand`, `ListColorsCommand`, `GetAssetImageCommand`).

---

## 3. Invariants & Acceptance Scenarios

* **Domain Rules & Color Invariants**: Defined in [`rules.md`](./rules.md).
* **Executable BDD Scenarios**:
  * [`features/asset.feature`](./features/asset.feature): Validates asset creation, dimension updates, bounding box setting, and lenient brush painting clipping.
  * [`features/colors.feature`](./features/colors.feature): Validates listing official LEGO colors and verifying palette completeness and attributes.
