import type Database from 'better-sqlite3';
import { Asset } from '../domain/Asset.js';
import type { AssetRepository } from '../domain/AssetRepository.js';
import type { Asset as AssetDto, AssetSummary } from '@lego-wargame-terrain-studio/domain';

export class SqliteAssetRepository implements AssetRepository {
  private db: Database.Database;

  constructor(db: Database.Database) {
    this.db = db;
    this.db.pragma('foreign_keys = ON');
  }

  async create(asset: Asset): Promise<void> {
    const insertStmt = this.db.prepare(`
      INSERT INTO assets (id, data)
      VALUES (?, jsonb(?))
    `);
    insertStmt.run(asset.id, JSON.stringify(asset.toDto()));
  }

  async findById(id: string): Promise<Asset | null> {
    const row = this.db
      .prepare('SELECT json(data) AS data FROM assets WHERE id = ?')
      .get(id) as { data: string } | undefined;

    if (!row) {
      return null;
    }

    const dto = JSON.parse(row.data) as AssetDto;
    return new Asset({
      id: dto.id,
      name: dto.name,
      width: dto.width,
      height: dto.height,
      cells: dto.cells
    });
  }

  async listAll(): Promise<AssetSummary[]> {
    const rows = this.db
      .prepare(`
        SELECT
          id,
          name,
          width,
          height,
          painted_cells_count AS paintedCellsCount
        FROM assets
        ORDER BY created_at DESC, rowid DESC
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
      width: Number(r.width),
      height: Number(r.height),
      paintedCellsCount: Number(r.paintedCellsCount)
    }));
  }

  async update(asset: Asset): Promise<void> {
    const updateStmt = this.db.prepare(`
      UPDATE assets
      SET data = jsonb(?), updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    const result = updateStmt.run(JSON.stringify(asset.toDto()), asset.id);
    if (result.changes === 0) {
      throw new Error(`Asset with id ${asset.id} does not exist`);
    }
  }

  async delete(id: string): Promise<void> {
    const deleteStmt = this.db.prepare('DELETE FROM assets WHERE id = ?');
    const result = deleteStmt.run(id);
    if (result.changes === 0) {
      throw new Error(`Asset with id ${id} does not exist`);
    }
  }
}
