import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import type { StudioWorld } from '../support/world.js';

Given('a new TerrainMap with default dining table dimensions', async function (this: StudioWorld) {
  await this.driver.createMap(118, 225);
});

Then('the map width should be {int} studs', async function (this: StudioWorld, expectedWidth: number) {
  const dimensions = await this.driver.getMapDimensions();
  assert.strictEqual(dimensions.width, expectedWidth);
});

Then('the map height should be {int} studs', async function (this: StudioWorld, expectedHeight: number) {
  const dimensions = await this.driver.getMapDimensions();
  assert.strictEqual(dimensions.height, expectedHeight);
});

Then('all cells should be unpainted', async function (this: StudioWorld) {
  const count = await this.driver.getPaintedCellCount();
  assert.strictEqual(count, 0);
});

When(
  'I paint the bounding box \\({int}, {int}, {int}, {int}\\) with LEGO color {string}',
  async function (this: StudioWorld, x: number, y: number, w: number, h: number, colorName: string) {
    await this.driver.paintBoundingBox(x, y, w, h, colorName);
  }
);

Then(
  'the bounding box \\({int}, {int}, {int}, {int}\\) should have color {string}',
  async function (this: StudioWorld, x: number, y: number, w: number, h: number, colorName: string) {
    const isMatching = await this.driver.verifyBBoxColor(x, y, w, h, colorName);
    assert.strictEqual(isMatching, true, `Bounding box (${x}, ${y}, ${w}, ${h}) was not painted with ${colorName}`);
  }
);

Then('exactly {int} cells should be painted', async function (this: StudioWorld, expectedCount: number) {
  const count = await this.driver.getPaintedCellCount();
  assert.strictEqual(count, expectedCount, `Expected exactly ${expectedCount} painted cells, but found ${count}`);
});

Then('the undo history should have {int} entry', async function (this: StudioWorld, expectedCount: number) {
  const count = await this.driver.getUndoHistoryCount();
  assert.strictEqual(count, expectedCount);
});

Then('the undo history should have {int} entries', async function (this: StudioWorld, expectedCount: number) {
  const count = await this.driver.getUndoHistoryCount();
  assert.strictEqual(count, expectedCount);
});

When('I attempt to paint a cell at coordinate \\({int}, {int}\\)', async function (this: StudioWorld, x: number, y: number) {
  try {
    await this.driver.paintCell(x, y, 1);
    this.lastError = null;
  } catch (err) {
    this.lastError = err as Error;
  }
});

When(
  'I attempt to paint the bounding box \\({int}, {int}, {int}, {int}\\) with LEGO color {string}',
  async function (this: StudioWorld, x: number, y: number, w: number, h: number, colorName: string) {
    try {
      await this.driver.paintBoundingBox(x, y, w, h, colorName);
      this.lastError = null;
    } catch (err) {
      this.lastError = err as Error;
    }
  }
);

Then('an out-of-bounds error should be raised', function (this: StudioWorld) {
  assert.ok(
    this.lastError instanceof Error,
    'Expected an Error instance to be raised for out-of-bounds painting, but none occurred.'
  );
  assert.match(
    this.lastError.message,
    /out of map bounds/i,
    `Expected out of bounds error message, but received: "${this.lastError.message}"`
  );
});
