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

  // TEST-SRV-REPO-01: create persists the asset aggregate and allows subsequent findById to reconstitute the exact state
  test('TEST-SRV-REPO-01: create and findById reconstitute asset state and all cell coordinates', async () => {
    const asset = new Asset({
      id: 'asset-101',
      name: 'Bunker Base',
      width: 32,
      height: 32
    });
    asset.paintArea({ x: 5, y: 5, width: 2, height: 2 }, 15); // Cells: (5,5), (5,6), (6,5), (6,6)

    await repo.create(asset);

    const reconstituted = await repo.findById('asset-101');
    assert.ok(reconstituted);
    assert.strictEqual(reconstituted.id, 'asset-101');
    assert.strictEqual(reconstituted.name, 'Bunker Base');
    assert.strictEqual(reconstituted.width, 32);
    assert.strictEqual(reconstituted.height, 32);
    assert.strictEqual(reconstituted.getPaintedCellCount(), 4);

    // Verify all 4 quadrant coordinates to eliminate off-by-one or coordinate transposition bugs
    assert.strictEqual(reconstituted.getCellColor(5, 5), 15);
    assert.strictEqual(reconstituted.getCellColor(5, 6), 15);
    assert.strictEqual(reconstituted.getCellColor(6, 5), 15);
    assert.strictEqual(reconstituted.getCellColor(6, 6), 15);

    // Verify boundary untouched
    assert.strictEqual(reconstituted.getCellColor(0, 0), null);
    assert.strictEqual(reconstituted.getCellColor(31, 31), null);
  });

  // TEST-SRV-REPO-02: update synchronizes cell mutations and timestamp updates on the Asset aggregate atomically
  test('TEST-SRV-REPO-02: update synchronizes cell mutations preserving existing unmutated cells', async () => {
    const asset = new Asset({
      id: 'asset-102',
      name: 'Command Post',
      width: 20,
      height: 20
    });
    // Paint 2x2 cells at (0,0): (0,0), (0,1), (1,0), (1,1) with color 1
    asset.paintArea({ x: 0, y: 0, width: 2, height: 2 }, 1);
    await repo.create(asset);

    asset.updateName('HQ Command Post');
    asset.paintArea({ x: 0, y: 0, width: 1, height: 1 }, null); // Erase (0,0) only
    asset.paintArea({ x: 10, y: 10, width: 1, height: 1 }, 37); // Paint new cell at (10,10)
    await repo.update(asset);

    const loaded = await repo.findById('asset-102');
    assert.ok(loaded);
    assert.strictEqual(loaded.name, 'HQ Command Post');
    assert.strictEqual(loaded.getPaintedCellCount(), 4, 'Must have exactly 4 cells: (0,1), (1,0), (1,1) surviving + (10,10) added');
    assert.strictEqual(loaded.getCellColor(0, 0), null, '(0,0) must be erased');
    assert.strictEqual(loaded.getCellColor(0, 1), 1, '(0,1) must be preserved');
    assert.strictEqual(loaded.getCellColor(1, 0), 1, '(1,0) must be preserved');
    assert.strictEqual(loaded.getCellColor(1, 1), 1, '(1,1) must be preserved');
    assert.strictEqual(loaded.getCellColor(10, 10), 37, '(10,10) must be painted');
  });

  // TEST-SRV-REPO-03: update trims cells outside boundaries when the aggregate dimensions are downsized
  test('TEST-SRV-REPO-03: update trims cells outside downsized dimensions', async () => {
    const asset = new Asset({
      id: 'asset-103',
      name: 'Plateau',
      width: 32,
      height: 32
    });
    asset.paintArea({ x: 0, y: 0, width: 32, height: 32 }, 15); // 1024 cells
    await repo.create(asset);

    asset.updateDimensions(16, 16);
    await repo.update(asset);

    const loaded = await repo.findById('asset-103');
    assert.ok(loaded);
    assert.strictEqual(loaded.width, 16);
    assert.strictEqual(loaded.height, 16);
    assert.strictEqual(loaded.getPaintedCellCount(), 256);
    assert.strictEqual(loaded.getCellColor(15, 15), 15);
    assert.strictEqual(loaded.getCellColor(16, 16), null);

    // Direct SQLite table assertion
    const countRow = db.prepare('SELECT COUNT(*) as count FROM cells WHERE asset_id = ?').get('asset-103') as { count: number };
    assert.strictEqual(countRow.count, 256);
  });

  // TEST-SRV-REPO-04: delete permanently removes the aggregate and cascades deletion to all child cells
  test('TEST-SRV-REPO-04: delete cascades to cells via foreign key', async () => {
    const asset = new Asset({
      id: 'asset-104',
      name: 'Outpost',
      width: 10,
      height: 10
    });
    asset.paintArea({ x: 0, y: 0, width: 5, height: 5 }, 2);
    await repo.create(asset);

    const initialCells = db.prepare('SELECT COUNT(*) as count FROM cells WHERE asset_id = ?').get('asset-104') as { count: number };
    assert.strictEqual(initialCells.count, 25);

    await repo.delete('asset-104');

    const loaded = await repo.findById('asset-104');
    assert.strictEqual(loaded, null);

    const orphanedCells = db.prepare('SELECT COUNT(*) as count FROM cells WHERE asset_id = ?').get('asset-104') as { count: number };
    assert.strictEqual(orphanedCells.count, 0);
  });

  // TEST-SRV-REPO-05: listAll returns all asset summaries sorted by created_at DESC without loading cell arrays
  test('TEST-SRV-REPO-05: listAll strictly verifies ordering by created_at DESC and omits cell data', async () => {
    // Insert with distinct timestamps
    db.prepare(`
      INSERT INTO assets (id, name, width, height, created_at)
      VALUES ('asset-older', 'Alpha Older', 10, 10, '2026-01-01 10:00:00')
    `).run();

    db.prepare(`
      INSERT INTO assets (id, name, width, height, created_at)
      VALUES ('asset-newer', 'Beta Newer', 20, 20, '2026-01-02 10:00:00')
    `).run();

    db.prepare(`
      INSERT INTO cells (asset_id, x, y, color_id)
      VALUES ('asset-older', 0, 0, 1)
    `).run();

    const list = await repo.listAll();
    assert.strictEqual(list.length, 2);

    // Exact index-based ordering check (newer must come first)
    assert.strictEqual(list[0].id, 'asset-newer');
    assert.strictEqual(list[0].paintedCellsCount, 0);
    assert.strictEqual((list[0] as any).cells, undefined, 'Summary must not contain cell array');

    assert.strictEqual(list[1].id, 'asset-older');
    assert.strictEqual(list[1].paintedCellsCount, 1);
    assert.strictEqual((list[1] as any).cells, undefined, 'Summary must not contain cell array');
  });

  // Error paths: non-existent update and delete
  test('throws descriptive error when updating or deleting non-existent asset ID', async () => {
    const nonExistent = new Asset({ id: 'ghost-asset', name: 'Ghost', width: 10, height: 10 });
    await assert.rejects(async () => repo.update(nonExistent), /Asset with id ghost-asset does not exist/);
    await assert.rejects(async () => repo.delete('ghost-asset'), /Asset with id ghost-asset does not exist/);
  });
});
