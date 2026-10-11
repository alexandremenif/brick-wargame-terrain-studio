# Server Component: ColorService

## 1. Role & Responsibilities
The `ColorService` is the server component responsible for loading, parsing, and serving the authoritative list of official brick colors from the static file ([`specs/domain/colors.csv`](../../domain/colors.csv)).

It operates purely in-memory, ensuring that the database remains unpolluted with static reference data while guaranteeing fast lookup and color validation for both JSON-RPC API requests and MCP AI tool calls.

---

## 2. Interface Specification

```typescript
export interface BrickColor {
  id: number;
  name: string;
  hex: string;
}

export interface ColorService {
  /**
   * Loads and parses the colors CSV file into an in-memory collection.
   * Called once during server startup / bootstrap.
   */
  loadColors(filePath?: string): Promise<void>;

  /**
   * Returns all available official brick colors.
   */
  listColors(): BrickColor[];

  /**
   * Retrieves a specific brick color by its official ID.
   * Returns undefined if the ID does not exist.
   */
  getColorById(id: number): BrickColor | undefined;

  /**
   * Validates whether a given numeric ID is an official brick color.
   */
  isValidColorId(id: number): boolean;
}
```

---

## 3. Operational Requirements

* **File Source**:
  * Authoritative data source is `specs/domain/colors.csv` (or packaged build artifact).
  * Header line: `id,name,hex`.
  * Exactly 41 official colors must be parsed into memory.
* **Error Handling**:
  * If the file is missing, unreadable, or contains corrupted rows during startup, the server startup must abort with a descriptive fatal error.
* **Immutability**:
  * Once loaded at server startup, the in-memory color catalog is strictly read-only.
* **Integration with Inbound Adapters**:
  * Powers the `list_colors` JSON-RPC method (`openrpc.yaml`).
  * Powers the `list_colors` MCP tool (`mcp.md`).
  * Used by the domain engine / command handlers to validate `colorId` in `paintArea` requests before persistence.

---

## 4. Acceptance Criteria & Test IDs

* `TEST-SRV-COLOR-01`: `ColorService.loadColors()` correctly parses all 41 colors with valid integer `id`, string `name`, and `#RRGGBB` `hex`.
* `TEST-SRV-COLOR-02`: `isValidColorId(id)` returns `true` for valid color IDs (e.g. 194, 28, 37) and `false` for nonexistent IDs (e.g. 9999, -1).
* `TEST-SRV-COLOR-03`: `listColors()` returns the complete array of 41 `BrickColor` objects.
