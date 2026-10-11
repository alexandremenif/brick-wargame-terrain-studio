import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import type { StudioWorld } from '../support/world.js';

Given('a new asset named {string} with dimensions {int} by {int} studs', async function (this: StudioWorld, name: string, width: number, height: number) {
  await this.driver.createAsset(name, width, height);
});

Then('the asset width should be {int} studs', async function (this: StudioWorld, expectedWidth: number) {
  const dimensions = await this.driver.getAssetDimensions();
  assert.strictEqual(dimensions.width, expectedWidth);
});

Then('the asset height should be {int} studs', async function (this: StudioWorld, expectedHeight: number) {
  const dimensions = await this.driver.getAssetDimensions();
  assert.strictEqual(dimensions.height, expectedHeight);
});

Then('the asset name should be {string}', async function (this: StudioWorld, expectedName: string) {
  const name = await this.driver.getAssetName();
  assert.strictEqual(name, expectedName);
});

Then('all cells should be unpainted', async function (this: StudioWorld) {
  const count = await this.driver.getPaintedCellCount();
  assert.strictEqual(count, 0);
});

When('I update the asset to dimensions {int} by {int} studs', async function (this: StudioWorld, width: number, height: number) {
  await this.driver.updateDimensions(width, height);
});

When('I update the asset name to {string}', async function (this: StudioWorld, name: string) {
  await this.driver.updateName(name);
});

When(
  'I paint the area \\({int}, {int}, {int}, {int}\\) with brick color ID {int}',
  async function (this: StudioWorld, x: number, y: number, w: number, h: number, colorId: number) {
    await this.driver.paintArea(x, y, w, h, colorId);
  }
);

When(
  'I attempt to paint the area \\({int}, {int}, {int}, {int}\\) with brick color ID {int}',
  async function (this: StudioWorld, x: number, y: number, w: number, h: number, colorId: number) {
    try {
      await this.driver.paintArea(x, y, w, h, colorId);
      this.lastError = null;
    } catch (err: any) {
      this.lastError = err;
    }
  }
);

Then('an invalid action error should be raised', function (this: StudioWorld) {
  assert.ok(this.lastError, 'Expected an error to be raised for invalid action, but none occurred');
  assert.match(this.lastError.message, /invalid color id/i);
});

When(
  'I paint the area \\({int}, {int}, {int}, {int}\\) with null color ID',
  async function (this: StudioWorld, x: number, y: number, w: number, h: number) {
    await this.driver.paintArea(x, y, w, h, null);
  }
);

Then('exactly {int} cells should be painted', async function (this: StudioWorld, expectedCount: number) {
  const count = await this.driver.getPaintedCellCount();
  assert.strictEqual(count, expectedCount, `Expected exactly ${expectedCount} painted cells, found ${count}`);
});

Then(
  'the cell at \\({int}, {int}\\) should have brick color ID {int}',
  async function (this: StudioWorld, x: number, y: number, expectedColorId: number) {
    const color = await this.driver.getCellColor(x, y);
    assert.strictEqual(color, expectedColorId, `Expected cell (${x}, ${y}) to have color ID ${expectedColorId}, found ${color}`);
  }
);

Then(
  'the cell at \\({int}, {int}\\) should be unpainted',
  async function (this: StudioWorld, x: number, y: number) {
    const color = await this.driver.getCellColor(x, y);
    assert.strictEqual(color, null, `Expected cell (${x}, ${y}) to be unpainted, found color ID ${color}`);
  }
);

When('I delete the asset', async function (this: StudioWorld) {
  await this.driver.deleteAsset();
});

Then('the asset should no longer exist', async function (this: StudioWorld) {
  const exists = await this.driver.assetExists();
  assert.strictEqual(exists, false);
});

// Steps for colors.feature
When('I list the official brick colors', async function (this: StudioWorld) {
  this.colorsList = await this.driver.listColors();
});

Then('exactly {int} colors should be returned', function (this: StudioWorld, expectedCount: number) {
  assert.ok(this.colorsList);
  assert.strictEqual(this.colorsList.length, expectedCount);
});

