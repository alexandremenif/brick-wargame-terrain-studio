import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import Database from 'better-sqlite3';
import type { StudioWorld } from '../support/world.js';

Given('an initialized SQLite database with current migrations', function (this: StudioWorld) {
  this.tempDbPath = path.join(os.tmpdir(), `test-persistence-${Date.now()}-${Math.random().toString(36).slice(2)}.db`);
  this.db = new Database(this.tempDbPath);
  this.db.pragma('foreign_keys = ON');

  // Apply generated SQLite migration
  const migrationPath = path.resolve('packages/server/src/persistence/migrations/0001_initial_schema.sql');
  const migrationSql = fs.readFileSync(migrationPath, 'utf-8');
  this.db.exec(migrationSql);
});

When('I persist a terrain map with dimensions {int} by {int} studs', function (this: StudioWorld, width: number, height: number) {
  assert.ok(this.db, 'Database must be open');
  this.persistedId = 'map-' + Date.now();
  const stmt = this.db.prepare(`
    INSERT INTO tilemaps (id, name, is_root_map, width, height)
    VALUES (?, ?, ?, ?, ?)
  `);
  stmt.run(this.persistedId, 'Test Playmat', 1, width, height);
});

When('I simulate a server restart and reopen the database', function (this: StudioWorld) {
  assert.ok(this.db, 'Database must be open before restart');
  assert.ok(this.tempDbPath, 'Temp db path must exist');

  // Close database to simulate shutdown
  this.db.close();

  // Reopen from disk to simulate server restart
  this.db = new Database(this.tempDbPath);
  this.db.pragma('foreign_keys = ON');
});

Then('the persisted terrain map should be recovered with dimensions {int} by {int} studs', function (this: StudioWorld, expectedWidth: number, expectedHeight: number) {
  assert.ok(this.db, 'Database must be reopened');
  assert.ok(this.persistedId, 'Persisted ID must exist');

  const row = this.db.prepare('SELECT id, name, is_root_map, width, height FROM tilemaps WHERE id = ?').get(this.persistedId) as {
    id: string;
    name: string;
    is_root_map: number;
    width: number;
    height: number;
  } | undefined;

  assert.ok(row, `Expected terrain map row for ${this.persistedId} to exist after recovery`);
  assert.strictEqual(row.name, 'Test Playmat');
  assert.strictEqual(row.is_root_map, 1);
  assert.strictEqual(row.width, expectedWidth, `Expected width ${expectedWidth}, received ${row.width}`);
  assert.strictEqual(row.height, expectedHeight, `Expected height ${expectedHeight}, received ${row.height}`);
  // Note: Resource cleanup (db.close() and unlinking tempDbPath) is safely handled in StudioWorld's After hook
});
