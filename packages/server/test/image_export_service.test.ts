import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { ImageExportService, type ExportTargetAsset } from '../src/domain/ImageExportService.js';
import { NodeCanvasImageExporter, type ImageExporter } from '../src/domain/ImageExporter.js';
import type { BrickColor } from '@lego-wargame-terrain-studio/domain';

describe('ImageExportService (TEST-SRV-EXP)', () => {
  const dummyColors = new Map<number, BrickColor>([
    [1, { id: 1, name: 'White', hex: '#FFFFFF' }],
    [15, { id: 15, name: 'Bright Green', hex: '#4B9F4A' }],
    [37, { id: 37, name: 'Bright Green', hex: '#4B9F4A' }],
  ]);

  const sampleAsset: ExportTargetAsset = {
    id: 'asset-export-1',
    width: 40,
    height: 30,
    cells: [
      { x: 5, y: 5, colorId: 15 },
      { x: 6, y: 5, colorId: 15 },
    ],
  };

  // Helper to read PNG dimensions from IHDR chunk
  function getPngDimensions(base64Data: string): { width: number; height: number } {
    const buffer = Buffer.from(base64Data, 'base64');
    // PNG signature: 89 50 4E 47 0D 0A 1A 0A
    assert.strictEqual(buffer.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', 'Must be valid PNG header');
    const width = buffer.readUInt32BE(16);
    const height = buffer.readUInt32BE(20);
    return { width, height };
  }

  // TEST-SRV-EXP-01: Exports full asset with 'llm' profile using adaptive scaling and checkerboard transparency
  test('TEST-SRV-EXP-01: exports full asset with llm profile using adaptive scaling and checkerboard transparency', async () => {
    let capturedOptions: any = null;
    const spyExporter: ImageExporter = {
      async exportPngBase64(options) {
        capturedOptions = options;
        return 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      },
    };

    const service = new ImageExportService(spyExporter);
    const res = await service.exportImage(sampleAsset, dummyColors, { profile: 'llm' });

    assert.ok(res.data);
    assert.strictEqual(capturedOptions.profile, 'llm');
    assert.strictEqual(capturedOptions.assetWidth, 40);
    assert.strictEqual(capturedOptions.assetHeight, 30);
    assert.strictEqual(capturedOptions.bbox, undefined);

    // End-to-end integration check with NodeCanvasImageExporter
    const realService = new ImageExportService(new NodeCanvasImageExporter());
    // For 40x30 asset: maxStuds = 40. adaptivePixelsPerStud = min(16, floor(800/40)) = 16.
    // Canvas dimensions: 40 * 16 = 640px, 30 * 16 = 480px.
    const realRes = await realService.exportImage(sampleAsset, dummyColors, { profile: 'llm' });
    const { width, height } = getPngDimensions(realRes.data);
    assert.strictEqual(width, 640);
    assert.strictEqual(height, 480);
  });

  // TEST-SRV-EXP-02: Exports full asset with 'print' profile at 64px/stud with solid white background
  test('TEST-SRV-EXP-02: exports full asset with print profile at 64px/stud with solid white background', async () => {
    let capturedOptions: any = null;
    const spyExporter: ImageExporter = {
      async exportPngBase64(options) {
        capturedOptions = options;
        return 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      },
    };

    const service = new ImageExportService(spyExporter);
    const smallAsset: ExportTargetAsset = {
      id: 'small-print-asset',
      width: 10,
      height: 8,
      cells: [],
    };

    const res = await service.exportImage(smallAsset, dummyColors, { profile: 'print' });
    assert.ok(res.data);
    assert.strictEqual(capturedOptions.profile, 'print');

    // End-to-end integration check with NodeCanvasImageExporter
    const realService = new ImageExportService(new NodeCanvasImageExporter());
    // For 10x8 asset at 64px/stud: 10 * 64 = 640px, 8 * 64 = 512px
    const realRes = await realService.exportImage(smallAsset, dummyColors, { profile: 'print' });
    const { width, height } = getPngDimensions(realRes.data);
    assert.strictEqual(width, 640);
    assert.strictEqual(height, 512);
  });

  // TEST-SRV-EXP-03: Exports framed bounding box sub-region within asset boundaries
  test('TEST-SRV-EXP-03: exports framed bounding box sub-region within asset boundaries', async () => {
    let capturedOptions: any = null;
    const spyExporter: ImageExporter = {
      async exportPngBase64(options) {
        capturedOptions = options;
        return 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      },
    };

    const service = new ImageExportService(spyExporter);
    const bbox = { x: 10, y: 5, width: 20, height: 15 };

    await service.exportImage(sampleAsset, dummyColors, {
      profile: 'llm',
      bbox,
    });

    assert.deepStrictEqual(capturedOptions.bbox, bbox);

    // End-to-end integration check with NodeCanvasImageExporter
    const realService = new ImageExportService(new NodeCanvasImageExporter());
    // For bbox 20x15: maxStuds = 20. adaptivePixelsPerStud = min(16, floor(800/20)=40) = 16.
    // Dimensions: 20 * 16 = 320px, 15 * 16 = 240px.
    const realRes = await realService.exportImage(sampleAsset, dummyColors, {
      profile: 'llm',
      bbox,
    });
    const { width, height } = getPngDimensions(realRes.data);
    assert.strictEqual(width, 320);
    assert.strictEqual(height, 240);
  });

  // TEST-SRV-EXP-04: Throws -32602 invalid params when bounding box exceeds asset bounds
  test('TEST-SRV-EXP-04: throws -32602 invalid params when bounding box exceeds asset bounds or invalid profile', async () => {
    const dummyExporter: ImageExporter = {
      async exportPngBase64() {
        return '';
      },
    };
    const service = new ImageExportService(dummyExporter);

    // 1. Negative origin x
    await assert.rejects(
      async () =>
        service.exportImage(sampleAsset, dummyColors, {
          bbox: { x: -1, y: 0, width: 10, height: 10 },
        }),
      (err: any) => err.code === -32602 && err.message.includes('Bounding box exceeds asset boundaries')
    );

    // 2. Negative origin y
    await assert.rejects(
      async () =>
        service.exportImage(sampleAsset, dummyColors, {
          bbox: { x: 0, y: -2, width: 10, height: 10 },
        }),
      (err: any) => err.code === -32602 && err.message.includes('Bounding box exceeds asset boundaries')
    );

    // 3. Zero or negative width
    await assert.rejects(
      async () =>
        service.exportImage(sampleAsset, dummyColors, {
          bbox: { x: 0, y: 0, width: 0, height: 10 },
        }),
      (err: any) => err.code === -32602 && err.message.includes('Bounding box exceeds asset boundaries')
    );

    // 4. Zero or negative height
    await assert.rejects(
      async () =>
        service.exportImage(sampleAsset, dummyColors, {
          bbox: { x: 0, y: 0, width: 10, height: -5 },
        }),
      (err: any) => err.code === -32602 && err.message.includes('Bounding box exceeds asset boundaries')
    );

    // 5. Overflow width (x + width > asset.width): 35 + 10 = 45 > 40
    await assert.rejects(
      async () =>
        service.exportImage(sampleAsset, dummyColors, {
          bbox: { x: 35, y: 0, width: 10, height: 10 },
        }),
      (err: any) => err.code === -32602 && err.message.includes('Bounding box exceeds asset boundaries')
    );

    // 6. Overflow height (y + height > asset.height): 0 + (25 + 10) = 35 > 30
    await assert.rejects(
      async () =>
        service.exportImage(sampleAsset, dummyColors, {
          bbox: { x: 0, y: 25, width: 10, height: 10 },
        }),
      (err: any) => err.code === -32602 && err.message.includes('Bounding box exceeds asset boundaries')
    );

    // 7. Unrecognized export profile
    await assert.rejects(
      async () =>
        service.exportImage(sampleAsset, dummyColors, {
          profile: 'unsupported-profile' as any,
        }),
      (err: any) => err.code === -32602 && err.message.includes("Unrecognized profile 'unsupported-profile'")
    );
  });
});
