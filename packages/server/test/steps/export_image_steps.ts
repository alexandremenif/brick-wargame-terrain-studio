import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import type { StudioWorld } from '../support/world.js';
import { createCanvas, loadImage } from '@napi-rs/canvas';
import { renderState } from './rendering_steps.js';

function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => x.toString(16).padStart(2, '0')).join('').toUpperCase();
}

// ============================================================================
// Asset Setup Steps for export_image.feature & rendering.feature
// ============================================================================

Given('an asset named {string} with dimensions {int} by {int}', async function (this: StudioWorld, name: string, width: number, height: number) {
  await this.driver.createAsset(name, width, height);
});

Given('official brick color {int} is {string} with hex {string}', async function (this: StudioWorld, colorId: number, colorName: string, hex: string) {
  const colors = await this.driver.listColors();
  const found = colors.find(c => c.id === colorId);
  assert.ok(found, `Expected color ID ${colorId} to exist in catalog`);
  assert.strictEqual(found.hex.toUpperCase(), hex.toUpperCase());
});

Given('the asset has painted cells:', async function (this: StudioWorld, dataTable) {
  const rows = dataTable.hashes();
  for (const row of rows) {
    const x = parseInt(row.x, 10);
    const y = parseInt(row.y, 10);
    const colorId = parseInt(row.colorId, 10);
    if (renderState.cells[y] && x >= 0 && x < renderState.cells[y].length) {
      renderState.cells[y][x] = colorId;
    }
    if (await this.driver.assetExists()) {
      await this.driver.paintArea(x, y, 1, 1, colorId);
    }
  }
});

// ============================================================================
// Export Actions
// ============================================================================

let activeExportBbox: { x: number; y: number; width: number; height: number } | null = null;

When('I export the asset image without specifying a profile', async function (this: StudioWorld) {
  activeExportBbox = null;
  try {
    this.lastExportResult = await this.driver.exportImage();
    this.lastError = null;
  } catch (err: any) {
    this.lastError = err;
    this.lastExportResult = null;
  }
});

When('I export the asset image with profile {string}', async function (this: StudioWorld, profile: string) {
  activeExportBbox = null;
  try {
    this.lastExportResult = await this.driver.exportImage({ profile });
    this.lastError = null;
  } catch (err: any) {
    this.lastError = err;
    this.lastExportResult = null;
  }
});

When(
  'I export the asset image with bounding box \\({int}, {int}, {int}, {int}) and profile {string}',
  async function (this: StudioWorld, x: number, y: number, w: number, h: number, profile: string) {
    activeExportBbox = { x, y, width: w, height: h };
    try {
      this.lastExportResult = await this.driver.exportImage({
        bbox: { x, y, width: w, height: h },
        profile,
      });
      this.lastError = null;
    } catch (err: any) {
      this.lastError = err;
      this.lastExportResult = null;
    }
  }
);

When(
  'I export the asset image with bounding box \\({int}, {int}, {int}, {int})',
  async function (this: StudioWorld, x: number, y: number, w: number, h: number) {
    activeExportBbox = { x, y, width: w, height: h };
    try {
      this.lastExportResult = await this.driver.exportImage({
        bbox: { x, y, width: w, height: h },
      });
      this.lastError = null;
    } catch (err: any) {
      this.lastError = err;
      this.lastExportResult = null;
    }
  }
);

When('I export an image for non-existent asset {string}', async function (this: StudioWorld, assetId: string) {
  activeExportBbox = null;
  try {
    this.lastExportResult = await this.driver.exportImage({ assetId });
    this.lastError = null;
  } catch (err: any) {
    this.lastError = err;
    this.lastExportResult = null;
  }
});

// ============================================================================
// Export Assertions
// ============================================================================

Then('the export response should contain valid base64 PNG image data', async function (this: StudioWorld) {
  assert.ok(this.lastExportResult, 'Expected lastExportResult to be present');
  assert.ok(this.lastExportResult.data, 'Expected base64 data to be present');
  assert.ok(typeof this.lastExportResult.data === 'string');

  const buf = Buffer.from(this.lastExportResult.data, 'base64');
  assert.ok(buf.length > 8, 'PNG buffer should be at least 8 bytes');
  // Check PNG magic bytes: 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A
  assert.strictEqual(buf[0], 0x89);
  assert.strictEqual(buf[1], 0x50);
  assert.strictEqual(buf[2], 0x4E);
  assert.strictEqual(buf[3], 0x47);

  // Decode into headless canvas to inspect pixel dimensions & color data
  const img = await loadImage(buf);
  this.lastExportImageWidth = img.width;
  this.lastExportImageHeight = img.height;

  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const imgData = ctx.getImageData(0, 0, img.width, img.height);
  this.lastExportCanvasData = imgData.data;
});

Then('the exported image pixel dimensions should be {int} by {int}', async function (this: StudioWorld, expectedW: number, expectedH: number) {
  if (this.lastExportImageWidth === 0 && this.lastExportResult?.data) {
    const buf = Buffer.from(this.lastExportResult.data, 'base64');
    const img = await loadImage(buf);
    this.lastExportImageWidth = img.width;
    this.lastExportImageHeight = img.height;
  }
  assert.strictEqual(this.lastExportImageWidth, expectedW, `Expected width ${expectedW}, got ${this.lastExportImageWidth}`);
  assert.strictEqual(this.lastExportImageHeight, expectedH, `Expected height ${expectedH}, got ${this.lastExportImageHeight}`);
});

