import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { DefaultColorService } from '../../src/domain/ColorService.js';
import { SqliteAssetRepository } from '../../src/persistence/SqliteAssetRepository.js';
import { AssetService } from '../../src/domain/AssetService.js';
import { dispatchJsonRpc } from '../../src/generated/router.js';
import type { StudioWorld } from '../support/world.js';

Given('a running JSON-RPC server with an active asset of {int} by {int} studs', async function (this: StudioWorld, width: number, height: number) {
  const db = new Database(':memory:');
  db.pragma('foreign_keys = ON');

  const migrationPath = path.resolve('packages/server/src/persistence/migrations/0001_initial_schema.sql');
  const migrationSql = fs.readFileSync(migrationPath, 'utf-8');
  db.exec(migrationSql);

  const colorService = new DefaultColorService();
  await colorService.loadColors();

  const repo = new SqliteAssetRepository(db);
  this.jsonRpcService = new AssetService(repo, colorService) as any;

  // Create active asset
  const created = await (this.jsonRpcService as any).createAsset({
    name: 'Active Studio Asset',
    width,
    height
  });
  this.persistedId = created.asset.id;
});

When(
  'I send a JSON-RPC request for {string} with valid bounding box \\({int}, {int}, {int}, {int}\\) and color ID {int}',
  async function (this: StudioWorld, method: string, x: number, y: number, w: number, h: number, colorId: number) {
    assert.ok(this.jsonRpcService, 'Service must be initialized');
    this.lastRequestId = 101;
    this.lastJsonRpcResponse = await dispatchJsonRpc(this.jsonRpcService, {
      jsonrpc: '2.0',
      id: this.lastRequestId,
      method,
      params: [{
        assetId: this.persistedId,
        bbox: { x, y, width: w, height: h },
        colorId
      }]
    });
  }
);

Then('the JSON-RPC response should contain a successful result', function (this: StudioWorld) {
  assert.ok(this.lastJsonRpcResponse, 'Response must exist');
  assert.strictEqual(this.lastJsonRpcResponse.jsonrpc, '2.0', 'JSON-RPC response must specify version 2.0');
  assert.strictEqual(this.lastJsonRpcResponse.id, this.lastRequestId, 'JSON-RPC response ID must match request ID');
  assert.strictEqual(this.lastJsonRpcResponse.error, undefined, `Unexpected error in response: ${this.lastJsonRpcResponse.error?.message}`);
  assert.ok(this.lastJsonRpcResponse.result, 'Response must contain a result object');
});

Then('the response should report exactly {int} affected cells', function (this: StudioWorld, expectedCount: number) {
  assert.ok(this.lastJsonRpcResponse?.result, 'Response result must exist');
  assert.strictEqual(this.lastJsonRpcResponse.result.affectedCellsCount, expectedCount);
});

When('I send a JSON-RPC request for {string} with missing width and height', async function (this: StudioWorld, method: string) {
  assert.ok(this.jsonRpcService, 'Service must be initialized');
  this.lastRequestId = 102;
  this.lastJsonRpcResponse = await dispatchJsonRpc(this.jsonRpcService, {
    jsonrpc: '2.0',
    id: this.lastRequestId,
    method,
    params: [{
      assetId: this.persistedId,
      bbox: { x: 5, y: 5 }, // Missing width and height violates schema
      colorId: 1
    }]
  });
});

Then('the JSON-RPC response should contain error code {int}', function (this: StudioWorld, expectedErrorCode: number) {
  assert.ok(this.lastJsonRpcResponse, 'Response must exist');
  assert.strictEqual(this.lastJsonRpcResponse.jsonrpc, '2.0', 'JSON-RPC response must specify version 2.0');
  assert.strictEqual(this.lastJsonRpcResponse.id, this.lastRequestId, 'JSON-RPC error response ID must match request ID');
  assert.strictEqual(this.lastJsonRpcResponse.result, undefined, 'JSON-RPC error response must not contain a result property');
  assert.ok(this.lastJsonRpcResponse.error, 'Response must contain an error object');
  assert.strictEqual(this.lastJsonRpcResponse.error.code, expectedErrorCode, `Expected error code ${expectedErrorCode}, received ${this.lastJsonRpcResponse.error.code}`);
  assert.ok(typeof this.lastJsonRpcResponse.error.message === 'string' && this.lastJsonRpcResponse.error.message.length > 0, 'Error message must be non-empty string');
});

When('I send a JSON-RPC request for {string}', async function (this: StudioWorld, method: string) {
  assert.ok(this.jsonRpcService, 'Service must be initialized');
  this.lastRequestId = 103;
  this.lastJsonRpcResponse = await dispatchJsonRpc(this.jsonRpcService, {
    jsonrpc: '2.0',
    id: this.lastRequestId,
    method,
    params: []
  });
});

When(
  'I send a JSON-RPC request for {string} with valid bounding box \\({int}, {int}, {int}, {int}\\) and invalid color ID {int}',
  async function (this: StudioWorld, method: string, x: number, y: number, w: number, h: number, colorId: number) {
    assert.ok(this.jsonRpcService, 'Service must be initialized');
    this.lastRequestId = 104;
    this.lastJsonRpcResponse = await dispatchJsonRpc(this.jsonRpcService, {
      jsonrpc: '2.0',
      id: this.lastRequestId,
      method,
      params: [{
        assetId: this.persistedId,
        bbox: { x, y, width: w, height: h },
        colorId
      }]
    });
  }
);

When('I send a JSON-RPC request for {string} to inspect the active asset', async function (this: StudioWorld, method: string) {
  assert.ok(this.jsonRpcService, 'Service must be initialized');
  this.lastRequestId = 105;
  this.lastJsonRpcResponse = await dispatchJsonRpc(this.jsonRpcService, {
    jsonrpc: '2.0',
    id: this.lastRequestId,
    method,
    params: [{
      assetId: this.persistedId
    }]
  });
});

Then('the JSON-RPC response should contain {int} painted cells', function (this: StudioWorld, expectedCount: number) {
  const asset = this.lastJsonRpcResponse?.result?.asset;
  assert.ok(asset, 'Response must contain asset result');
  assert.strictEqual(asset.paintedCellsCount, expectedCount);
  assert.strictEqual(asset.cells.length, asset.height);
  let nonZeroCount = 0;
  for (const row of asset.cells) {
    assert.strictEqual(row.length, asset.width);
    for (const colorId of row) {
      if (colorId > 0) nonZeroCount++;
    }
  }
  assert.strictEqual(nonZeroCount, expectedCount);
});
