import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { BoundingBoxStore, type BoundingBoxState } from '../src/store/BoundingBoxStore.js';
import { MemoryViewportStorage } from '../src/storage/adapters.js';

describe('BoundingBoxStore State Management (TEST-UI-BBOX)', () => {
  it('TEST-UI-BBOX-01: clamps coordinates and dimensions within asset bounds including negatives and overflows', () => {
    const storage = new MemoryViewportStorage();
    const store = new BoundingBoxStore('test-1', 32, 32, storage);

    // Overflowing positive coordinates
    store.setBoundingBox({ x: 30, y: 30, width: 10, height: 10 });
    assert.deepStrictEqual(store.getState(), { x: 22, y: 22, width: 10, height: 10 });

    // Negative coordinates and zero dimensions
    store.setBoundingBox({ x: -10, y: -5, width: 0, height: -2 });
    assert.deepStrictEqual(store.getState(), { x: 0, y: 0, width: 1, height: 1 });

    // Dimensions exceeding asset size
    store.setBoundingBox({ x: 0, y: 0, width: 100, height: 100 });
    assert.deepStrictEqual(store.getState(), { x: 0, y: 0, width: 32, height: 32 });
  });

  it('TEST-UI-BBOX-03: automatically restores stored bounding box on mount or asset switch', () => {
    const storage = new MemoryViewportStorage();
    storage.saveBoundingBox('asset-preset', { x: 4, y: 6, width: 12, height: 10 });

    const store = new BoundingBoxStore('asset-preset', 32, 32, storage);
    assert.deepStrictEqual(store.getState(), { x: 4, y: 6, width: 12, height: 10 });

    // Switching to asset with no stored bbox defaults to full asset
    store.setAsset('asset-empty', 48, 24);
    assert.deepStrictEqual(store.getState(), { x: 0, y: 0, width: 48, height: 24 });
  });

  it('TEST-UI-BBOX-04: defaults to full asset when no stored bounding box exists', () => {
    const storage = new MemoryViewportStorage();
    const store = new BoundingBoxStore('asset-fresh', 20, 15, storage);
    assert.deepStrictEqual(store.getState(), { x: 0, y: 0, width: 20, height: 15 });
  });

  it('TEST-UI-BBOX-05: automatically triggers debounced save and coalesces rapid updates', async () => {
    const storage = new MemoryViewportStorage();
    const store = new BoundingBoxStore('asset-debounce', 32, 32, storage);

    // Initial state not yet written to storage since it was default full asset
    assert.strictEqual(storage.loadBoundingBox('asset-debounce', 32, 32), null);

    // Start with a 16x16 bounding box so it has room to pan
    store.setBoundingBox({ x: 0, y: 0, width: 16, height: 16 });
    store.panBy(2, 2);
    store.panBy(3, 1);

    // Immediately after: storage should not yet be updated
    assert.strictEqual(storage.loadBoundingBox('asset-debounce', 32, 32), null);

    // Wait past debounce timer (180ms)
    await new Promise((resolve) => setTimeout(resolve, 180));

    // Now storage must contain strictly the coalesced final state
    const saved = storage.loadBoundingBox('asset-debounce', 32, 32);
    assert.deepStrictEqual(saved, { x: 5, y: 3, width: 16, height: 16 });
  });

  it('TEST-UI-BBOX-05 (Flush): setAsset immediately flushes pending saves for current asset', () => {
    const storage = new MemoryViewportStorage();
    const store = new BoundingBoxStore('asset-flush', 32, 32, storage);

    // Mutate state
    store.setBoundingBox({ x: 8, y: 8, width: 12, height: 12 });
    assert.strictEqual(storage.loadBoundingBox('asset-flush', 32, 32), null);

    // Switch asset before debounce timer expires
    store.setAsset('asset-next', 24, 24);

    // Old asset's pending save was synchronously flushed!
    const flushed = storage.loadBoundingBox('asset-flush', 32, 32);
    assert.deepStrictEqual(flushed, { x: 8, y: 8, width: 12, height: 12 });
  });

  it('TEST-UI-BBOX-06: changing asset dimensions automatically re-clamps and preserves validity', async () => {
    const storage = new MemoryViewportStorage();
    const store = new BoundingBoxStore('test-resize', 32, 32, storage);
    store.setBoundingBox({ x: 20, y: 20, width: 10, height: 10 });

    // Shrink asset to smaller than bounding box dimensions (8x8)
    store.syncAssetDimensions(8, 8);
    assert.deepStrictEqual(store.getState(), { x: 0, y: 0, width: 8, height: 8 });

    // Verify debounce save is scheduled for healed state
    await new Promise((resolve) => setTimeout(resolve, 180));
    assert.deepStrictEqual(storage.loadBoundingBox('test-resize', 8, 8), { x: 0, y: 0, width: 8, height: 8 });
  });

  it('fitToAsset resets bounding box to full asset dimensions and notifies', () => {
    const storage = new MemoryViewportStorage();
    const store = new BoundingBoxStore('test-fit', 40, 30, storage);
    store.setBoundingBox({ x: 5, y: 5, width: 10, height: 10 });

    store.fitToAsset();
    assert.deepStrictEqual(store.getState(), { x: 0, y: 0, width: 40, height: 30 });
  });

  it('notifies subscribers with exact state payloads and respects unsubscription', () => {
    const storage = new MemoryViewportStorage();
    const store = new BoundingBoxStore('test-sub', 32, 32, storage);

    const receivedStates: BoundingBoxState[] = [];
    const unsub = store.subscribe((state) => {
      receivedStates.push(state);
    });

    store.panBy(2, 2);
    store.zoom(0.8);
    store.centerAt(10, 10);

    assert.strictEqual(receivedStates.length, 3);
    assert.deepStrictEqual(receivedStates[0], { x: 0, y: 0, width: 32, height: 32 }); // panned from (0,0,32,32) clamped at 0
    assert.deepStrictEqual(receivedStates[1], { x: 3, y: 3, width: 26, height: 26 });
    assert.deepStrictEqual(receivedStates[2], { x: 0, y: 0, width: 26, height: 26 });

    // Unsubscribe and verify no further deliveries
    unsub();
    // Idempotent call to unsub does not throw
    assert.doesNotThrow(() => unsub());

    store.fitToAsset();
    assert.strictEqual(receivedStates.length, 3);
  });
});
