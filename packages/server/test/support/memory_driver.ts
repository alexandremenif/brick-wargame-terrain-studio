import type { EngineDriver } from './driver.js';
import { Asset } from '../../src/domain/Asset.js';
import { DefaultColorService } from '../../src/domain/ColorService.js';
import type { BrickColor } from '@lego-wargame-terrain-studio/domain';

export class InMemoryDriver implements EngineDriver {
  private asset: Asset | null = null;
  private colorService = new DefaultColorService();

  async start(): Promise<void> {
    await this.colorService.loadColors();
  }

  async stop(): Promise<void> {
    this.asset = null;
  }

  async createAsset(name: string, width: number, height: number): Promise<string> {
    const id = 'mem-asset-' + Date.now();
    this.asset = new Asset({ id, name, width, height });
    return id;
  }

  private ensureAsset(): Asset {
    if (!this.asset) {
      throw new Error('No active Asset instance in InMemoryDriver');
    }
    return this.asset;
  }

  async getAssetDimensions(): Promise<{ width: number; height: number }> {
    const a = this.ensureAsset();
    return { width: a.width, height: a.height };
  }

  async getAssetName(): Promise<string> {
    const a = this.ensureAsset();
    return a.name;
  }

  async getPaintedCellCount(): Promise<number> {
    const a = this.ensureAsset();
    return a.getPaintedCellCount();
  }

  async getCellColor(x: number, y: number): Promise<number | null> {
    const a = this.ensureAsset();
    return a.getCellColor(x, y);
  }

  async updateDimensions(width: number, height: number): Promise<void> {
    const a = this.ensureAsset();
    a.updateDimensions(width, height);
  }

  async updateName(name: string): Promise<void> {
    const a = this.ensureAsset();
    a.updateName(name);
  }

  async paintArea(x: number, y: number, width: number, height: number, colorId: number | null): Promise<number> {
    const a = this.ensureAsset();
    if (colorId !== null && !this.colorService.isValidColorId(colorId)) {
      throw new Error(`Invalid color ID: ${colorId}`);
    }
    return a.paintArea({ x, y, width, height }, colorId);
  }

  async deleteAsset(): Promise<void> {
    this.asset = null;
  }

  async assetExists(): Promise<boolean> {
    return this.asset !== null;
  }

  async listColors(): Promise<BrickColor[]> {
    return this.colorService.listColors();
  }
}
