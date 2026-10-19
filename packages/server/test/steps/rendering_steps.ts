import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import type { BrickColor, BoundingBox } from '@lego-wargame-terrain-studio/domain';
import { renderAssetGrid, Canvas2DContextLike } from '@lego-wargame-terrain-studio/domain';
import { DefaultColorService } from '../../src/domain/ColorService.js';

interface RenderMockCall {
  type: 'fillRect' | 'stroke' | 'line';
  fillStyle?: string;
  strokeStyle?: string;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
}

class Mock2DCanvasContext implements Canvas2DContextLike {
  public fillStyle: string = '#000000';
  public strokeStyle: string = '#000000';
  public lineWidth: number = 1;
  public calls: RenderMockCall[] = [];
  public strokeCallCount = 0;

  fillRect(x: number, y: number, w: number, h: number): void {
    this.calls.push({
      type: 'fillRect',
      fillStyle: this.fillStyle,
      x,
      y,
      w,
      h,
    });
  }

  beginPath(): void {}

  moveTo(_x: number, _y: number): void {}

  lineTo(_x: number, _y: number): void {}

  stroke(): void {
    this.strokeCallCount++;
    this.calls.push({
      type: 'stroke',
      strokeStyle: this.strokeStyle,
    });
  }
}

interface DomainRenderState {
  assetName: string;
  assetWidth: number;
  assetHeight: number;
  cells: number[][];
  colorsById: Map<number, BrickColor>;
  pixelsPerStud: number;
  lastError: Error | null;
  mockCtx: Mock2DCanvasContext | null;
  canvasW: number;
  canvasH: number;
}

export const renderState: DomainRenderState = {
  assetName: '',
  assetWidth: 0,
  assetHeight: 0,
  cells: [],
  colorsById: new Map(),
  pixelsPerStud: 8,
  lastError: null,
  mockCtx: null,
  canvasW: 0,
  canvasH: 0,
};

// Initialize colors once
const colorService = new DefaultColorService();
await colorService.loadColors();
for (const color of colorService.listColors()) {
  renderState.colorsById.set(color.id, color);
}

Given('an asset {string} with dimensions {int} by {int}', function (name: string, width: number, height: number) {
  renderState.assetName = name;
  renderState.assetWidth = width;
  renderState.assetHeight = height;
  renderState.cells = Array.from({ length: height }, () => new Array(width).fill(0));
  renderState.lastError = null;
  renderState.mockCtx = null;
});

When(
  'I render the asset with {int} pixels per stud and background mode {string}',
  function (pixelsPerStud: number, bgMode: string) {
    renderState.pixelsPerStud = pixelsPerStud;
    renderState.canvasW = renderState.assetWidth * pixelsPerStud;
    renderState.canvasH = renderState.assetHeight * pixelsPerStud;
    renderState.mockCtx = new Mock2DCanvasContext();

    try {
      renderAssetGrid(renderState.mockCtx, {
        assetWidth: renderState.assetWidth,
        assetHeight: renderState.assetHeight,
        cells: renderState.cells,
        colorsById: renderState.colorsById,
        pixelsPerStud,
        backgroundMode: bgMode as any,
      });
      renderState.lastError = null;
    } catch (err: any) {
      renderState.lastError = err;
    }
  }
);

When(
  'I render the bounding box \\({int}, {int}, {int}, {int}) with {int} pixels per stud and background mode {string}',
  function (x: number, y: number, w: number, h: number, pixelsPerStud: number, bgMode: string) {
    renderState.pixelsPerStud = pixelsPerStud;
    renderState.canvasW = w * pixelsPerStud;
    renderState.canvasH = h * pixelsPerStud;
    renderState.mockCtx = new Mock2DCanvasContext();

    try {
      renderAssetGrid(renderState.mockCtx, {
        assetWidth: renderState.assetWidth,
        assetHeight: renderState.assetHeight,
        cells: renderState.cells,
        colorsById: renderState.colorsById,
        pixelsPerStud,
        backgroundMode: bgMode as any,
        bbox: { x, y, width: w, height: h },
      });
      renderState.lastError = null;
    } catch (err: any) {
      renderState.lastError = err;
    }
  }
);

