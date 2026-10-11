import { test, describe, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { DefaultColorService } from '../src/domain/ColorService.js';
import { SqliteAssetRepository } from '../src/persistence/SqliteAssetRepository.js';
import { AssetService } from '../src/domain/AssetService.js';

describe('AssetService', () => {
  let db: Database.Database;
  let repo: SqliteAssetRepository;
  let colorService: DefaultColorService;
  let service: AssetService;

  beforeEach(async () => {
    db = new Database(':memory:');
    db.pragma('foreign_keys = ON');

    const candidatePaths = [
      path.resolve(process.cwd(), 'packages/server/src/persistence/migrations/0001_initial_schema.sql'),
      path.resolve(process.cwd(), 'src/persistence/migrations/0001_initial_schema.sql')
    ];
    const migrationPath = candidatePaths.find(p => fs.existsSync(p)) || candidatePaths[0];
    const migrationSql = fs.readFileSync(migrationPath, 'utf-8');
    db.exec(migrationSql);

    colorService = new DefaultColorService();
    await colorService.loadColors();

    repo = new SqliteAssetRepository(db);
    service = new AssetService(repo, colorService);
  });

  // TEST-SRV-ASSET-01: createAsset validates input, generates unique ID, persists aggregate, returns created Asset
  test('TEST-SRV-ASSET-01: createAsset validates input, generates UUID v4, and persists aggregate', async () => {
    const res = await service.createAsset({
      name: 'Modular Outpost',
      width: 32,
      height: 32
    });

    // Check UUID v4 format
    assert.match(
      res.asset.id,
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
      'Asset ID must be a valid UUID v4'
    );
    assert.strictEqual(res.asset.name, 'Modular Outpost');
    assert.strictEqual(res.asset.width, 32);
    assert.strictEqual(res.asset.height, 32);
    assert.strictEqual(res.asset.cells.length, 0);

    // Verify actual persistence in repository
    const persisted = await repo.findById(res.asset.id);
    assert.ok(persisted, 'Asset must be queryable in repository after createAsset');
    assert.strictEqual(persisted.name, 'Modular Outpost');
    assert.strictEqual(persisted.width, 32);
    assert.strictEqual(persisted.height, 32);

    // Input boundary validations
    await assert.rejects(async () => service.createAsset({ name: '', width: 10, height: 10 }), /Asset name must be a non-empty string/);
    await assert.rejects(async () => service.createAsset({ name: 'Valid', width: 0, height: 10 }), /Asset width must be an integer between 1 and 1000/);
    await assert.rejects(async () => service.createAsset({ name: 'Valid', width: 10, height: -5 }), /Asset height must be an integer between 1 and 1000/);
    await assert.rejects(async () => service.createAsset({ name: 'Valid', width: 1001, height: 10 }), /Asset width must be an integer between 1 and 1000/);
  });

  // TEST-SRV-ASSET-02: getAsset returns the reconstituted aggregate including all painted cells
  test('TEST-SRV-ASSET-02: getAsset returns full state and fails on nonexistent', async () => {
    const created = await service.createAsset({
      name: 'Watchtower',
      width: 16,
      height: 16
    });

    await service.paintArea({
      assetId: created.asset.id,
      bbox: { x: 2, y: 2, width: 2, height: 2 },
      colorId: 15
    });

    const res = await service.getAsset({ assetId: created.asset.id });
    assert.strictEqual(res.asset.name, 'Watchtower');
    assert.strictEqual(res.asset.paintedCellsCount, 4);
    assert.strictEqual(res.asset.cells.length, 4);

    await assert.rejects(
      async () => service.getAsset({ assetId: 'nonexistent-id' }),
      /Asset not found/
    );
  });

  // TEST-SRV-ASSET-03: updateAsset updates properties, trims cells when downsized, persists modified aggregate
  test('TEST-SRV-ASSET-03: updateAsset modifies properties and confirms persistence in repository', async () => {
    const created = await service.createAsset({
      name: 'Old Outpost',
      width: 32,
      height: 32
    });

    await service.paintArea({
      assetId: created.asset.id,
      bbox: { x: 0, y: 0, width: 32, height: 32 },
      colorId: 37
    });

    const updated = await service.updateAsset({
      assetId: created.asset.id,
      name: 'New Outpost',
      width: 16,
      height: 16
    });

    assert.strictEqual(updated.asset.name, 'New Outpost');
    assert.strictEqual(updated.asset.width, 16);
    assert.strictEqual(updated.asset.height, 16);
    assert.strictEqual(updated.asset.paintedCellsCount, 256);

    // Verify persistence in repository (anti-complacency check: would fail if repo.update was omitted)
    const persisted = await repo.findById(created.asset.id);
    assert.ok(persisted);
    assert.strictEqual(persisted.name, 'New Outpost');
    assert.strictEqual(persisted.width, 16);
    assert.strictEqual(persisted.height, 16);
    assert.strictEqual(persisted.getPaintedCellCount(), 256);
    assert.strictEqual(persisted.getCellColor(15, 15), 37);
    assert.strictEqual(persisted.getCellColor(16, 16), null);

    // Non-existent error path
    await assert.rejects(
      async () => service.updateAsset({ assetId: 'missing-id', name: 'Ghost' }),
      /Asset not found: missing-id/
    );
  });

  // TEST-SRV-ASSET-04: deleteAsset permanently removes the asset via repository and returns success: true
  test('TEST-SRV-ASSET-04: deleteAsset removes asset and verifies deletion in repository', async () => {
    const created = await service.createAsset({
      name: 'Target to Delete',
      width: 10,
      height: 10
    });

    const delRes = await service.deleteAsset({ assetId: created.asset.id });
    assert.strictEqual(delRes.success, true);

    const check = await repo.findById(created.asset.id);
    assert.strictEqual(check, null);

    // Attempting to delete non-existent ID throws
    await assert.rejects(
      async () => service.deleteAsset({ assetId: 'missing-id' }),
      /Asset with id missing-id does not exist/
    );
  });

  // TEST-SRV-ASSET-05: paintArea validates color ID via ColorService, mutates cells with clipping, persists updated aggregate
  test('TEST-SRV-ASSET-05: paintArea validates colors, leniently clips bounds, and commits cells to repository', async () => {
    const created = await service.createAsset({
      name: 'Canvas',
      width: 20,
      height: 20
    });

    // Valid painting
    const paintRes = await service.paintArea({
      assetId: created.asset.id,
      bbox: { x: 18, y: 18, width: 5, height: 5 }, // 2x2 overlap within [18..19]
      colorId: 15
    });
    assert.strictEqual(paintRes.affectedCellsCount, 4);

    // Verify cells committed to database (anti-complacency check)
    const persisted = await repo.findById(created.asset.id);
    assert.ok(persisted);
    assert.strictEqual(persisted.getPaintedCellCount(), 4);
    assert.strictEqual(persisted.getCellColor(18, 18), 15);
    assert.strictEqual(persisted.getCellColor(19, 19), 15);
    assert.strictEqual(persisted.getCellColor(17, 17), null);

    // Invalid color ID rejection
    await assert.rejects(
      async () =>
        service.paintArea({
          assetId: created.asset.id,
          bbox: { x: 0, y: 0, width: 1, height: 1 },
          colorId: 9999
        }),
      /Invalid color ID: 9999/
    );

    // Non-existent asset ID rejection
    await assert.rejects(
      async () =>
        service.paintArea({
          assetId: 'missing-id',
          bbox: { x: 0, y: 0, width: 1, height: 1 },
          colorId: 15
        }),
      /Asset not found: missing-id/
    );
  });

  // TEST-SRV-ASSET-06: paintArea with colorId: null erases cells within specified bounding box
  test('TEST-SRV-ASSET-06: paintArea with null color erases targeted cells while preserving surrounding cells in DB', async () => {
    const created = await service.createAsset({
      name: 'Eraser Test',
      width: 10,
      height: 10
    });

    // Paint 4x4 area: cells (2,2) to (5,5)
    await service.paintArea({
      assetId: created.asset.id,
      bbox: { x: 2, y: 2, width: 4, height: 4 },
      colorId: 15
    });

    const getBefore = await service.getAsset({ assetId: created.asset.id });
    assert.strictEqual(getBefore.asset.paintedCellsCount, 16);

    // Erase 2x2 area: (2,2) to (3,3)
    await service.paintArea({
      assetId: created.asset.id,
      bbox: { x: 2, y: 2, width: 2, height: 2 },
      colorId: null
    });

    // Verify database state: erased cells are null, surrounding cells preserved
    const persisted = await repo.findById(created.asset.id);
    assert.ok(persisted);
    assert.strictEqual(persisted.getPaintedCellCount(), 12);
    assert.strictEqual(persisted.getCellColor(2, 2), null, '(2,2) must be erased');
    assert.strictEqual(persisted.getCellColor(3, 3), null, '(3,3) must be erased');
    assert.strictEqual(persisted.getCellColor(4, 4), 15, '(4,4) must be preserved');
    assert.strictEqual(persisted.getCellColor(5, 5), 15, '(5,5) must be preserved');
  });

  // Public Service Methods Coverage: listAssets & listColors
  test('listAssets and listColors return valid collections from underlying components', async () => {
    const asset1 = await service.createAsset({ name: 'Alpha', width: 10, height: 10 });
    const asset2 = await service.createAsset({ name: 'Beta', width: 20, height: 20 });

    const listRes = await service.listAssets();
    assert.ok(Array.isArray(listRes.assets));
    assert.strictEqual(listRes.assets.length, 2);
    assert.ok(listRes.assets.some(a => a.id === asset1.asset.id));
    assert.ok(listRes.assets.some(a => a.id === asset2.asset.id));

    const colorsRes = await service.listColors();
    assert.ok(Array.isArray(colorsRes.colors));
    assert.strictEqual(colorsRes.colors.length, 41);
    assert.ok(colorsRes.colors.some(c => c.name === 'Bright Green' && c.id === 15));
  });
});
