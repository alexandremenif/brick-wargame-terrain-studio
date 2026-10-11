import type { EngineDriver } from './driver.js';
import { TerrainMap } from '../../src/domain/TerrainMap.js';
import { getLegoColorIdByName } from '../../src/domain/colors.js';

export class InMemoryDriver implements EngineDriver {
  private map: TerrainMap | null = null;

  async start(): Promise<void> {
    // In-memory driver ready
  }

  async stop(): Promise<void> {
    this.map = null;
  }

  async createMap(width: number, height: number): Promise<void> {
    this.map = new TerrainMap({ width, height });
  }

  private ensureMap(): TerrainMap {
    if (!this.map) {
      throw new Error('No active TerrainMap instance in InMemoryDriver');
    }
    return this.map;
  }

  async getMapDimensions(): Promise<{ width: number; height: number }> {
    const map = this.ensureMap();
    return { width: map.width, height: map.height };
  }

  async getPaintedCellCount(): Promise<number> {
    const map = this.ensureMap();
    return map.getPaintedCellCount();
  }

  async paintBoundingBox(x: number, y: number, w: number, h: number, colorName: string): Promise<void> {
    const map = this.ensureMap();
    const colorId = getLegoColorIdByName(colorName);
    map.paintArea({ x, y, width: w, height: h }, colorId);
  }

  async paintCell(x: number, y: number, colorId: number): Promise<void> {
    const map = this.ensureMap();
    map.paintCell(x, y, colorId);
  }

  async verifyBBoxColor(x: number, y: number, w: number, h: number, colorName: string): Promise<boolean> {
    const map = this.ensureMap();
    const expectedColorId = getLegoColorIdByName(colorName);
    for (let currentX = x; currentX < x + w; currentX++) {
      for (let currentY = y; currentY < y + h; currentY++) {
        if (map.getCellColor(currentX, currentY) !== expectedColorId) {
          return false;
        }
      }
    }
    return true;
  }

  async getUndoHistoryCount(): Promise<number> {
    const map = this.ensureMap();
    return map.getUndoHistoryCount();
  }

  async undo(): Promise<void> {
    const map = this.ensureMap();
    map.undo();
  }
}
