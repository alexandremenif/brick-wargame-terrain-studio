import type { EngineDriver } from './driver.js';
import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { DefaultColorService } from '../../src/domain/ColorService.js';
import { SqliteAssetRepository } from '../../src/persistence/SqliteAssetRepository.js';
import { AssetService } from '../../src/domain/AssetService.js';
import { dispatchJsonRpc } from '../../src/generated/router.js';
import type { BrickColor } from '@lego-wargame-terrain-studio/domain';

export class JsonRpcDriver implements EngineDriver {
  private db!: Database.Database;
  private colorService!: DefaultColorService;
  private repo!: SqliteAssetRepository;
  private service!: AssetService;
  private currentAssetId: string | null = null;

  async start(): Promise<void> {
    this.db = new Database(':memory:');
    this.db.pragma('foreign_keys = ON');

    const migrationPath = path.resolve('packages/server/src/persistence/migrations/0001_initial_schema.sql');
    const migrationSql = fs.readFileSync(migrationPath, 'utf-8');
    this.db.exec(migrationSql);

    this.colorService = new DefaultColorService();
    await this.colorService.loadColors();

    this.repo = new SqliteAssetRepository(this.db);
    this.service = new AssetService(this.repo, this.colorService);
  }

  async stop(): Promise<void> {
    if (this.db) {
      this.db.close();
    }
    this.currentAssetId = null;
  }

  async createAsset(name: string, width: number, height: number): Promise<string> {
    const res = await dispatchJsonRpc(this.service, {
      jsonrpc: '2.0',
      id: 1,
      method: 'createAsset',
      params: [{ name, width, height }]
    });

    if (res.error) {
      throw new Error(`JSON-RPC Error: ${res.error.message}`);
    }

    this.currentAssetId = res.result.asset.id;
    return this.currentAssetId!;
  }

  private ensureAssetId(): string {
    if (!this.currentAssetId) {
      throw new Error('No active asset ID in JsonRpcDriver');
    }
    return this.currentAssetId;
  }

  async getAssetDimensions(): Promise<{ width: number; height: number }> {
    const id = this.ensureAssetId();
    const res = await dispatchJsonRpc(this.service, {
      jsonrpc: '2.0',
      id: 1,
      method: 'getAsset',
      params: [{ assetId: id }]
    });

    if (res.error) throw new Error(res.error.message);
    return { width: res.result.asset.width, height: res.result.asset.height };
  }

  async getAssetName(): Promise<string> {
    const id = this.ensureAssetId();
    const res = await dispatchJsonRpc(this.service, {
      jsonrpc: '2.0',
      id: 1,
      method: 'getAsset',
      params: [{ assetId: id }]
    });

    if (res.error) throw new Error(res.error.message);
    return res.result.asset.name;
  }

  async getPaintedCellCount(): Promise<number> {
    const id = this.ensureAssetId();
    const res = await dispatchJsonRpc(this.service, {
      jsonrpc: '2.0',
      id: 1,
      method: 'getAsset',
      params: [{ assetId: id }]
    });

    if (res.error) throw new Error(res.error.message);
    return res.result.asset.paintedCellsCount;
  }

  async getCellColor(x: number, y: number): Promise<number | null> {
    const id = this.ensureAssetId();
    const res = await dispatchJsonRpc(this.service, {
      jsonrpc: '2.0',
      id: 1,
      method: 'getAsset',
      params: [{ assetId: id }]
    });

    if (res.error) throw new Error(res.error.message);
    const cell = res.result.asset.cells.find((c: any) => c.x === x && c.y === y);
    return cell ? cell.colorId : null;
  }

  async updateDimensions(width: number, height: number): Promise<void> {
    const id = this.ensureAssetId();
    const res = await dispatchJsonRpc(this.service, {
      jsonrpc: '2.0',
      id: 1,
      method: 'updateAsset',
      params: [{ assetId: id, width, height }]
    });

    if (res.error) throw new Error(res.error.message);
  }

  async updateName(name: string): Promise<void> {
    const id = this.ensureAssetId();
    const res = await dispatchJsonRpc(this.service, {
      jsonrpc: '2.0',
      id: 1,
      method: 'updateAsset',
      params: [{ assetId: id, name }]
    });

    if (res.error) throw new Error(res.error.message);
  }

  async paintArea(x: number, y: number, width: number, height: number, colorId: number | null): Promise<number> {
    const id = this.ensureAssetId();
    const res = await dispatchJsonRpc(this.service, {
      jsonrpc: '2.0',
      id: 1,
      method: 'paintArea',
      params: [{
        assetId: id,
        bbox: { x, y, width, height },
        colorId
      }]
    });

    if (res.error) throw new Error(res.error.message);
    return res.result.affectedCellsCount;
  }

  async deleteAsset(): Promise<void> {
    const id = this.ensureAssetId();
    const res = await dispatchJsonRpc(this.service, {
      jsonrpc: '2.0',
      id: 1,
      method: 'deleteAsset',
      params: [{ assetId: id }]
    });

    if (res.error) throw new Error(res.error.message);
    this.currentAssetId = null;
  }

  async assetExists(): Promise<boolean> {
    if (!this.currentAssetId) return false;
    const res = await dispatchJsonRpc(this.service, {
      jsonrpc: '2.0',
      id: 1,
      method: 'getAsset',
      params: [{ assetId: this.currentAssetId }]
    });
    return !res.error;
  }

  async listColors(): Promise<BrickColor[]> {
    const res = await dispatchJsonRpc(this.service, {
      jsonrpc: '2.0',
      id: 1,
      method: 'listColors',
      params: [{}]
    });

    if (res.error) throw new Error(res.error.message);
    return res.result.colors;
  }
}
