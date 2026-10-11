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
    const key = this.cellKey(x, y);
    const prevColor = this.cells.get(key);
    this.cells.set(key, colorId);
    this.undoHistory.push({
      type: 'PAINT_CELL',
      payload: { key, prevColor, colorId }
    });
  }

  public paintArea(bbox: BoundingBoxInput, colorId: number): void {
    if (bbox.width <= 0 || bbox.height <= 0) {
      throw new Error(`Bounding box dimensions must be strictly positive (${bbox.width}x${bbox.height})`);
    }

    const endX = bbox.x + bbox.width;
    const endY = bbox.y + bbox.height;

    // Atomicity check: ensure whole area is valid before mutating any cell
    this.assertWithinBounds(bbox.x, bbox.y);
    this.assertWithinBounds(endX - 1, endY - 1);

    const previousCells: Array<{ key: string; prevColor?: number }> = [];

    for (let x = bbox.x; x < endX; x++) {
      for (let y = bbox.y; y < endY; y++) {
        const key = this.cellKey(x, y);
        previousCells.push({ key, prevColor: this.cells.get(key) });
        this.cells.set(key, colorId);
      }
    }

    this.undoHistory.push({
      type: 'PAINT_AREA',
      payload: { bbox, colorId, previousCells }
    });
  }

  public undo(): boolean {
    const lastAction = this.undoHistory.pop();
    if (!lastAction) return false;

    if (lastAction.type === 'PAINT_AREA') {
      const { previousCells } = lastAction.payload as { previousCells: Array<{ key: string; prevColor?: number }> };
      for (const cell of previousCells) {
        if (cell.prevColor !== undefined) {
          this.cells.set(cell.key, cell.prevColor);
        } else {
          this.cells.delete(cell.key);
        }
      }
    } else if (lastAction.type === 'PAINT_CELL') {
      const { key, prevColor } = lastAction.payload as { key: string; prevColor?: number };
      if (prevColor !== undefined) {
        this.cells.set(key, prevColor);
      } else {
        this.cells.delete(key);
      }
    }
    return true;
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
