import type { Asset } from './Asset.js';
import type { AssetSummary } from '@lego-wargame-terrain-studio/api';

export interface AssetRepository {
  create(asset: Asset): Promise<void>;
  findById(id: string): Promise<Asset | null>;
  listAll(): Promise<AssetSummary[]>;
  update(asset: Asset): Promise<void>;
  delete(id: string): Promise<void>;
}
