import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import { TerrainMap } from '../../src/domain/TerrainMap.js';
import { dispatchJsonRpc } from '../../src/router.js';
import type { StudioWorld } from '../support/world.js';

Given('a running JSON-RPC server with an active map of {int} by {int} studs', function (this: StudioWorld, width: number, height: number) {
  const map = new TerrainMap({ width, height });
  this.jsonRpcService = {
    createMap: async (cmd) => {
      const created = new TerrainMap({ width: cmd.width, height: cmd.height });
      return { mapId: cmd.mapId || 'test', width: created.width, height: created.height };
    },
    paintArea: async (cmd) => {
      map.paintArea(
        { x: cmd.bbox.x, y: cmd.bbox.y, width: cmd.bbox.width, height: cmd.bbox.height },
        cmd.colorId
      );
      return { affectedCellsCount: cmd.bbox.width * cmd.bbox.height };
    },
    paintCell: async (cmd) => {
      map.paintCell(cmd.x, cmd.y, cmd.colorId);
      return { success: true };
    },
    undo: async () => {
      const undone = map.undo();
      return { undone, remainingUndoCount: map.getUndoHistoryCount() };
    }
  };
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
        mapId: 'main',
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
      mapId: 'main',
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
