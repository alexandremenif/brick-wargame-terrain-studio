import type { Asset as AssetDto, BoundingBox } from '@lego-wargame-terrain-studio/domain';

export interface AssetProps {
  id: string;
  name: string;
  width: number;
  height: number;
  cells?: number[][];
}

export class Asset {
  public readonly id: string;
  private _name: string;
  private _width: number;
  private _height: number;
  private _cells: number[][];
  private _paintedCellsCount: number;

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
    this._paintedCellsCount = 0;

    this._cells = Array.from({ length: this._height }, (_, y) =>
      Array.from({ length: this._width }, (_, x) => {
        const val = props.cells?.[y]?.[x] ?? 0;
        if (val > 0) {
          this._paintedCellsCount++;
        }
        return val;
      })
    );
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

    let paintedCellsCount = 0;
    const resizedCells = Array.from({ length: height }, (_, y) =>
      Array.from({ length: width }, (_, x) => {
        const val = this._cells[y]?.[x] ?? 0;
        if (val > 0) {
          paintedCellsCount++;
        }
        return val;
      })
    );

    this._width = width;
    this._height = height;
    this._cells = resizedCells;
    this._paintedCellsCount = paintedCellsCount;
  }

  /**
   * Paint or erase a rectangular area.
   * Leniently clips coordinates to [0, width - 1] x [0, height - 1].
   * If colorId is 0, erases cells to 0 (unpainted).
   * Returns count of affected/modified cells within bounds.
   */
  public paintArea(bbox: BoundingBox, colorId: number): number {
    const minX = Math.max(0, bbox.x);
    const minY = Math.max(0, bbox.y);
    const maxX = Math.min(this._width - 1, bbox.x + bbox.width - 1);
    const maxY = Math.min(this._height - 1, bbox.y + bbox.height - 1);

    if (minX > maxX || minY > maxY) {
      return 0;
    }

    let affectedCount = 0;
    for (let y = minY; y <= maxY; y++) {
      const row = this._cells[y];
      for (let x = minX; x <= maxX; x++) {
        const prev = row[x];
        if (prev > 0 && colorId === 0) {
          this._paintedCellsCount--;
        } else if (prev === 0 && colorId > 0) {
          this._paintedCellsCount++;
        }
        row[x] = colorId;
        affectedCount++;
      }
    }

    return affectedCount;
  }

  public getCellColor(x: number, y: number): number {
    if (x < 0 || x >= this._width || y < 0 || y >= this._height) {
      return 0;
    }
    return this._cells[y]?.[x] ?? 0;
  }

  public getPaintedCellCount(): number {
    return this._paintedCellsCount;
  }

  public getCells(): number[][] {
    return this._cells.map(row => [...row]);
  }

  public toDto(): AssetDto {
    return {
      id: this.id,
      name: this._name,
      width: this._width,
      height: this._height,
      paintedCellsCount: this._paintedCellsCount,
      cells: this.getCells()
    };
  }
}
