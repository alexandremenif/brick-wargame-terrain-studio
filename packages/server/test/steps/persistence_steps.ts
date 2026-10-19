import { Given, When } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import path from 'node:path';
import os from 'node:os';
import type { StudioWorld } from '../support/world.js';
import { JsonRpcDriver } from '../support/jsonrpc_driver.js';
import { McpDriver } from '../support/mcp_driver.js';

Given(
  'a file-backed API server with an active asset named {string} of {int} by {int} studs',
  async function (this: StudioWorld, name: string, width: number, height: number) {
    await this.driver.stop();
    this.tempDbPath = path.join(
      os.tmpdir(),
      `test-persistence-${Date.now()}-${Math.random().toString(36).slice(2)}.db`
    );

    const driverType = (this.parameters?.driver as string) || 'jsonrpc';
    this.driver = driverType === 'mcp' ? new McpDriver() : new JsonRpcDriver();
    await this.driver.start({ dbPath: this.tempDbPath });
    await this.driver.createAsset(name, width, height);
  }
);

When('the server restarts and reconnects to the SQLite database file', async function (this: StudioWorld) {
  assert.ok(this.driver.restart, 'Active driver must support restart()');
  await this.driver.restart();
});