Then('each color must have an ID, an official name, and a valid hex code', function (this: StudioWorld) {
  assert.ok(this.colorsList);
  for (const c of this.colorsList) {
    assert.ok(Number.isInteger(c.id) && c.id > 0);
    assert.ok(typeof c.name === 'string' && c.name.length > 0);
    assert.match(c.hex, /^#[0-9A-Fa-f]{6}$/);
  }
});

Then('the list should contain {string} with ID {int} and hex {string}', function (this: StudioWorld, name: string, id: number, hex: string) {
  assert.ok(this.colorsList);
  const found = this.colorsList.find(c => c.name === name);
  assert.ok(found, `Expected color "${name}" to be in list`);
  assert.strictEqual(found.id, id);
  assert.strictEqual(found.hex, hex);
});

// ============================================================================
// Pure Bounding Box Mathematics & Clamping Steps
// ============================================================================

import {
  clampBoundingBox,
  panBoundingBox,
  centerBoundingBoxAt,
  zoomBoundingBox,
  recoverBoundingBox,
} from '@lego-wargame-terrain-studio/api';

interface BBoxState {
  currentBbox?: { x: number; y: number; width: number; height: number };
  assetW?: number;
  assetH?: number;
  recoveryResult?: any;
}

const bboxState: BBoxState = {};

When(
  'I clamp a bounding box \\({int}, {int}, {int}, {int}\\) against asset dimensions {int} by {int}',
  function (x: number, y: number, w: number, h: number, maxW: number, maxH: number) {
    bboxState.currentBbox = clampBoundingBox({ x, y, width: w, height: h }, maxW, maxH);
  }
);

Then(
  'the clamped bounding box should be \\({int}, {int}, {int}, {int}\\)',
  function (x: number, y: number, w: number, h: number) {
    assert.deepStrictEqual(bboxState.currentBbox, { x, y, width: w, height: h });
  }
);

Given(
  'a bounding box at \\({int}, {int}, {int}, {int}\\) on a {int} by {int} asset',
  function (x: number, y: number, w: number, h: number, maxW: number, maxH: number) {
    bboxState.currentBbox = { x, y, width: w, height: h };
    bboxState.assetW = maxW;
    bboxState.assetH = maxH;
  }
);

When(
  'I pan the bounding box by delta X {int} and delta Y {int}',
  function (deltaX: number, deltaY: number) {
    assert.ok(bboxState.currentBbox && bboxState.assetW && bboxState.assetH);
    bboxState.currentBbox = panBoundingBox(
      bboxState.currentBbox,
      deltaX,
      deltaY,
      bboxState.assetW,
      bboxState.assetH
    );
  }
);

Then(
  'the resulting bounding box should be \\({int}, {int}, {int}, {int}\\)',
  function (x: number, y: number, w: number, h: number) {
    assert.deepStrictEqual(bboxState.currentBbox, { x, y, width: w, height: h });
  }
);

When(
  'I center an {int} by {int} bounding box at stud \\({int}, {int}\\) on a {int} by {int} asset',
  function (w: number, h: number, targetX: number, targetY: number, maxW: number, maxH: number) {
    bboxState.currentBbox = centerBoundingBoxAt(targetX, targetY, w, h, maxW, maxH);
  }
);

When('I zoom the bounding box by scale factor {float}', function (factor: number) {
  assert.ok(bboxState.currentBbox && bboxState.assetW && bboxState.assetH);
  bboxState.currentBbox = zoomBoundingBox(
    bboxState.currentBbox,
    factor,
    bboxState.assetW,
    bboxState.assetH
  );
});

Then('the resulting bounding box width should be {int}', function (expectedWidth: number) {
  assert.ok(bboxState.currentBbox);
  assert.strictEqual(bboxState.currentBbox.width, expectedWidth);
});

Then('the resulting bounding box height should be {int}', function (expectedHeight: number) {
  assert.ok(bboxState.currentBbox);
  assert.strictEqual(bboxState.currentBbox.height, expectedHeight);
});

When(
  'I recover raw bounding box X {int}, Y {int}, Width {int}, Height {int} against asset dimensions {int} by {int}',
  function (x: number, y: number, w: number, h: number, maxW: number, maxH: number) {
    bboxState.recoveryResult = recoverBoundingBox({ x, y, width: w, height: h }, maxW, maxH);
  }
);

Then(
  'the recovered bounding box should be \\({int}, {int}, {int}, {int}\\)',
  function (x: number, y: number, w: number, h: number) {
    assert.deepStrictEqual(bboxState.recoveryResult, { x, y, width: w, height: h });
  }
);

When(
  'I attempt to recover corrupt raw bounding box {string} against asset dimensions {int} by {int}',
  function (raw: string, maxW: number, maxH: number) {
    bboxState.recoveryResult = recoverBoundingBox(raw, maxW, maxH);
  }
);

Then('the recovery result should be null', function () {
  assert.strictEqual(bboxState.recoveryResult, null);
});
