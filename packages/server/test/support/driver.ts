import type { AssetSummary, BrickColor } from '@lego-wargame-terrain-studio/domain';

export interface EngineDriver {
  start(options?: { dbPath?: string }): Promise<void>;
  stop(): Promise<void>;
  restart?(): Promise<void>;
  createAsset(name: string, width: number, height: number): Promise<string>;
  getAssetDimensions(): Promise<{ width: number; height: number }>;
  getAssetName(): Promise<string>;
  getPaintedCellCount(): Promise<number>;
  getCellColor(x: number, y: number): Promise<number>;
  updateDimensions(width: number, height: number): Promise<void>;
  updateName(name: string): Promise<void>;
  paintArea(x: number, y: number, width: number, height: number, colorId: number): Promise<number>;
  deleteAsset(): Promise<void>;
  assetExists(): Promise<boolean>;
  listAssets(): Promise<AssetSummary[]>;
  listColors(): Promise<BrickColor[]>;
  exportImage(options?: { bbox?: { x: number; y: number; width: number; height: number }; profile?: string; assetId?: string }): Promise<{ data: string }>;
}
