# Domain Specification

The domain layer encapsulates the core logic, entities, invariants, and commands of the LEGO Wargame Terrain Studio without any knowledge of network protocols, databases, or user interfaces.

---

## 1. Ubiquitous Language

* **Stud**: The fundamental quantum of measurement ($8.0\text{ mm} \times 8.0\text{ mm}$).
* **TerrainMap / Asset**: A 2D discrete coordinate grid of arbitrary dimensions ($width \times height$) holding cells.
* **Cell**: A discrete stud position $(x, y)$ that can be unpainted or customized with an official LEGO color.
* **BoundingBox**: An axis-aligned rectangular region defined by $(x, y, width, height)$ in studs.
* **LegoColor**: An official LEGO brick color identified by numeric code, standard name, and hexadecimal RGB value.
* **Action History**: Monotonic sequence of reversible commands enabling unlimited Undo and Redo.

---

## 2. Declarative Domain Schemas

Domain entities and command contracts are formally specified using protocol-agnostic JSON Schema:
* [`schemas/model.yaml`](./schemas/model.yaml): Domain entities (`BoundingBox`, `LegoColor`, `CellData`, `TerrainMapSummary`).
* [`schemas/commands.yaml`](./schemas/commands.yaml): Domain commands (`CreateMapCommand`, `PaintAreaCommand`, `PaintCellCommand`, `UndoCommand`).

---

## 3. Invariants & Acceptance Scenarios

* **Domain Rules**: Defined in [`rules.md`](./rules.md).
* **Executable BDD Scenarios**: Implemented in [`features/terrain_domain.feature`](./features/terrain_domain.feature) validating arbitrary map creation, bounds enforcement, and color painting.
