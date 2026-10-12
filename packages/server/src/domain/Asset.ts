import type { Asset as AssetDto, CellData, BoundingBox } from '@lego-wargame-terrain-studio/domain';

export interface AssetProps {
  id: string;
  name: string;
  width: number;
  height: number;
  cells?: Map<string, number> | CellData[];
}

export class Asset {
  public readonly id: string;
  private _name: string;
  private _width: number;
  private _height: number;
  private _cells: Map<string, number>;

  constructor(props: AssetProps) {
    if (!props.id || typeof props.id !== 'string') {
      throw new Error('Asset ID must be a non-empty string');
    }
    if (!props.name || typeof props.name !== 'string') {
      throw new Error('Asset name must be a non-empty string');
    }
    if (!Number.isInteger(props.width) || props.width < 1 || props.width > 1000) {
      throw new Error('Asset width must be an integer between 1 and 1000');
    }
    if (!Number.isInteger(props.height) || props.height < 1 || props.height > 1000) {
      throw new Error('Asset height must be an integer between 1 and 1000');
    }

    this.id = props.id;
    this._name = props.name;
    this._width = props.width;
    this._height = props.height;
    this._cells = new Map<string, number>();

    if (props.cells) {
      if (props.cells instanceof Map) {
        for (const [key, colorId] of props.cells.entries()) {
          const [xStr, yStr] = key.split(',');
          const x = Number(xStr);
          const y = Number(yStr);
          if (x >= 0 && x < this._width && y >= 0 && y < this._height) {
            this._cells.set(key, colorId);
          }
        }
      } else if (Array.isArray(props.cells)) {
        for (const cell of props.cells) {
          if (cell.x >= 0 && cell.x < this._width && cell.y >= 0 && cell.y < this._height) {
            this._cells.set(`${cell.x},${cell.y}`, cell.colorId);
          }
        }
      }
    }
  }

  public get name(): string {
    return this._name;
  }

  public get width(): number {
    return this._width;
  }

  public get height(): number {
    return this._height;
  }

  public updateName(name: string): void {
    if (!name || typeof name !== 'string') {
      throw new Error('Asset name must be a non-empty string');
    }
    this._name = name;
  }

  public updateDimensions(width: number, height: number): void {
    if (!Number.isInteger(width) || width < 1 || width > 1000) {
      throw new Error('Asset width must be an integer between 1 and 1000');
    }
    if (!Number.isInteger(height) || height < 1 || height > 1000) {
      throw new Error('Asset height must be an integer between 1 and 1000');
    }

    this._width = width;
    this._height = height;

    // Crop cells outside the new dimensions
    for (const key of Array.from(this._cells.keys())) {
      const [xStr, yStr] = key.split(',');
      const x = Number(xStr);
      const y = Number(yStr);
      if (x >= width || y >= height) {
        this._cells.delete(key);
      }
    }
  }

  /**
   * Paint or erase a rectangular area.
   * Leniently clips coordinates to [0, width - 1] x [0, height - 1].
   * If colorId is null, erases cells.
   * Returns count of affected/modified cells.
   */
  public paintArea(bbox: BoundingBox, colorId: number | null): number {
    const minX = Math.max(0, bbox.x);
    const minY = Math.max(0, bbox.y);
    const maxX = Math.min(this._width - 1, bbox.x + bbox.width - 1);
    const maxY = Math.min(this._height - 1, bbox.y + bbox.height - 1);

    if (minX > maxX || minY > maxY) {
      return 0;
    }

    let affectedCount = 0;
    for (let x = minX; x <= maxX; x++) {
      for (let y = minY; y <= maxY; y++) {
        const key = `${x},${y}`;
        if (colorId === null) {
          if (this._cells.has(key)) {
            this._cells.delete(key);
          }
        } else {
          this._cells.set(key, colorId);
        }
        affectedCount++;
      }
    }

    return affectedCount;
  }

  public getCellColor(x: number, y: number): number | null {
    if (x < 0 || x >= this._width || y < 0 || y >= this._height) {
      return null;
    }
    return this._cells.get(`${x},${y}`) ?? null;
  }

  public getPaintedCellCount(): number {
    return this._cells.size;
  }

  public getCells(): CellData[] {
    const result: CellData[] = [];
    for (const [key, colorId] of this._cells.entries()) {
      const [xStr, yStr] = key.split(',');
      result.push({
        x: Number(xStr),
        y: Number(yStr),
        colorId
      });
    }
    return result;
  }

  public toDto(): AssetDto {
    return {
      id: this.id,
      name: this._name,
      width: this._width,
      height: this._height,
      paintedCellsCount: this._cells.size,
      cells: this.getCells()
    };
  }
}
