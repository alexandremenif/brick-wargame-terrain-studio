import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  clampBoundingBox,
  panBoundingBox,
  centerBoundingBoxAt,
  zoomBoundingBox,
  recoverBoundingBox,
} from '../src/bounding_box_math.js';

describe('Bounding Box Mathematics (TEST-DOMAIN-BBOX)', () => {
  describe('clampBoundingBox (TEST-DOMAIN-BBOX-01)', () => {
    it('clamps origin when box exceeds boundaries', () => {
      const clamped = clampBoundingBox({ x: 30, y: 30, width: 10, height: 10 }, 32, 32);
      assert.deepStrictEqual(clamped, { x: 22, y: 22, width: 10, height: 10 });
    });

    it('clamps dimensions that exceed asset dimensions', () => {
      const clamped = clampBoundingBox({ x: 0, y: 0, width: 48, height: 64 }, 32, 32);
      assert.deepStrictEqual(clamped, { x: 0, y: 0, width: 32, height: 32 });
    });

    it('floors floating-point values and clamps to positive integer grid', () => {
      const clamped = clampBoundingBox({ x: -5.7, y: 3.2, width: 0.5, height: 10.9 }, 32, 32);
      assert.deepStrictEqual(clamped, { x: 0, y: 3, width: 1, height: 10 });
    });

    it('clamps zero and negative dimensions to minimum 1x1 stud size', () => {
      const clamped = clampBoundingBox({ x: 5, y: 5, width: 0, height: -10 }, 32, 32);
      assert.deepStrictEqual(clamped, { x: 5, y: 5, width: 1, height: 1 });
    });
  });

  describe('panBoundingBox (TEST-DOMAIN-BBOX-02)', () => {
    it('pans bounding box by delta offsets while preserving dimensions', () => {
      const panned = panBoundingBox({ x: 10, y: 10, width: 8, height: 8 }, 5, -4, 32, 32);
      assert.deepStrictEqual(panned, { x: 15, y: 6, width: 8, height: 8 });
    });

    it('clamps at asset boundary edge when panning would overflow', () => {
      const panned = panBoundingBox({ x: 20, y: 20, width: 10, height: 10 }, 10, 10, 32, 32);
      assert.deepStrictEqual(panned, { x: 22, y: 22, width: 10, height: 10 });
    });

    it('clamps at asset origin (0, 0) when panning negative offsets', () => {
      const panned = panBoundingBox({ x: 5, y: 5, width: 10, height: 10 }, -20, -10, 32, 32);
      assert.deepStrictEqual(panned, { x: 0, y: 0, width: 10, height: 10 });
    });

    it('enforces integer grid alignment when given floating-point deltas', () => {
      const panned = panBoundingBox({ x: 10, y: 10, width: 8, height: 8 }, 2.7, -1.2, 32, 32);
      assert.deepStrictEqual(panned, { x: 13, y: 9, width: 8, height: 8 });
      assert.ok(Number.isInteger(panned.x) && Number.isInteger(panned.y));
    });
  });

  describe('centerBoundingBoxAt (TEST-DOMAIN-BBOX-03)', () => {
    it('centers bounding box at target coordinate', () => {
      const centered = centerBoundingBoxAt(16, 16, 8, 8, 32, 32);
      assert.deepStrictEqual(centered, { x: 12, y: 12, width: 8, height: 8 });
    });

    it('clamps at boundary edge when target coordinate is near edge', () => {
      const centered = centerBoundingBoxAt(31, 31, 8, 8, 32, 32);
      assert.deepStrictEqual(centered, { x: 24, y: 24, width: 8, height: 8 });
    });

    it('clamps at origin when target coordinate is near (0, 0)', () => {
      const centered = centerBoundingBoxAt(0, 0, 8, 8, 32, 32);
      assert.deepStrictEqual(centered, { x: 0, y: 0, width: 8, height: 8 });
    });

    it('handles floating-point target coordinates and dimensions maintaining integer alignment', () => {
      const centered = centerBoundingBoxAt(16.7, 16.2, 8.5, 8.5, 32, 32);
      assert.deepStrictEqual(centered, { x: 12, y: 12, width: 8, height: 8 });
      assert.ok(
        Number.isInteger(centered.x) &&
        Number.isInteger(centered.y) &&
        Number.isInteger(centered.width) &&
        Number.isInteger(centered.height)
      );
    });
  });

  describe('zoomBoundingBox (TEST-DOMAIN-BBOX-04)', () => {
    it('zooms in (scale factor 0.8) reducing dimensions centered on view center', () => {
      const zoomed = zoomBoundingBox({ x: 4, y: 4, width: 16, height: 16 }, 0.8, 32, 32);
      assert.deepStrictEqual(zoomed, { x: 6, y: 6, width: 13, height: 13 });
    });

    it('zooms out (scale factor 1.25) enlarging dimensions centered on view center', () => {
      const zoomed = zoomBoundingBox({ x: 12, y: 12, width: 8, height: 8 }, 1.25, 32, 32);
      assert.deepStrictEqual(zoomed, { x: 11, y: 11, width: 10, height: 10 });
    });

    it('respects minimum 1x1 stud constraint when zooming in', () => {
      const zoomed = zoomBoundingBox({ x: 10, y: 10, width: 1, height: 1 }, 0.5, 32, 32);
      assert.deepStrictEqual(zoomed, { x: 10, y: 10, width: 1, height: 1 });
    });

    it('respects maximum asset bounds constraint when zooming out', () => {
      const zoomed = zoomBoundingBox({ x: 0, y: 0, width: 30, height: 30 }, 2.0, 32, 32);
      assert.deepStrictEqual(zoomed, { x: 0, y: 0, width: 32, height: 32 });
    });

    it('preserves exact bounding box when scale factor is 1.0 (identity zoom)', () => {
      const zoomed = zoomBoundingBox({ x: 8, y: 8, width: 12, height: 10 }, 1.0, 32, 32);
      assert.deepStrictEqual(zoomed, { x: 8, y: 8, width: 12, height: 10 });
    });

    it('clamps to 1x1 on extreme zoom in (scale factor 0.001)', () => {
      const zoomed = zoomBoundingBox({ x: 10, y: 10, width: 20, height: 20 }, 0.001, 32, 32);
      assert.deepStrictEqual(zoomed, { x: 20, y: 20, width: 1, height: 1 });
    });

    it('clamps to full asset dimensions on extreme zoom out (scale factor 1000.0)', () => {
      const zoomed = zoomBoundingBox({ x: 10, y: 10, width: 4, height: 4 }, 1000.0, 32, 32);
      assert.deepStrictEqual(zoomed, { x: 0, y: 0, width: 32, height: 32 });
    });
  });

  describe('recoverBoundingBox (TEST-DOMAIN-BBOX-05)', () => {
    it('recovers out-of-bounds bounding box data', () => {
      const recovered = recoverBoundingBox({ x: 40, y: 40, width: 16, height: 16 }, 32, 32);
      assert.deepStrictEqual(recovered, { x: 16, y: 16, width: 16, height: 16 });
    });

    it('recovers when dimensions exceed asset size', () => {
      const recovered = recoverBoundingBox({ x: 20, y: 20, width: 40, height: 40 }, 16, 16);
      assert.deepStrictEqual(recovered, { x: 0, y: 0, width: 16, height: 16 });
    });

    it('recovers float inputs cleanly by rounding and clamping', () => {
      const recovered = recoverBoundingBox({ x: 10.7, y: 4.2, width: 8.9, height: 5.1 }, 32, 32);
      assert.deepStrictEqual(recovered, { x: 11, y: 4, width: 9, height: 5 });
    });

    it('returns null on corrupt, non-object, missing props, or non-finite inputs', () => {
      assert.strictEqual(recoverBoundingBox('invalid-json' as any, 32, 32), null);
      assert.strictEqual(recoverBoundingBox(null as any, 32, 32), null);
      assert.strictEqual(recoverBoundingBox(undefined as any, 32, 32), null);
      assert.strictEqual(recoverBoundingBox([] as any, 32, 32), null);
      assert.strictEqual(recoverBoundingBox([1, 2, 3] as any, 32, 32), null);
      assert.strictEqual(recoverBoundingBox(123 as any, 32, 32), null);
      assert.strictEqual(recoverBoundingBox(true as any, 32, 32), null);
      assert.strictEqual(recoverBoundingBox({ x: 0, y: 0 } as any, 32, 32), null);
      assert.strictEqual(recoverBoundingBox({ x: 'bad', y: 0, width: 10, height: 10 } as any, 32, 32), null);
      assert.strictEqual(recoverBoundingBox({ x: NaN, y: 0, width: 10, height: 10 } as any, 32, 32), null);
      assert.strictEqual(recoverBoundingBox({ x: Infinity, y: 0, width: 10, height: 10 } as any, 32, 32), null);
      assert.strictEqual(recoverBoundingBox({ x: 0, y: -Infinity, width: 10, height: 10 } as any, 32, 32), null);
    });
  });
});
