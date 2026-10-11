# Component: BottomStatusBar

## 1. Role & Responsibilities
Bottom status bar providing persistent visual feedback on physical cursor position, WebSocket sync status, and the most recent action.

## 2. Elements & Indicators
* **Live Cursor Coordinates**:
  * Continuous readout: `Cursor: [X: 42, Y: 105] (33.6 cm x 84.0 cm)`.
* **WebSocket Connection Status**:
  * Status indicator: Green ("Connected to local server") / Orange ("Reconnecting...").
* **Last Historized Action**:
  * Displays the latest event label (e.g. `Action #42: Paint area [X: 20, Y: 30, 4x4]`).
* **Physical Scale Legend**:
  * Permanent reminder: `Scale 1:1 | 1 stud = 8 mm`.

## 3. Acceptance Criteria & Test IDs
* `TEST-UI-BSB-01`: Hovering over cell $(10, 20)$ displays `X: 10, Y: 20` and `8.0 cm x 16.0 cm`.
* `TEST-UI-BSB-02`: Server disconnect immediately switches the indicator to reconnecting state.
