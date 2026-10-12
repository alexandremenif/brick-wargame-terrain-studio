import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { DefaultColorService } from '../src/domain/ColorService.js';
import { SqliteAssetRepository } from '../src/persistence/SqliteAssetRepository.js';
import { AssetService } from '../src/domain/AssetService.js';
import { createHttpRpcServer } from '../src/adapters/http.js';

describe('HTTP Health Check Adapter', () => {
  let server: http.Server;
  let baseUrl: string;
  let db: Database.Database;

  before(async () => {
    db = new Database(':memory:');
    db.pragma('foreign_keys = ON');

    const candidatePaths = [
      path.resolve(process.cwd(), 'packages/server/src/persistence/migrations/0001_initial_schema.sql'),
      path.resolve(process.cwd(), 'src/persistence/migrations/0001_initial_schema.sql'),
    ];
    const migrationPath = candidatePaths.find(p => fs.existsSync(p)) || candidatePaths[0];
    const migrationSql = fs.readFileSync(migrationPath, 'utf-8');
    db.exec(migrationSql);

    const colorService = new DefaultColorService();
    await colorService.loadColors();

    const repo = new SqliteAssetRepository(db);
    const service = new AssetService(repo, colorService);

    server = createHttpRpcServer(service);

    await new Promise<void>((resolve, reject) => {
      server.listen(0, '127.0.0.1', () => {
        const address = server.address();
        assert.ok(address && typeof address === 'object');
        baseUrl = `http://127.0.0.1:${address.port}`;
        resolve();
      });
      server.on('error', reject);
    });
  });

  after(async () => {
    if (server) {
      await new Promise<void>((resolve) => {
        server.close(() => resolve());
      });
    }
    if (db) {
      db.close();
    }
  });

  it('TEST-SRV-HLTH-01: GET /health returns 200 OK with no-cache headers and status ok payload', async () => {
    const res = await fetch(`${baseUrl}/health`);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.headers.get('content-type'), 'application/json');
    assert.strictEqual(res.headers.get('cache-control'), 'no-cache, no-store, must-revalidate');
    assert.strictEqual(res.headers.get('pragma'), 'no-cache');
    assert.strictEqual(res.headers.get('access-control-allow-origin'), '*');

    const data = await res.json();
    assert.deepStrictEqual(data, { status: 'ok' });
  });

  it('TEST-SRV-HLTH-02: GET /health/ trailing slash behaves identically', async () => {
    const res = await fetch(`${baseUrl}/health/`);
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.headers.get('content-type'), 'application/json');

    const data = await res.json();
    assert.deepStrictEqual(data, { status: 'ok' });
  });

  it('TEST-SRV-HLTH-03: HEAD /health returns 200 OK with headers and empty body', async () => {
    const res = await fetch(`${baseUrl}/health`, { method: 'HEAD' });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.headers.get('content-type'), 'application/json');
    assert.strictEqual(res.headers.get('cache-control'), 'no-cache, no-store, must-revalidate');

    const text = await res.text();
    assert.strictEqual(text, '');
  });

  it('TEST-SRV-HLTH-04: POST /health returns 405 Method Not Allowed', async () => {
    const res = await fetch(`${baseUrl}/health`, { method: 'POST' });
    assert.strictEqual(res.status, 405);
    assert.strictEqual(res.headers.get('content-type'), 'application/json');

    const data = await res.json();
    assert.deepStrictEqual(data, { error: 'Method Not Allowed' });
  });

  it('TEST-SRV-HLTH-05: Non-existent non-RPC paths return 404 Not Found', async () => {
    const res = await fetch(`${baseUrl}/unknown-endpoint`);
    assert.strictEqual(res.status, 404);
    assert.strictEqual(res.headers.get('content-type'), 'application/json');
    const data = await res.json();
    assert.deepStrictEqual(data, { error: 'Not found' });
  });
});
