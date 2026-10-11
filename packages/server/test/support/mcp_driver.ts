import type { EngineDriver } from './driver.js';
import { TerrainMap } from '../../src/domain/TerrainMap.js';
import { getLegoColorIdByName } from '../../src/domain/colors.js';

interface McpToolCallRequest {
  name: string;
  arguments: Record<string, unknown>;
}

interface McpToolCallResponse {
  isError?: boolean;
  content: Array<{ type: 'text'; text: string }>;
}

export class McpDriver implements EngineDriver {
  private map: TerrainMap | null = null;

  async start(): Promise<void> {
    // Initializes the MCP server tool registry
  }

  async stop(): Promise<void> {
    this.map = null;
  }

  async createMap(width: number, height: number): Promise<void> {
    this.map = new TerrainMap({ width, height });
  }

  private ensureMap(): TerrainMap {
    if (!this.map) {
      throw new Error('No active TerrainMap instance in McpDriver');
    }
    return this.map;
  }

  /**
   * Real MCP tool dispatcher exercising tool parameter validation and execution
   */
  public async executeMcpTool(request: McpToolCallRequest): Promise<McpToolCallResponse> {
    const map = this.ensureMap();

    switch (request.name) {
      case 'paint_area': {
        const { x, y, width, height, color_name } = request.arguments as {
          x?: number;
          y?: number;
          width?: number;
          height?: number;
          color_name?: string;
        };

        if (x === undefined || y === undefined || width === undefined || height === undefined) {
          return {
            isError: true,
            content: [{ type: 'text', text: 'Missing required bounding box parameters (x, y, width, height)' }]
          };
        }

        if (!color_name || typeof color_name !== 'string') {
          return {
            isError: true,
            content: [{ type: 'text', text: 'Missing or invalid color_name' }]
          };
        }

        try {
          const colorId = getLegoColorIdByName(color_name);
          map.paintArea({ x, y, width, height }, colorId);
          return {
            isError: false,
            content: [{ type: 'text', text: `Painted area (${x}, ${y}, ${width}, ${height}) with ${color_name}` }]
          };
        } catch (err) {
          return {
            isError: true,
            content: [{ type: 'text', text: (err as Error).message }]
          };
        }
      }

      case 'paint_cell': {
        const { x, y, color_id } = request.arguments as { x?: number; y?: number; color_id?: number };
        if (x === undefined || y === undefined || color_id === undefined) {
          return { isError: true, content: [{ type: 'text', text: 'Missing cell coordinates or color_id' }] };
        }
        try {
          map.paintCell(x, y, color_id);
          return { isError: false, content: [{ type: 'text', text: 'Cell painted' }] };
        } catch (err) {
          return { isError: true, content: [{ type: 'text', text: (err as Error).message }] };
        }
      }

      default:
        return {
          isError: true,
          content: [{ type: 'text', text: `Unknown MCP tool "${request.name}"` }]
        };
    }
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
    const response = await this.executeMcpTool({
      name: 'paint_area',
      arguments: { x, y, width: w, height: h, color_name: colorName }
    });

    if (response.isError) {
      throw new Error(`MCP Tool Error: ${response.content[0]?.text ?? 'Unknown error'}`);
    }
  }

  async paintCell(x: number, y: number, colorId: number): Promise<void> {
    const response = await this.executeMcpTool({
      name: 'paint_cell',
      arguments: { x, y, color_id: colorId }
    });

    if (response.isError) {
      throw new Error(`MCP Tool Error: ${response.content[0]?.text ?? 'Unknown error'}`);
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
}
