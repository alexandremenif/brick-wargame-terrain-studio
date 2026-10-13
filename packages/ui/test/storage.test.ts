import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { MemoryViewportStorage, LocalStorageViewportStorage } from '../src/storage/adapters.js';

describe('Viewport Storage Persistence (TEST-UI-STORAGE)', () => {
  describe('MemoryViewportStorage', () => {
    it('TEST-UI-STORAGE-01: saves and loads bounding box for asset ID', () => {
      const storage = new MemoryViewportStorage();
      storage.saveBoundingBox('asset-1', { x: 4, y: 6, width: 12, height: 10 });

      const loaded = storage.loadBoundingBox('asset-1', 32, 32);
      assert.deepStrictEqual(loaded, { x: 4, y: 6, width: 12, height: 10 });
    });

    it('TEST-UI-STORAGE-02: returns null when loading non-existent, corrupted, or non-numeric entries', () => {
      const storage = new MemoryViewportStorage();
      // Non-existent key
      assert.strictEqual(storage.loadBoundingBox('non-existent', 32, 32), null);

      // Corrupted JSON
      (storage as any).store.set('bwts:bbox:corrupt-json', '{not a valid json');
      assert.strictEqual(storage.loadBoundingBox('corrupt-json', 32, 32), null);

      // Non-object JSON
      (storage as any).store.set('bwts:bbox:number-val', '42');
      assert.strictEqual(storage.loadBoundingBox('number-val', 32, 32), null);
      (storage as any).store.set('bwts:bbox:array-val', '[1, 2, 3]');
      assert.strictEqual(storage.loadBoundingBox('array-val', 32, 32), null);

      // Object with non-numeric fields
      (storage as any).store.set('bwts:bbox:bad-fields', JSON.stringify({ x: 'bad', y: NaN, width: 10, height: 10 }));
      assert.strictEqual(storage.loadBoundingBox('bad-fields', 32, 32), null);
    });

    it('TEST-UI-STORAGE-03: caps dimensions when asset is shrunk', () => {
      const storage = new MemoryViewportStorage();
      storage.saveBoundingBox('asset-1', { x: 0, y: 0, width: 48, height: 48 });

      const loaded = storage.loadBoundingBox('asset-1', 32, 32);
      assert.deepStrictEqual(loaded, { x: 0, y: 0, width: 32, height: 32 });
    });

    it('TEST-UI-STORAGE-04: shifts and clamps coordinates when origin falls outside resized bounds', () => {
      const storage = new MemoryViewportStorage();
      storage.saveBoundingBox('asset-1', { x: 25, y: 25, width: 10, height: 10 });

      const loaded = storage.loadBoundingBox('asset-1', 30, 30);
      assert.deepStrictEqual(loaded, { x: 20, y: 20, width: 10, height: 10 });
    });

    it('TEST-UI-STORAGE-05: self-heals stale entry by writing healed coordinates back to storage', () => {
      const storage = new MemoryViewportStorage();
      // Initially saved on a 64x64 asset at (20, 20, 20, 20)
      storage.saveBoundingBox('asset-shrunk', { x: 20, y: 20, width: 20, height: 20 });

      // Shrunk to 16x16: must clamp to (0, 0, 16, 16) and write back
      const loaded = storage.loadBoundingBox('asset-shrunk', 16, 16);
      assert.deepStrictEqual(loaded, { x: 0, y: 0, width: 16, height: 16 });

      // Strictly verify self-healing write-back:
      // When querying the same entry now against original 64x64 dimensions,
      // it MUST return the healed (0, 0, 16, 16), proving storage itself was mutated!
      const verifyWritten = storage.loadBoundingBox('asset-shrunk', 64, 64);
      assert.deepStrictEqual(verifyWritten, { x: 0, y: 0, width: 16, height: 16 });
    });

    it('TEST-UI-STORAGE-07: removes bounding box on asset deletion', () => {
      const storage = new MemoryViewportStorage();
      storage.saveBoundingBox('asset-delete', { x: 2, y: 2, width: 8, height: 8 });
      assert.deepStrictEqual(storage.loadBoundingBox('asset-delete', 32, 32), { x: 2, y: 2, width: 8, height: 8 });

      storage.removeBoundingBox('asset-delete');
      assert.strictEqual(storage.loadBoundingBox('asset-delete', 32, 32), null);
    });
  });

  describe('LocalStorageViewportStorage (TEST-UI-STORAGE-06)', () => {
    let mockStore: Map<string, string>;

    beforeEach(() => {
      mockStore = new Map();
      (global as any).window = {
        localStorage: {
          getItem: (key: string) => mockStore.get(key) ?? null,
          setItem: (key: string, val: string) => {
            mockStore.set(key, val);
          },
          removeItem: (key: string) => {
            mockStore.delete(key);
          },
        },
      };
    });

    it('TEST-UI-STORAGE-01: persists and loads using key schema bwts:bbox:<assetId>', () => {
      const storage = new LocalStorageViewportStorage();
      storage.saveBoundingBox('asset-local', { x: 10, y: 10, width: 8, height: 8 });

      assert.strictEqual(
        mockStore.get('bwts:bbox:asset-local'),
        JSON.stringify({ x: 10, y: 10, width: 8, height: 8 })
      );

      const loaded = storage.loadBoundingBox('asset-local', 32, 32);
      assert.deepStrictEqual(loaded, { x: 10, y: 10, width: 8, height: 8 });
    });

    it('TEST-UI-STORAGE-06: safely catches and swallows storage exceptions without throwing', () => {
      (global as any).window.localStorage.setItem = () => {
        throw new Error('QuotaExceededError: DOM Exception 22');
      };
      (global as any).window.localStorage.getItem = () => {
        throw new Error('SecurityError: Access Denied');
      };
      (global as any).window.localStorage.removeItem = () => {
        throw new Error('SecurityError: Access Denied');
      };

      const storage = new LocalStorageViewportStorage();

      // Ensure no method throws
      assert.doesNotThrow(() => {
        storage.saveBoundingBox('asset-fail', { x: 0, y: 0, width: 10, height: 10 });
      });

      assert.doesNotThrow(() => {
        const res = storage.loadBoundingBox('asset-fail', 32, 32);
        assert.strictEqual(res, null);
      });

      assert.doesNotThrow(() => {
        storage.removeBoundingBox('asset-fail');
      });
    });

    it('safely handles missing window or localStorage globals in non-browser environments', () => {
      (global as any).window = undefined;
      const storage = new LocalStorageViewportStorage();

      assert.strictEqual(storage.loadBoundingBox('any', 32, 32), null);
      assert.doesNotThrow(() => {
        storage.saveBoundingBox('any', { x: 0, y: 0, width: 10, height: 10 });
      });
      assert.doesNotThrow(() => {
        storage.removeBoundingBox('any');
      });
    });
  });
});
