import type { EngineDriver } from '../../../core-engine/test/support/driver.js';
import { TerrainMap } from '../../../core-engine/src/domain/TerrainMap.js';
import { getLegoColorIdByName } from '../../../core-engine/src/domain/colors.js';
import { dispatchJsonRpc, type ITerrainEngineHandler } from '../../../core-engine/src/generated/domain/jsonRpcDispatcher.js';

export class JsonRpcDriver implements EngineDriver {
  private map: TerrainMap | null = null;
  private handler!: ITerrainEngineHandler;

  async start(): Promise<void> {
    this.handler = {
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
        return { success: true };
      },
      placePreset: async () => ({ success: true }),
      movePreset: async () => ({ success: true }),
      deletePreset: async () => ({ success: true }),
      undo: async () => ({ success: true }),
      redo: async () => ({ success: true }),
      renderBBoxImage: async () => ({ imageBase64: '' })
    };
  }

  async stop(): Promise<void> {
    this.map = null;
  }

  async createMap(width: number, height: number): Promise<void> {
    this.map = new TerrainMap({ width, height });
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
    const response = await dispatchJsonRpc(this.handler, {
      jsonrpc: '2.0',
      id: 1,
      method: 'paintArea',
      params: {
        bbox: { x, y, width: w, height: h },
        colorId
      }
    });

    if (response.error) {
      throw new Error(`JSON-RPC Error: ${response.error.message}`);
    }
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
}
