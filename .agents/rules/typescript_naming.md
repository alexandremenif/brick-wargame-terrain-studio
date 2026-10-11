---
trigger: always_on
description: "TypeScript naming conventions: prohibiting Hungarian notation and 'I' prefix on interfaces"
---

# TypeScript Naming Conventions Rule

* **No `I` Prefix on Interfaces**:
  * Never prefix TypeScript interface names with `I` (e.g. use `AssetRepository`, `ColorService`, `AssetService`, NOT `IAssetRepository`, `IColorService`, `IAssetService`).
  * If a concrete class implements the interface, name the implementation descriptively based on its technology, strategy, or infrastructure adapter (e.g. `SqliteAssetRepository implements AssetRepository`, `CsvColorService implements ColorService`, `DefaultAssetService implements AssetService`).
