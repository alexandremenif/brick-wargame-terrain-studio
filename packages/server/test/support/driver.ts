export interface EngineDriver {
  start(): Promise<void>;
  stop(): Promise<void>;
  createMap(width: number, height: number): Promise<void>;
  getMapDimensions(): Promise<{ width: number; height: number }>;
  getPaintedCellCount(): Promise<number>;
  paintBoundingBox(x: number, y: number, w: number, h: number, colorName: string): Promise<void>;
  paintCell(x: number, y: number, colorId: number): Promise<void>;
  verifyBBoxColor(x: number, y: number, w: number, h: number, colorName: string): Promise<boolean>;
  getUndoHistoryCount(): Promise<number>;
}
