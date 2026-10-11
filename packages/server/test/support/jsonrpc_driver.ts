import type { EngineDriver } from './driver.js';
import { TerrainMap } from '../../src/domain/TerrainMap.js';
import { getLegoColorIdByName } from '../../src/domain/colors.js';
import { dispatchJsonRpc, type TerrainEngineService } from '../../src/router.js';

export class JsonRpcDriver implements EngineDriver {
  private map: TerrainMap | null = null;
  private service!: TerrainEngineService;

  async start(): Promise<void> {
    this.service = {
      createMap: async (command) => {
        this.map = new TerrainMap({ width: command.width, height: command.height });
        return { mapId: command.mapId || 'main', width: this.map.width, height: this.map.height };
      },
      paintArea: async (command) => {
        if (!this.map) throw new Error('No active map');
        this.map.paintArea(
          {
            x: command.bbox?.x ?? 0,
            y: command.bbox?.y ?? 0,
            width: command.bbox?.width ?? 0,
            height: command.bbox?.height ?? 0
          },
          command.colorId ?? 1
        );
        return { affectedCellsCount: (command.bbox?.width ?? 0) * (command.bbox?.height ?? 0) };
      },
      paintCell: async (command) => {
        if (!this.map) throw new Error('No active map');
        this.map.paintCell(command.x, command.y, command.colorId);
        return { success: true };
      },
      undo: async () => {
        if (!this.map) throw new Error('No active map');
        const undone = this.map.undo();
        return { undone, remainingUndoCount: this.map.getUndoHistoryCount() };
      }
    };
  }

  async stop(): Promise<void> {
    this.map = null;
  }

  async createMap(width: number, height: number): Promise<void> {
    if (!this.service) {
      await this.start();
    }
    const response = await dispatchJsonRpc(this.service, {
      jsonrpc: '2.0',
      id: 1,
      method: 'createMap',
      params: [{
        mapId: 'main',
        width,
        height
      }]
    });

    if (response.error) {
      throw new Error(`JSON-RPC Error: ${response.error.message}`);
    }
  }

  private ensureMap(): TerrainMap {
    if (!this.map) {
      throw new Error('No active TerrainMap instance in JsonRpcDriver');
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
    const colorId = getLegoColorIdByName(colorName);
    const response = await dispatchJsonRpc(this.service, {
      jsonrpc: '2.0',
      id: 1,
      method: 'paintArea',
      params: [{
        mapId: 'main',
        bbox: { x, y, width: w, height: h },
        colorId
      }]
    });

    if (response.error) {
      throw new Error(`JSON-RPC Error: ${response.error.message}`);
    }
  }

  async paintCell(x: number, y: number, colorId: number): Promise<void> {
    const response = await dispatchJsonRpc(this.service, {
      jsonrpc: '2.0',
      id: 1,
      method: 'paintCell',
      params: [{
        mapId: 'main',
        x,
        y,
        colorId
      }]
    });

    if (response.error) {
      throw new Error(`JSON-RPC Error: ${response.error.message}`);
    }
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
    const response = await dispatchJsonRpc(this.service, {
      jsonrpc: '2.0',
      id: 1,
      method: 'undo',
      params: [{
        mapId: 'main'
      }]
    });

    if (response.error) {
      throw new Error(`JSON-RPC Error: ${response.error.message}`);
    }
  }
}
