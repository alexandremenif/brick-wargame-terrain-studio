import type { EngineDriver } from './driver.js';
import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';
import { DefaultColorService } from '../../src/domain/ColorService.js';
import { SqliteAssetRepository } from '../../src/persistence/SqliteAssetRepository.js';
import { AssetService } from '../../src/domain/AssetService.js';
import { createMcpServer } from '../../src/adapters/mcp.js';
import type { BrickColor } from '@lego-wargame-terrain-studio/domain';

export class McpDriver implements EngineDriver {
  private db!: Database.Database;
  private colorService!: DefaultColorService;
  private repo!: SqliteAssetRepository;
  private service!: AssetService;
  private mcpServer: any;
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
    this.mcpServer = createMcpServer(this.service, this.colorService);
  }

  async stop(): Promise<void> {
    if (this.db) {
      this.db.close();
    }
    this.currentAssetId = null;
  }

  private async callMcpTool(name: string, args: Record<string, unknown>): Promise<any> {
    const handler = (this.mcpServer as any)._requestHandlers.get('tools/call');
    if (!handler) {
      throw new Error('MCP server does not have a tools/call handler registered');
    }
    const res = await handler({
      method: 'tools/call',
      params: { name, arguments: args }
    });

    if (res.isError) {
      throw new Error(res.content?.[0]?.text || 'MCP tool error');
    }

    return JSON.parse(res.content[0].text);
  }

  async createAsset(name: string, width: number, height: number): Promise<string> {
    const asset = await this.callMcpTool('create_asset', { name, width, height });
    this.currentAssetId = asset.id;
    return asset.id;
  }

  private ensureAssetId(): string {
    if (!this.currentAssetId) {
      throw new Error('No active asset ID in McpDriver');
    }
    return this.currentAssetId;
  }

  async getAssetDimensions(): Promise<{ width: number; height: number }> {
    const id = this.ensureAssetId();
    const asset = await this.callMcpTool('get_asset', { asset_id: id });
    return { width: asset.width, height: asset.height };
  }

  async getAssetName(): Promise<string> {
    const id = this.ensureAssetId();
    const asset = await this.callMcpTool('get_asset', { asset_id: id });
    return asset.name;
  }

  async getPaintedCellCount(): Promise<number> {
    const id = this.ensureAssetId();
    const asset = await this.callMcpTool('get_asset', { asset_id: id });
    return asset.paintedCellsCount;
  }

  async getCellColor(x: number, y: number): Promise<number | null> {
    const id = this.ensureAssetId();
    const asset = await this.callMcpTool('get_asset', { asset_id: id });
    const cell = asset.cells.find((c: any) => c.x === x && c.y === y);
    return cell ? cell.colorId : null;
  }

  async updateDimensions(width: number, height: number): Promise<void> {
    const id = this.ensureAssetId();
    await this.callMcpTool('update_asset', { asset_id: id, width, height });
  }

  async updateName(name: string): Promise<void> {
    const id = this.ensureAssetId();
    await this.callMcpTool('update_asset', { asset_id: id, name });
  }

  async paintArea(x: number, y: number, width: number, height: number, colorId: number | null): Promise<number> {
    const id = this.ensureAssetId();
    const res = await this.callMcpTool('paint_area', {
      asset_id: id,
      x,
      y,
      width,
      height,
      color_id: colorId
    });
    return res.affectedCellsCount;
  }

  async deleteAsset(): Promise<void> {
    const id = this.ensureAssetId();
    await this.callMcpTool('delete_asset', { asset_id: id });
    this.currentAssetId = null;
  }

  async assetExists(): Promise<boolean> {
    if (!this.currentAssetId) return false;
    try {
      await this.callMcpTool('get_asset', { asset_id: this.currentAssetId });
      return true;
    } catch {
      return false;
    }
  }

  async listColors(): Promise<BrickColor[]> {
    return await this.callMcpTool('list_colors', {});
  }
}