Then(
  'the exported image stud at \\({int}, {int}\\) should be colored {string}',
  async function (this: StudioWorld, studX: number, studY: number, expectedHex: string) {
    assert.ok(this.lastExportCanvasData);
    const w = this.lastExportImageWidth;
    const h = this.lastExportImageHeight;
    assert.ok(w > 0 && h > 0);

    const assetDims = await this.driver.getAssetDimensions();
    const regionW = activeExportBbox ? activeExportBbox.width : assetDims.width;
    const pixelsPerStud = Math.round(w / regionW);

    const samplePx = studX * pixelsPerStud + Math.floor(pixelsPerStud / 4);
    const samplePy = studY * pixelsPerStud + Math.floor(pixelsPerStud / 4);

    const idx = (samplePy * w + samplePx) * 4;
    const r = this.lastExportCanvasData[idx];
    const g = this.lastExportCanvasData[idx + 1];
    const b = this.lastExportCanvasData[idx + 2];
    const actualHex = rgbToHex(r, g, b);

    assert.strictEqual(actualHex, expectedHex.toUpperCase(), `Stud (${studX}, ${studY}) expected ${expectedHex}, got ${actualHex}`);
  }
);

Then(
  'the unpainted stud at \\({int}, {int}\\) should be colored {string}',
  async function (this: StudioWorld, studX: number, studY: number, expectedHex: string) {
    assert.ok(this.lastExportCanvasData);
    const w = this.lastExportImageWidth;
    const assetDims = await this.driver.getAssetDimensions();
    const regionW = activeExportBbox ? activeExportBbox.width : assetDims.width;
    const pixelsPerStud = Math.round(w / regionW);

    const samplePx = studX * pixelsPerStud + Math.floor(pixelsPerStud / 4);
    const samplePy = studY * pixelsPerStud + Math.floor(pixelsPerStud / 4);

    const idx = (samplePy * w + samplePx) * 4;
    const r = this.lastExportCanvasData[idx];
    const g = this.lastExportCanvasData[idx + 1];
    const b = this.lastExportCanvasData[idx + 2];
    const actualHex = rgbToHex(r, g, b);

    assert.strictEqual(actualHex, expectedHex.toUpperCase(), `Unpainted stud (${studX}, ${studY}) expected ${expectedHex}, got ${actualHex}`);
  }
);

Then(
  'the exported image stud at \\({int}, {int}\\) should have a 2 by 2 checkerboard pattern of {string} and {string}',
  async function (this: StudioWorld, studX: number, studY: number, hexA: string, hexB: string) {
    assert.ok(this.lastExportCanvasData);
    const w = this.lastExportImageWidth;
    const assetDims = await this.driver.getAssetDimensions();
    const regionW = activeExportBbox ? activeExportBbox.width : assetDims.width;
    const pixelsPerStud = Math.round(w / regionW);
    const half = pixelsPerStud / 2;

    const basePx = studX * pixelsPerStud;
    const basePy = studY * pixelsPerStud;

    // Sub-quadrant (0, 0) -> hexA
    const q00Idx = (Math.floor(basePy + half / 2) * w + Math.floor(basePx + half / 2)) * 4;
    const hex00 = rgbToHex(this.lastExportCanvasData[q00Idx], this.lastExportCanvasData[q00Idx + 1], this.lastExportCanvasData[q00Idx + 2]);

    // Sub-quadrant (1, 0) -> hexB
    const q10Idx = (Math.floor(basePy + half / 2) * w + Math.floor(basePx + half + half / 2)) * 4;
    const hex10 = rgbToHex(this.lastExportCanvasData[q10Idx], this.lastExportCanvasData[q10Idx + 1], this.lastExportCanvasData[q10Idx + 2]);

    assert.strictEqual(hex00, hexA.toUpperCase(), `Expected quadrant (0,0) of stud (${studX}, ${studY}) to match ${hexA}, got ${hex00}`);
    assert.strictEqual(hex10, hexB.toUpperCase(), `Expected quadrant (1,0) of stud (${studX}, ${studY}) to match ${hexB}, got ${hex10}`);
  }
);

Then(
  'the exported image stud at local position \\({int}, {int}\\) should be colored {string}',
  async function (this: StudioWorld, localX: number, localY: number, expectedHex: string) {
    assert.ok(this.lastExportCanvasData);
    const w = this.lastExportImageWidth;
    const assetDims = await this.driver.getAssetDimensions();
    const regionW = activeExportBbox ? activeExportBbox.width : assetDims.width;
    const pixelsPerStud = Math.round(w / regionW);

    const samplePx = localX * pixelsPerStud + Math.floor(pixelsPerStud / 4);
    const samplePy = localY * pixelsPerStud + Math.floor(pixelsPerStud / 4);

    const idx = (samplePy * w + samplePx) * 4;
    const r = this.lastExportCanvasData[idx];
    const g = this.lastExportCanvasData[idx + 1];
    const b = this.lastExportCanvasData[idx + 2];
    const actualHex = rgbToHex(r, g, b);

    assert.strictEqual(actualHex, expectedHex.toUpperCase(), `Local stud (${localX}, ${localY}) expected ${expectedHex}, got ${actualHex}`);
  }
);

Then('the export operation should fail with invalid params error', function (this: StudioWorld) {
  assert.ok(this.lastError, 'Expected export operation to fail with invalid params error, but it succeeded');
  const code = (this.lastError as any).code;
  if (code !== undefined) {
    assert.strictEqual(code, -32602, `Expected error code -32602, got ${code}`);
  } else {
    assert.match(this.lastError.message, /invalid|bounds|profile|not found/i);
  }
});
