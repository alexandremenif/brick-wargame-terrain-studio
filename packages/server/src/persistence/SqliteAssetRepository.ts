import type Database from 'better-sqlite3';
import { Asset } from '../domain/Asset.js';
import type { AssetRepository } from '../domain/AssetRepository.js';
import type { AssetSummary, CellData } from '@lego-wargame-terrain-studio/domain';

export class SqliteAssetRepository implements AssetRepository {
  private db: Database.Database;

  constructor(db: Database.Database) {
    this.db = db;
    this.db.pragma('foreign_keys = ON');
  }

  async create(asset: Asset): Promise<void> {
    const insertAssetStmt = this.db.prepare(`
      INSERT INTO assets (id, name, width, height, created_at, updated_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);

    const insertCellStmt = this.db.prepare(`
      INSERT INTO cells (asset_id, x, y, color_id)
      VALUES (?, ?, ?, ?)
    `);

    const transaction = this.db.transaction(() => {
      insertAssetStmt.run(asset.id, asset.name, asset.width, asset.height);
      const cells = asset.getCells();
      for (const cell of cells) {
        insertCellStmt.run(asset.id, cell.x, cell.y, cell.colorId);
      }
    });

    transaction();
  }

  async findById(id: string): Promise<Asset | null> {
    const assetRow = this.db
      .prepare('SELECT id, name, width, height FROM assets WHERE id = ?')
      .get(id) as { id: string; name: string; width: number; height: number } | undefined;

    if (!assetRow) {
      return null;
    }

    const cellRows = this.db
      .prepare('SELECT x, y, color_id FROM cells WHERE asset_id = ?')
      .all(id) as Array<{ x: number; y: number; color_id: number }>;

    const cells: CellData[] = cellRows.map(row => ({
      x: row.x,
      y: row.y,
      colorId: row.color_id
    }));

    return new Asset({
      id: assetRow.id,
      name: assetRow.name,
      width: assetRow.width,
      height: assetRow.height,
      cells
    });
  }

  async listAll(): Promise<AssetSummary[]> {
    const rows = this.db
      .prepare(`
        SELECT 
          a.id, 
          a.name, 
          a.width, 
          a.height, 
          COUNT(c.asset_id) as paintedCellsCount
        FROM assets a
        LEFT JOIN cells c ON a.id = c.asset_id
        GROUP BY a.id, a.name, a.width, a.height, a.created_at
        ORDER BY a.created_at DESC
      `)
      .all() as Array<{
        id: string;
        name: string;
        width: number;
        height: number;
        paintedCellsCount: number;
      }>;

    return rows.map(r => ({
      id: r.id,
      name: r.name,
      width: r.width,
      height: r.height,
      paintedCellsCount: Number(r.paintedCellsCount)
    }));
  }

  async update(asset: Asset): Promise<void> {
    const updateAssetStmt = this.db.prepare(`
      UPDATE assets
      SET name = ?, width = ?, height = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    const deleteOutOfBoundCellsStmt = this.db.prepare(`
      DELETE FROM cells
      WHERE asset_id = ? AND (x >= ? OR y >= ?)
    `);

    const upsertCellStmt = this.db.prepare(`
      INSERT INTO cells (asset_id, x, y, color_id)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(asset_id, x, y) DO UPDATE SET color_id = excluded.color_id
    `);

    const deleteErasedCellsStmt = this.db.prepare(`
      DELETE FROM cells
      WHERE asset_id = ?
    `);

    const transaction = this.db.transaction(() => {
      const result = updateAssetStmt.run(asset.name, asset.width, asset.height, asset.id);
      if (result.changes === 0) {
        throw new Error(`Asset with id ${asset.id} does not exist`);
      }

      // Reconcile cells: delete all existing and re-insert or sync
      deleteOutOfBoundCellsStmt.run(asset.id, asset.width, asset.height);

      // Reconcile: delete existing cells for this asset and insert the active set
      deleteErasedCellsStmt.run(asset.id);
      const cells = asset.getCells();
      for (const cell of cells) {
        upsertCellStmt.run(asset.id, cell.x, cell.y, cell.colorId);
      }
    });

    transaction();
  }

  async delete(id: string): Promise<void> {
    const deleteStmt = this.db.prepare('DELETE FROM assets WHERE id = ?');
    const result = deleteStmt.run(id);
    if (result.changes === 0) {
      throw new Error(`Asset with id ${id} does not exist`);
    }
  }
}