When(
  'I render the asset with {int} pixels per stud with grid overlay enabled',
  function (pixelsPerStud: number) {
    renderState.pixelsPerStud = pixelsPerStud;
    renderState.canvasW = renderState.assetWidth * pixelsPerStud;
    renderState.canvasH = renderState.assetHeight * pixelsPerStud;
    renderState.mockCtx = new Mock2DCanvasContext();

    renderAssetGrid(renderState.mockCtx, {
      assetWidth: renderState.assetWidth,
      assetHeight: renderState.assetHeight,
      cells: renderState.cells,
      colorsById: renderState.colorsById,
      pixelsPerStud,
      grid: true,
    });
  }
);

When(
  'I render the asset with {int} pixels per stud with grid overlay disabled',
  function (pixelsPerStud: number) {
    renderState.pixelsPerStud = pixelsPerStud;
    renderState.canvasW = renderState.assetWidth * pixelsPerStud;
    renderState.canvasH = renderState.assetHeight * pixelsPerStud;
    renderState.mockCtx = new Mock2DCanvasContext();

    renderAssetGrid(renderState.mockCtx, {
      assetWidth: renderState.assetWidth,
      assetHeight: renderState.assetHeight,
      cells: renderState.cells,
      colorsById: renderState.colorsById,
      pixelsPerStud,
      grid: false,
    });
  }
);

When('I attempt to render the asset with {int} pixels per stud', function (pixelsPerStud: number) {
  renderState.pixelsPerStud = pixelsPerStud;
  renderState.mockCtx = new Mock2DCanvasContext();

  try {
    renderAssetGrid(renderState.mockCtx, {
      assetWidth: renderState.assetWidth,
      assetHeight: renderState.assetHeight,
      cells: renderState.cells,
      colorsById: renderState.colorsById,
      pixelsPerStud,
    });
    renderState.lastError = null;
  } catch (err: any) {
    renderState.lastError = err;
  }
});

Then('the canvas pixel dimensions should be {int} by {int}', function (expectedW: number, expectedH: number) {
  assert.strictEqual(renderState.canvasW, expectedW);
  assert.strictEqual(renderState.canvasH, expectedH);
});

Then(
  'the stud at stud coordinate \\({int}, {int}\\) should be solid color {string}',
  function (sx: number, sy: number, expectedHex: string) {
    assert.ok(renderState.mockCtx);
    const s = renderState.pixelsPerStud;
    const px = sx * s;
    const py = sy * s;

    const call = renderState.mockCtx.calls.find(
      c => c.type === 'fillRect' && c.x === px && c.y === py && c.w === s && c.h === s
    );
    assert.ok(call, `Expected solid fillRect for stud (${sx}, ${sy}) at (${px}, ${py}) with size ${s}x${s}`);
    assert.strictEqual(call.fillStyle?.toUpperCase(), expectedHex.toUpperCase());
  }
);

Then(
  'the stud at stud coordinate \\({int}, {int}\\) should have a 2 by 2 checkerboard pattern of {string} and {string}',
  function (sx: number, sy: number, hexA: string, hexB: string) {
    assert.ok(renderState.mockCtx);
    const s = renderState.pixelsPerStud;
    const half = s / 2;
    const px = sx * s;
    const py = sy * s;

    // Check all 4 sub-quadrants
    const q00 = renderState.mockCtx.calls.find(c => c.type === 'fillRect' && c.x === px && c.y === py && c.w === half && c.h === half);
    const q10 = renderState.mockCtx.calls.find(c => c.type === 'fillRect' && c.x === px + half && c.y === py && c.w === half && c.h === half);
    const q01 = renderState.mockCtx.calls.find(c => c.type === 'fillRect' && c.x === px && c.y === py + half && c.w === half && c.h === half);
    const q11 = renderState.mockCtx.calls.find(c => c.type === 'fillRect' && c.x === px + half && c.y === py + half && c.w === half && c.h === half);

    assert.ok(q00 && q10 && q01 && q11, `Expected 4 checkerboard sub-quadrants at stud (${sx}, ${sy})`);
    assert.strictEqual(q00.fillStyle?.toUpperCase(), hexA.toUpperCase());
    assert.strictEqual(q10.fillStyle?.toUpperCase(), hexB.toUpperCase());
    assert.strictEqual(q01.fillStyle?.toUpperCase(), hexB.toUpperCase());
    assert.strictEqual(q11.fillStyle?.toUpperCase(), hexA.toUpperCase());
  }
);

