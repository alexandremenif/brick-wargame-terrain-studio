import { test, describe, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { Asset } from '../src/domain/Asset.js';
import { SqliteAssetRepository } from '../src/persistence/SqliteAssetRepository.js';

describe('SqliteAssetRepository', () => {
  let db: Database.Database;
  let repo: SqliteAssetRepository;

  beforeEach(() => {
    db = new Database(':memory:');
    db.pragma('foreign_keys = ON');

    const candidatePaths = [
      path.resolve(process.cwd(), 'packages/server/src/persistence/migrations/0001_initial_schema.sql'),
      path.resolve(process.cwd(), 'src/persistence/migrations/0001_initial_schema.sql')
    ];
    const migrationPath = candidatePaths.find(p => fs.existsSync(p)) || candidatePaths[0];
    const migrationSql = fs.readFileSync(migrationPath, 'utf-8');
    db.exec(migrationSql);

    repo = new SqliteAssetRepository(db);
  });

  afterEach(() => {
    db.close();
  });

  // TEST-SRV-REPO-01: create persists the asset aggregate as JSONB and allows subsequent findById to reconstitute the exact 2D cell grid state
  test('TEST-SRV-REPO-01: create and findById reconstitute asset state and 2D cell grid from JSONB', async () => {
    const asset = new Asset({
      id: 'asset-101',
      name: 'Bunker Base',
      width: 32,
      height: 24
    });
    asset.paintArea({ x: 5, y: 5, width: 2, height: 2 }, 15); // Cells: (5,5), (5,6), (6,5), (6,6)

    await repo.create(asset);

    // Verify stored derived columns directly in SQLite
    const rawRow = db
      .prepare('SELECT id, name, width, height, painted_cells_count, json_type(data) as rootType FROM assets WHERE id = ?')
      .get('asset-101') as {
        id: string;
        name: string;
        width: number;
        height: number;
        painted_cells_count: number;
        rootType: string;
      };
    assert.ok(rawRow);
    assert.strictEqual(rawRow.id, 'asset-101');
    assert.strictEqual(rawRow.name, 'Bunker Base');
    assert.strictEqual(rawRow.width, 32);
    assert.strictEqual(rawRow.height, 24);
    assert.strictEqual(rawRow.painted_cells_count, 4);
    assert.strictEqual(rawRow.rootType, 'object');

    const reconstituted = await repo.findById('asset-101');
    assert.ok(reconstituted);
    assert.strictEqual(reconstituted.id, 'asset-101');
    assert.strictEqual(reconstituted.name, 'Bunker Base');
    assert.strictEqual(reconstituted.width, 32);
    assert.strictEqual(reconstituted.height, 24);
    assert.strictEqual(reconstituted.getPaintedCellCount(), 4);

    // Verify all 4 quadrant coordinates to eliminate off-by-one or coordinate transposition bugs
    assert.strictEqual(reconstituted.getCellColor(5, 5), 15);
    assert.strictEqual(reconstituted.getCellColor(5, 6), 15);
    assert.strictEqual(reconstituted.getCellColor(6, 5), 15);
    assert.strictEqual(reconstituted.getCellColor(6, 6), 15);

    // Verify boundary untouched (0 = unpainted)
    assert.strictEqual(reconstituted.getCellColor(0, 0), 0);
    assert.strictEqual(reconstituted.getCellColor(31, 23), 0);
  });

  // TEST-SRV-REPO-02: update replaces the JSONB document and automatically synchronizes STORED derived summary columns and updated_at atomically
  test('TEST-SRV-REPO-02: update synchronizes JSONB document, STORED derived summary columns, and updated_at atomically', async () => {
    const asset = new Asset({
      id: 'asset-102',
      name: 'Command Post',
      width: 20,
      height: 20
    });
    // Paint 2x2 cells at (0,0): (0,0), (0,1), (1,0), (1,1) with color 1
    asset.paintArea({ x: 0, y: 0, width: 2, height: 2 }, 1);
    await repo.create(asset);

    // Backdate updated_at to verify that repo.update advances it
    db.prepare("UPDATE assets SET updated_at = '2020-01-01 00:00:00' WHERE id = ?").run('asset-102');

    asset.updateName('HQ Command Post');
    asset.paintArea({ x: 0, y: 0, width: 1, height: 1 }, 0); // Erase (0,0) only via colorId 0
    asset.paintArea({ x: 10, y: 10, width: 1, height: 1 }, 37); // Paint new cell at (10,10)
    await repo.update(asset);

    // Verify derived columns and updated_at updated automatically in SQLite
    const rawRow = db
      .prepare('SELECT name, width, height, painted_cells_count, updated_at FROM assets WHERE id = ?')
      .get('asset-102') as {
        name: string;
        width: number;
        height: number;
        painted_cells_count: number;
        updated_at: string;
      };
    assert.strictEqual(rawRow.name, 'HQ Command Post');
    assert.strictEqual(rawRow.width, 20);
    assert.strictEqual(rawRow.height, 20);
    assert.strictEqual(rawRow.painted_cells_count, 4);
    assert.notStrictEqual(rawRow.updated_at, '2020-01-01 00:00:00');
    assert.ok(rawRow.updated_at > '2020-01-01 00:00:00', `Expected updated_at to advance, got ${rawRow.updated_at}`);

    const loaded = await repo.findById('asset-102');
    assert.ok(loaded);
    assert.strictEqual(loaded.name, 'HQ Command Post');
    assert.strictEqual(loaded.getPaintedCellCount(), 4, 'Must have exactly 4 cells: (0,1), (1,0), (1,1) surviving + (10,10) added');
    assert.strictEqual(loaded.getCellColor(0, 0), 0, '(0,0) must be erased to 0');
    assert.strictEqual(loaded.getCellColor(0, 1), 1, '(0,1) must be preserved');
    assert.strictEqual(loaded.getCellColor(1, 0), 1, '(1,0) must be preserved');
    assert.strictEqual(loaded.getCellColor(1, 1), 1, '(1,1) must be preserved');
    assert.strictEqual(loaded.getCellColor(10, 10), 37, '(10,10) must be painted');
  });

  // TEST-SRV-REPO-03: update persists cropped 2D cell matrices when the aggregate dimensions are downsized
  test('TEST-SRV-REPO-03: update persists cropped 2D cell matrices when downsized', async () => {
    const asset = new Asset({
      id: 'asset-103',
      name: 'Plateau',
      width: 32,
      height: 32
    });
    asset.paintArea({ x: 0, y: 0, width: 32, height: 32 }, 15); // 1024 cells
    await repo.create(asset);

    asset.updateDimensions(16, 12);
    await repo.update(asset);

    const loaded = await repo.findById('asset-103');
    assert.ok(loaded);
    assert.strictEqual(loaded.width, 16);
    assert.strictEqual(loaded.height, 12);
    assert.strictEqual(loaded.getPaintedCellCount(), 192);
    assert.strictEqual(loaded.getCellColor(15, 11), 15);
    assert.strictEqual(loaded.getCellColor(16, 12), 0);

    // Direct SQLite derived column & JSONB array dimension assertion
    const row = db
      .prepare("SELECT width, height, painted_cells_count, json_array_length(data, '$.cells') as rowsCount, json_array_length(data, '$.cells[0]') as colsCount FROM assets WHERE id = ?")
      .get('asset-103') as { width: number; height: number; painted_cells_count: number; rowsCount: number; colsCount: number };
    assert.strictEqual(row.width, 16);
    assert.strictEqual(row.height, 12);
    assert.strictEqual(row.painted_cells_count, 192);
    assert.strictEqual(row.rowsCount, 12);
    assert.strictEqual(row.colsCount, 16);
  });

  // TEST-SRV-REPO-04: delete permanently removes the asset aggregate row
  test('TEST-SRV-REPO-04: delete permanently removes the asset aggregate row', async () => {
    const asset = new Asset({
      id: 'asset-104',
      name: 'Outpost',
      width: 10,
      height: 10
    });
    asset.paintArea({ x: 0, y: 0, width: 5, height: 5 }, 2);
    await repo.create(asset);

    await repo.delete('asset-104');

    const loaded = await repo.findById('asset-104');
    assert.strictEqual(loaded, null);

    const remaining = db.prepare('SELECT COUNT(*) as count FROM assets WHERE id = ?').get('asset-104') as { count: number };
    assert.strictEqual(remaining.count, 0);
  });

  // TEST-SRV-REPO-05: listAll returns all asset summaries from derived scalar columns sorted by created_at DESC without loading cell matrices
  test('TEST-SRV-REPO-05: listAll strictly verifies ordering by created_at DESC and omits cell matrix', async () => {
    const olderAsset = new Asset({ id: 'asset-older', name: 'Alpha Older', width: 10, height: 10 });
    olderAsset.paintArea({ x: 0, y: 0, width: 1, height: 1 }, 1);
    const newerAsset = new Asset({ id: 'asset-newer', name: 'Beta Newer', width: 20, height: 20 });

    db.prepare(`
      INSERT INTO assets (id, created_at, data)
      VALUES (?, '2026-01-01 10:00:00', jsonb(?))
    `).run(olderAsset.id, JSON.stringify(olderAsset.toDto()));

    db.prepare(`
      INSERT INTO assets (id, created_at, data)
      VALUES (?, '2026-01-02 10:00:00', jsonb(?))
    `).run(newerAsset.id, JSON.stringify(newerAsset.toDto()));

    const list = await repo.listAll();
    assert.strictEqual(list.length, 2);

    // Exact index-based ordering check (newer must come first)
    assert.strictEqual(list[0].id, 'asset-newer');
    assert.strictEqual(list[0].name, 'Beta Newer');
    assert.strictEqual(list[0].width, 20);
    assert.strictEqual(list[0].height, 20);
    assert.strictEqual(list[0].paintedCellsCount, 0);
    assert.strictEqual((list[0] as any).cells, undefined, 'Summary must not contain cell matrix');

    assert.strictEqual(list[1].id, 'asset-older');
    assert.strictEqual(list[1].name, 'Alpha Older');
    assert.strictEqual(list[1].width, 10);
    assert.strictEqual(list[1].height, 10);
    assert.strictEqual(list[1].paintedCellsCount, 1);
    assert.strictEqual((list[1] as any).cells, undefined, 'Summary must not contain cell matrix');
  });

  // Database CHECK constraint enforcement: id must match data ->> '$.id' and data must be binary JSONB (json_valid(data, 4))
  test('enforces database CHECK constraints for id consistency and binary JSONB format (json_valid(data, 4))', () => {
    const asset = new Asset({ id: 'asset-real', name: 'Sync Check', width: 4, height: 4 });
    assert.throws(
      () => {
        db.prepare('INSERT INTO assets (id, data) VALUES (?, jsonb(?))').run(
          'asset-mismatched',
          JSON.stringify(asset.toDto())
        );
      },
      /CHECK constraint failed/i,
      'Mismatched relational id and JSONB $.id must be rejected by SQLite CHECK constraint'
    );

    assert.throws(
      () => {
        db.prepare('INSERT INTO assets (id, data) VALUES (?, ?)').run(
          'asset-real',
          JSON.stringify(asset.toDto()) // Plain text JSON, not binary JSONB
        );
      },
      /CHECK constraint failed/i,
      'Plain text JSON (non-JSONB format 4) must be rejected by CHECK (json_valid(data, 4))'
    );
  });

  // Error paths: non-existent update and delete
  test('throws descriptive error when updating or deleting non-existent asset ID', async () => {
    const nonExistent = new Asset({ id: 'ghost-asset', name: 'Ghost', width: 10, height: 10 });
    await assert.rejects(async () => repo.update(nonExistent), /Asset with id ghost-asset does not exist/);
    await assert.rejects(async () => repo.delete('ghost-asset'), /Asset with id ghost-asset does not exist/);
  });
});
