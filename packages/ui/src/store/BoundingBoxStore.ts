import type { BoundingBox } from '@lego-wargame-terrain-studio/api';
import {
  clampBoundingBox,
  panBoundingBox,
  centerBoundingBoxAt,
  zoomBoundingBox,
} from '@lego-wargame-terrain-studio/api';
import type { ViewportStorageService } from '../storage/ViewportStorageService.js';
import { LocalStorageViewportStorage } from '../storage/adapters.js';

export interface BoundingBoxState {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type BoundingBoxListener = (state: BoundingBoxState) => void;

export class BoundingBoxStore {
  private current: BoundingBoxState;
  private assetId: string;
  private assetWidth: number;
  private assetHeight: number;
  private storage: ViewportStorageService;
  private listeners = new Set<BoundingBoxListener>();
  private saveTimeout: any = null;

  constructor(
    assetId: string,
    assetWidth: number,
    assetHeight: number,
    storage?: ViewportStorageService
  ) {
    this.assetId = assetId;
    this.assetWidth = assetWidth;
    this.assetHeight = assetHeight;
    this.storage = storage || new LocalStorageViewportStorage();

    // Initial load or fit to asset
    const stored = this.storage.loadBoundingBox(assetId, assetWidth, assetHeight);
    if (stored) {
      this.current = stored;
    } else {
      this.current = { x: 0, y: 0, width: assetWidth, height: assetHeight };
    }
  }

  public getState(): BoundingBoxState {
    return { ...this.current };
  }

  public subscribe(listener: BoundingBoxListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify(): void {
    const state = this.getState();
    this.listeners.forEach((listener) => listener(state));
    this.scheduleSave();
  }

  private scheduleSave(): void {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }
    // Debounced persist
    this.saveTimeout = setTimeout(() => {
      this.storage.saveBoundingBox(this.assetId, this.getState());
    }, 150);
  }

  private deletedAssetIds = new Set<string>();

  public setAsset(assetId: string, width: number, height: number): void {
    // Flush pending save for previous asset unless it was marked as deleted
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
      if (!this.deletedAssetIds.has(this.assetId)) {
        this.storage.saveBoundingBox(this.assetId, this.getState());
      }
      this.saveTimeout = null;
    }

    this.assetId = assetId;
    this.assetWidth = width;
    this.assetHeight = height;

    const stored = this.storage.loadBoundingBox(assetId, width, height);
    if (stored) {
      this.current = stored;
    } else {
      this.current = { x: 0, y: 0, width, height };
    }

    const state = this.getState();
    this.listeners.forEach((listener) => listener(state));
  }

  public syncAssetDimensions(width: number, height: number): void {
    this.assetWidth = width;
    this.assetHeight = height;
    this.current = clampBoundingBox(this.current, width, height);
    this.notify();
  }

  public setBoundingBox(partial: Partial<BoundingBoxState>): void {
    const merged = { ...this.current, ...partial };
    this.current = clampBoundingBox(merged, this.assetWidth, this.assetHeight);
    this.notify();
  }

  public panBy(deltaX: number, deltaY: number): void {
    this.current = panBoundingBox(
      this.current,
      deltaX,
      deltaY,
      this.assetWidth,
      this.assetHeight
    );
    this.notify();
  }

  public centerAt(targetX: number, targetY: number): void {
    this.current = centerBoundingBoxAt(
      targetX,
      targetY,
      this.current.width,
      this.current.height,
      this.assetWidth,
      this.assetHeight
    );
    this.notify();
  }

  public zoom(factor: number): void {
    this.current = zoomBoundingBox(
      this.current,
      factor,
      this.assetWidth,
      this.assetHeight
    );
    this.notify();
  }

  public fitToAsset(): void {
    this.current = {
      x: 0,
      y: 0,
      width: this.assetWidth,
      height: this.assetHeight,
    };
    this.notify();
  }

  public removeAsset(assetId: string): void {
    this.deletedAssetIds.add(assetId);
    if (this.saveTimeout && this.assetId === assetId) {
      clearTimeout(this.saveTimeout);
      this.saveTimeout = null;
    }
    this.storage.removeBoundingBox(assetId);
  }
}
