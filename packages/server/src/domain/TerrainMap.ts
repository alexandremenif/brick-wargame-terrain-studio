export interface MapOptions {
  width: number;
  height: number;
}

export interface BoundingBoxInput {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface CellRecord {
  x: number;
  y: number;
  colorId: number;
}

export class TerrainMap {
  public readonly width: number;
  public readonly height: number;
  private readonly cells: Map<string, number> = new Map();
  private undoHistory: Array<{ type: string; payload: unknown }> = [];

  constructor(options: MapOptions = { width: 118, height: 225 }) {
    if (options.width <= 0 || options.height <= 0) {
      throw new Error('Map dimensions must be strictly positive');
    }
    this.width = options.width;
    this.height = options.height;
  }

  private cellKey(x: number, y: number): string {
    return `${x},${y}`;
  }

  public assertWithinBounds(x: number, y: number): void {
    if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
      throw new Error(`Coordinates (${x}, ${y}) are out of map bounds (${this.width}x${this.height})`);
    }
  }

  public paintCell(x: number, y: number, colorId: number): void {
    this.assertWithinBounds(x, y);
    this.cells.set(this.cellKey(x, y), colorId);
  }

  public paintArea(bbox: BoundingBoxInput, colorId: number): void {
    const endX = bbox.x + bbox.width;
    const endY = bbox.y + bbox.height;

    for (let x = bbox.x; x < endX; x++) {
      for (let y = bbox.y; y < endY; y++) {
        this.assertWithinBounds(x, y);
        this.cells.set(this.cellKey(x, y), colorId);
      }
    }

    this.undoHistory.push({
      type: 'PAINT_AREA',
      payload: { bbox, colorId }
    });
  }

  public getPaintedCellCount(): number {
    return this.cells.size;
  }

  public getCellColor(x: number, y: number): number | undefined {
    this.assertWithinBounds(x, y);
    return this.cells.get(this.cellKey(x, y));
  }

  public getUndoHistoryCount(): number {
    return this.undoHistory.length;
  }
}