Then(
  'all studs should display the 2 by 2 checkerboard pattern of {string} and {string}',
  function (hexA: string, hexB: string) {
    assert.ok(renderState.mockCtx);
    const s = renderState.pixelsPerStud;
    const half = s / 2;

    for (let x = 0; x < renderState.assetWidth; x++) {
      for (let y = 0; y < renderState.assetHeight; y++) {
        const px = x * s;
        const py = y * s;
        const q00 = renderState.mockCtx.calls.find(c => c.type === 'fillRect' && c.x === px && c.y === py && c.w === half && c.h === half);
        assert.ok(q00, `Expected checkerboard at stud (${x}, ${y})`);
        assert.strictEqual(q00.fillStyle?.toUpperCase(), hexA.toUpperCase());
      }
    }
  }
);

Then('no stud should contain solid color', function () {
  assert.ok(renderState.mockCtx);
  const s = renderState.pixelsPerStud;
  const fullStudFill = renderState.mockCtx.calls.find(c => c.type === 'fillRect' && c.w === s && c.h === s);
  assert.strictEqual(fullStudFill, undefined, 'No stud should have a full-size solid fill');
});

Then('all studs should be solid color {string}', function (expectedHex: string) {
  assert.ok(renderState.mockCtx);
  const s = renderState.pixelsPerStud;
  for (let x = 0; x < renderState.assetWidth; x++) {
    for (let y = 0; y < renderState.assetHeight; y++) {
      const px = x * s;
      const py = y * s;
      const call = renderState.mockCtx.calls.find(c => c.type === 'fillRect' && c.x === px && c.y === py && c.w === s && c.h === s);
      assert.ok(call, `Expected full fill at (${x}, ${y})`);
      assert.strictEqual(call.fillStyle?.toUpperCase(), expectedHex.toUpperCase());
    }
  }
});

Then(
  'the stud at local position \\({int}, {int}\\) should be solid color {string}',
  function (lx: number, ly: number, expectedHex: string) {
    assert.ok(renderState.mockCtx);
    const s = renderState.pixelsPerStud;
    const px = lx * s;
    const py = ly * s;
    const call = renderState.mockCtx.calls.find(c => c.type === 'fillRect' && c.x === px && c.y === py && c.w === s && c.h === s);
    assert.ok(call, `Expected solid fill at local position (${lx}, ${ly})`);
    assert.strictEqual(call.fillStyle?.toUpperCase(), expectedHex.toUpperCase());
  }
);

Then('the canvas should suppress grid line strokes to prevent visual noise', function () {
  assert.ok(renderState.mockCtx);
  assert.strictEqual(renderState.mockCtx.strokeCallCount, 0, 'Grid lines should be suppressed');
});

Then('the canvas should contain grid line strokes of color {string}', function (expectedStrokeColor: string) {
  assert.ok(renderState.mockCtx);
  assert.ok(renderState.mockCtx.strokeCallCount > 0, 'Grid strokes should be called');
  const strokeCall = renderState.mockCtx.calls.find(c => c.type === 'stroke');
  assert.ok(strokeCall);
  assert.strictEqual(strokeCall.strokeStyle, expectedStrokeColor);
});

Then('rendering should fail with an error indicating minimum stud size is 2 pixels', function () {
  assert.ok(renderState.lastError, 'Expected error for pixelsPerStud below minimum');
  assert.match(renderState.lastError.message, /minimum stud size is 2 pixels/i);
});
