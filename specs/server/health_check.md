# HTTP Health Check Endpoint Specification

The HTTP Health Check endpoint provides an operational liveness and readiness probe for process orchestrators (such as Process Compose, Docker Compose, or Kubernetes) and monitoring agents.

---

## 1. Endpoint Contract

* **Path**: `/health` (and `/health/`)
* **Transport**: HTTP/1.1
* **Supported Methods**:
  * `GET`: Evaluates server readiness and returns structured diagnostic JSON.
  * `HEAD`: Lightweight readiness verification returning HTTP headers without body payload.
* **Unsupported Methods**: Any other HTTP method (e.g. `POST`, `PUT`, `DELETE`) returns `405 Method Not Allowed`.

---

## 2. Response Specifications

### Headers
Every response from the health check endpoint MUST include the following headers:
* `Content-Type: application/json`
* `Cache-Control: no-cache, no-store, must-revalidate`
* `Pragma: no-cache`
* Standard CORS headers allowing cross-origin readiness polling.

### Status Codes & Payload

#### Success (200 OK)
When the server process is listening and ready to process incoming requests:
* **HTTP Status**: `200 OK`
* **Content Body**:
  ```json
  {
    "status": "ok"
  }
  ```

#### Method Not Allowed (405 Method Not Allowed)
When an unsupported HTTP method is dispatched to `/health`:
* **HTTP Status**: `405 Method Not Allowed`
* **Content Body**:
  ```json
  {
    "error": "Method Not Allowed"
  }
  ```

---

## 3. Orchestration Integration

This endpoint serves as the canonical readiness probe in [`process-compose.yaml`](../../process-compose.yaml):
```yaml
processes:
  server:
    command: "npm run dev:server"
    readiness_probe:
      http_get:
        host: "127.0.0.1"
        port: ${SERVER_PORT:-3000}
        path: "/health"
      initial_delay_seconds: 1
      period_seconds: 2
      timeout_seconds: 2
      success_threshold: 1
      failure_threshold: 5
```
Dependent processes (such as the frontend UI server) depend on `server` reaching the `process_healthy` state before accepting incoming user interactions.

---

## 4. Acceptance Criteria & Test IDs

* `TEST-SRV-HLTH-01`: `GET /health` returns 200 OK with no-cache headers, CORS header, and `{ status: "ok" }` payload.
* `TEST-SRV-HLTH-02`: `GET /health/` trailing slash behaves identically, returning 200 OK and `{ status: "ok" }`.
* `TEST-SRV-HLTH-03`: `HEAD /health` returns 200 OK with JSON and no-cache headers and empty response body.
* `TEST-SRV-HLTH-04`: Unsupported HTTP methods (e.g. `POST /health`) return 405 Method Not Allowed with `{ error: "Method Not Allowed" }`.
* `TEST-SRV-HLTH-05`: Non-existent non-RPC paths return 404 Not Found with `{ error: "Not found" }`.

---

## 5. Verification

* **BDD Acceptance Scenarios**: Defined in [`specs/server/features/health_check.feature`](./features/health_check.feature).
* **Automated Unit Testing**: Verified via Node.js test runner suite in [`packages/server/test/http_health.test.ts`](file:///home/alexandre/Projets/brick-wargame-terrain-studio/packages/server/test/http_health.test.ts).

