import type { BoundingBox } from '@lego-wargame-terrain-studio/domain';
import { recoverBoundingBox } from '@lego-wargame-terrain-studio/domain';
import type { ViewportStorageService } from './ViewportStorageService.js';

export class LocalStorageViewportStorage implements ViewportStorageService {
  private getStorageKey(assetId: string): string {
    return `bwts:bbox:${assetId}`;
  }

  loadBoundingBox(assetId: string, assetWidth: number, assetHeight: number): BoundingBox | null {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return null;
      }
      const rawJson = window.localStorage.getItem(this.getStorageKey(assetId));
      if (!rawJson) return null;

      const parsed = JSON.parse(rawJson);
      const recovered = recoverBoundingBox(parsed, assetWidth, assetHeight);

      if (recovered) {
        // Self-healing write back if values were adjusted
        if (
          recovered.x !== parsed.x ||
          recovered.y !== parsed.y ||
          recovered.width !== parsed.width ||
          recovered.height !== parsed.height
        ) {
          this.saveBoundingBox(assetId, recovered);
        }
      }

      return recovered;
    } catch (err) {
      console.warn(`[LocalStorageViewportStorage] Failed to load bounding box for ${assetId}:`, err);
      return null;
    }
  }

  saveBoundingBox(assetId: string, boundingBox: BoundingBox): void {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return;
      }
      window.localStorage.setItem(this.getStorageKey(assetId), JSON.stringify(boundingBox));
    } catch (err) {
      console.warn(`[LocalStorageViewportStorage] Failed to save bounding box for ${assetId}:`, err);
    }
  }

  removeBoundingBox(assetId: string): void {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        return;
      }
      window.localStorage.removeItem(this.getStorageKey(assetId));
    } catch (err) {
      console.warn(`[LocalStorageViewportStorage] Failed to remove bounding box for ${assetId}:`, err);
    }
  }
}

export class MemoryViewportStorage implements ViewportStorageService {
  private readonly store = new Map<string, string>();

  private getStorageKey(assetId: string): string {
    return `bwts:bbox:${assetId}`;
  }

  loadBoundingBox(assetId: string, assetWidth: number, assetHeight: number): BoundingBox | null {
    const rawJson = this.store.get(this.getStorageKey(assetId));
    if (!rawJson) return null;

    try {
      const parsed = JSON.parse(rawJson);
      const recovered = recoverBoundingBox(parsed, assetWidth, assetHeight);

      if (recovered) {
        // Self-healing write back
        if (
          recovered.x !== parsed.x ||
          recovered.y !== parsed.y ||
          recovered.width !== parsed.width ||
          recovered.height !== parsed.height
        ) {
          this.saveBoundingBox(assetId, recovered);
        }
      }

      return recovered;
    } catch {
      return null;
    }
  }

  saveBoundingBox(assetId: string, boundingBox: BoundingBox): void {
    this.store.set(this.getStorageKey(assetId), JSON.stringify(boundingBox));
  }

  removeBoundingBox(assetId: string): void {
    this.store.delete(this.getStorageKey(assetId));
  }
}
