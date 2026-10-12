import type { BoundingBox } from '@lego-wargame-terrain-studio/domain';

/**
 * Storage adapter interface for viewport bounding box persistence.
 * Adheres to Project TypeScript Naming Conventions Rule (no 'I' prefix).
 */
export interface ViewportStorageService {
  loadBoundingBox(assetId: string, assetWidth: number, assetHeight: number): BoundingBox | null;
  saveBoundingBox(assetId: string, boundingBox: BoundingBox): void;
  removeBoundingBox(assetId: string): void;
}
