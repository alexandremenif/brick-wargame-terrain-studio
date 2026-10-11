# Component: BottomStatusBar

## 1. Role & Responsibilities
The `<BottomStatusBar>` provides persistent real-time feedback along the bottom edge of the studio interface, displaying cursor tracking, metric totals, and backend connection status.

## 2. Child Components & Controls
* **Live Cursor Position**:
  * Displays stud coordinate under pointer: `Stud: (x: 12, y: 18)`.
  * Shows `Stud: (-- , --)` when the pointer is outside the asset grid.
* **Asset Statistics**:
  * Displays painted cells count vs total grid capacity: `Painted: 240 / 1024 studs (23.4%)`.
* **Transport / MCP Sync Indicator**:
  * Live connection indicator badge: `● Connected (Live Sync)` with green pulsing status dot.

## 3. Visual Ergonomics & Layout
* Height: 28px fixed bar (`h-7`).
* Background: `bg-zinc-950 border-t border-zinc-800 text-xs text-zinc-400`.
* Horizontal flex layout with space-between alignment.

## 4. Acceptance Criteria & Test IDs
* `TEST-UI-STATUS-01`: Moving the mouse over stud $(x, y)$ updates the status bar stud coordinate display.
* `TEST-UI-STATUS-02`: Painting or clearing cells updates the painted count metric in real time.
