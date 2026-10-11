# User Interface Specification (UI & UX)

This directory defines the visual ergonomics, React component architecture, and interaction rules for the playmat editor.
Following modular architecture principles, each major UI component is specified in its own dedicated Markdown file.

---

## 1. Overview & Component Hierarchy

The studio layout is structured as follows:

```
<StudioLayout> (index.md)
├── <TopHeaderBar>               -> top_header_bar.md
├── <LeftToolboxSidebar>         -> left_toolbox_sidebar.md
├── <CanvasViewport>             -> canvas_viewport.md
├── <BoundingBoxOverlay>         -> bounding_box_overlay.md
├── <RightInspectorSidebar>      -> right_inspector_sidebar.md
└── <BottomStatusBar>            -> bottom_status_bar.md
```

---

## 2. Component Architecture: Option B Separation

The frontend code within `packages/client/src/` is organized with a strict boundary between generic UI primitives, domain components, and non-visual client logic:

* **`src/ui/` (Design System Primitives - Agnostic)**:
  * Reusable, presentation-only components with **zero knowledge** of LEGO concepts, wargaming, or canvas math.
  * Examples: `Button`, `NumberInput`, `DropdownMenu`, `Tooltip`, `Modal`, `Tabs`, `Card`, `icons/`.
  * **Strict Minimal Dependency Rule**: Built purely with Tailwind CSS and modern native Web APIs (`<dialog>`, CSS `group-hover` tooltips, popovers). Zero third-party UI component libraries (no Radix, MUI, Mantine, or Ant Design).
* **`src/components/` (Studio Domain Components)**:
  * Application-specific components modeling playmat editor features and importing primitives from `src/ui/`.
  * Examples: `TopHeaderBar`, `LeftToolboxSidebar`, `LegoColorPalette`, `BoundingBoxInspector`, `CanvasViewport`, `BottomStatusBar`.
* **`src/core/` (Headless Client Logic & Transport)**:
  * Non-visual logic: Viewport camera transform hooks, canvas state management, and transport adapters (`WebSocketTransport`) powering the generated `TerrainEngineServiceClient`.

---

## 3. Service Contract & Transport Abstraction (`TerrainEngineService`)

All React components are fully decoupled from networking and transport implementations via the canonical `TerrainEngineService` interface imported from `@lego-wargame-terrain-studio/api`:

```ts
import type { TerrainEngineService } from '@lego-wargame-terrain-studio/api';
```

The concrete client class in `packages/client/src/core/` (`TerrainEngineServiceClient`) implements `TerrainEngineService` and delegates RPC calls to a minimal transport interface:

```ts
export interface JsonRpcTransport {
  call<TResult>(method: string, params: unknown): Promise<TResult>;
}
```

* **Local Web Mode**: Connects via `WebSocketTransport` to `ws://localhost:4000`.
* **Native Desktop Mode (Tauri / Electron)**: Connects via `IpcTransport` to native OS bindings.
* **Testing & Headless Mode**: Plugs directly into an in-memory transport or mock.

---

## 4. Component Specification Index

* **[TopHeaderBar](./top_header_bar.md)**: Project title, Undo/Redo history buttons, 1px grid toggle, zoom, and exports.
* **[LeftToolboxSidebar](./left_toolbox_sidebar.md)**: Tools (brush, eraser, select), brush sizes ($1\times 1$ to $32\times 32$), LEGO palette, and SVG textures.
* **[CanvasViewport](./canvas_viewport.md)**: HTML5 Canvas rendering engine, camera panning, and mouse-wheel zooming ($10\%$ to $1200\%$).
* **[BoundingBoxOverlay](./bounding_box_overlay.md)**: Interactive SVG selection box, corner resize handles, and "Copy for AI" quick button.
* **[RightInspectorSidebar](./right_inspector_sidebar.md)**: Coordinate inspector, drag-and-drop preset library, and active instance management.
* **[BottomStatusBar](./bottom_status_bar.md)**: Live cursor coordinates, connection status indicator, and physical scale legend ($1\text{ stud} = 8\text{ mm}$).
