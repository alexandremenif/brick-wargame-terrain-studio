import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import type { PlaywrightWorld } from '../support/playwright_world.js';

// ============================================================================
// Background & Lifecycle
// ============================================================================

Given('the UI is loaded with an active asset named {string} of {int} by {int} studs', async function (this: PlaywrightWorld, name: string, width: number, height: number) {
  await this.initLiveApp(name, width, height);
});

Given('the UI is loaded with an active asset of {int} by {int} studs', async function (this: PlaywrightWorld, width: number, height: number) {
  await this.initLiveApp('Modular Outpost', width, height);
});

// ============================================================================
// Header & Modal (header.feature)
// ============================================================================

Then('the header should display asset name {string}', async function (this: PlaywrightWorld, expectedName: string) {
  const page = this.getPage();
  assert.ok(await page.isVisible('[data-testid="header-asset-name"]'), 'Asset name must be visible');
  const text = await page.textContent('[data-testid="header-asset-name"]');
  assert.strictEqual(text?.trim(), expectedName);
});

Then('the width input should be {int}', async function (this: PlaywrightWorld, expectedWidth: number) {
  const page = this.getPage();
  const val = await page.inputValue('[data-testid="header-width-input"]');
  assert.strictEqual(parseInt(val, 10), expectedWidth);
});

Then('the height input should be {int}', async function (this: PlaywrightWorld, expectedHeight: number) {
  const page = this.getPage();
  const val = await page.inputValue('[data-testid="header-height-input"]');
  assert.strictEqual(parseInt(val, 10), expectedHeight);
});

When('I change the width input to {int}', async function (this: PlaywrightWorld, newWidth: number) {
  const page = this.getPage();
  const input = page.locator('[data-testid="header-width-input"]');
  await input.fill(String(newWidth));
  await input.blur();
});

When('I change the height input to {int}', async function (this: PlaywrightWorld, newHeight: number) {
  const page = this.getPage();
  const input = page.locator('[data-testid="header-height-input"]');
  await input.fill(String(newHeight));
  await input.blur();
});

Then('the asset width should be updated to {int} studs', async function (this: PlaywrightWorld, expectedWidth: number) {
  const page = this.getPage();
  const val = await page.inputValue('[data-testid="header-width-input"]');
  assert.strictEqual(parseInt(val, 10), expectedWidth);
  assert.strictEqual(this.asset.width, expectedWidth);
});

Then('the asset height should be updated to {int} studs', async function (this: PlaywrightWorld, expectedHeight: number) {
  const page = this.getPage();
  const val = await page.inputValue('[data-testid="header-height-input"]');
  assert.strictEqual(parseInt(val, 10), expectedHeight);
  assert.strictEqual(this.asset.height, expectedHeight);
});

When('I attempt to enter a width of {int}', async function (this: PlaywrightWorld, invalidWidth: number) {
  const page = this.getPage();
  const input = page.locator('[data-testid="header-width-input"]');
  await input.fill(String(invalidWidth));
  await input.blur();
});

Then('the width input should revert to {int}', async function (this: PlaywrightWorld, expectedWidth: number) {
  const page = this.getPage();
  const val = await page.inputValue('[data-testid="header-width-input"]');
  assert.strictEqual(parseInt(val, 10), expectedWidth);
});

When('I click the {string} button in the header', async function (this: PlaywrightWorld, buttonText: string) {
  const page = this.getPage();
  if (buttonText === 'Delete') {
    await page.click('[data-testid="header-delete-asset-btn"]');
  } else if (buttonText === '+ New') {
    await page.click('[data-testid="header-new-asset-btn"]');
  } else if (buttonText === 'Export for Printing') {
    await page.click('[data-testid="header-export-print-btn"]');
  }
});

Then('the delete confirmation modal should be displayed', async function (this: PlaywrightWorld) {
  const page = this.getPage();
  const modal = page.locator('dialog[role="alertdialog"]');
  assert.ok(await modal.isVisible(), 'Expected delete confirmation modal to be visible');
});

Then(
  'the modal should display the warning for asset {string} with dimensions {int} by {int} studs',
  async function (this: PlaywrightWorld, expectedName: string, expectedWidth: number, expectedHeight: number) {
    const page = this.getPage();
    const desc = await page.textContent('#delete-asset-desc');
    assert.ok(desc?.includes(expectedName), `Expected modal description to include asset name ${expectedName}`);
    assert.ok(desc?.includes(`${expectedWidth}×${expectedHeight}`), `Expected modal to include dimensions ${expectedWidth}×${expectedHeight}`);
  }
);

Given('the delete confirmation modal is open for {string}', async function (this: PlaywrightWorld, assetName: string) {
  const page = this.getPage();
  const currentName = await page.textContent('[data-testid="header-asset-name"]');
  assert.strictEqual(currentName?.trim(), assetName);
  await page.click('[data-testid="header-delete-asset-btn"]');
  const modal = page.locator('dialog[role="alertdialog"]');
  assert.ok(await modal.isVisible(), 'Modal must be open');
});

When('I click the {string} button in the modal', async function (this: PlaywrightWorld, buttonText: string) {
  const page = this.getPage();
  if (buttonText === 'Cancel') {
    await page.click('[data-testid="modal-cancel-btn"]');
  } else if (buttonText === 'Delete Asset') {
    await page.click('[data-testid="modal-confirm-delete-btn"]');
  }
});

Then('the modal should be closed', async function (this: PlaywrightWorld) {
  const page = this.getPage();
  const modal = page.locator('dialog[role="alertdialog"]');
  await modal.waitFor({ state: 'hidden', timeout: 3000 });
  const isVis = await modal.isVisible();
  assert.strictEqual(isVis, false, 'Modal should not be visible when closed');
});

Then('the asset {string} should still exist and remain active', async function (this: PlaywrightWorld, expectedName: string) {
  const page = this.getPage();
  assert.ok(this.asset);
  assert.strictEqual(this.asset.name, expectedName);
  const text = await page.textContent('[data-testid="header-asset-name"]');
  assert.strictEqual(text?.trim(), expectedName);
});

Then('the asset {string} should be deleted', async function (this: PlaywrightWorld, _expectedName: string) {
  assert.ok(this.deletedAssetId);
});

Then('an image export should be requested with profile {string}', async function (this: PlaywrightWorld, expectedProfile: string) {
  const page = this.getPage();
  const startTime = Date.now();
  while (!this.lastExportRequest && Date.now() - startTime < 2000) {
    await page.waitForTimeout(50);
  }
  assert.ok(this.lastExportRequest, 'Expected exportImage request to have been dispatched within 2000ms');
  assert.strictEqual(this.lastExportRequest.profile, expectedProfile);
  assert.strictEqual(this.lastExportRequest.assetId, this.asset.id);
});

Then('a file download for {string} should be initiated', async function (this: PlaywrightWorld, expectedFilename: string) {
  const page = this.getPage();
  // Check either programmatic download captured in window.__lastDownload or Playwright download event
  const lastProgrammaticDownload = await page.evaluate(() => (window as any).__lastDownload);
  const foundInBrowser = this.initiatedDownloads.find((d) => d.filename === expectedFilename);
  const foundInWindow = lastProgrammaticDownload?.filename === expectedFilename;

  assert.ok(
    foundInBrowser || foundInWindow,
    `Expected file download for "${expectedFilename}" to be initiated. Browser downloads: ${JSON.stringify(
      this.initiatedDownloads
    )}, Programmatic download: ${JSON.stringify(lastProgrammaticDownload)}`
  );
});

// ============================================================================
// Toolbox (toolbox.feature)
// ============================================================================

Then('the active tool mode should be {string}', async function (this: PlaywrightWorld, expectedMode: string) {
  const page = this.getPage();
  let selector = '[data-testid="tool-brush-btn"]';
  if (expectedMode === 'Eraser') {
    selector = '[data-testid="tool-eraser-btn"]';
  } else if (expectedMode === 'Pan') {
    selector = '[data-testid="tool-pan-btn"]';
  }
  const btnClass = await page.$eval(selector, (el) => el.className);
  assert.ok(btnClass.includes('border-amber-500'), `Expected ${expectedMode} button to have active styling`);
});

Then('the active brush size should be {string}', async function (this: PlaywrightWorld, expectedSize: string) {
  const page = this.getPage();
  const btnClass = await page.$eval(`[data-testid="brush-size-${expectedSize}"]`, (el) => el.className);
  assert.ok(btnClass.includes('border-amber-500'), `Expected brush size ${expectedSize} button to have active styling`);
});

Then('an official brick color should be selected by default', async function (this: PlaywrightWorld) {
  const page = this.getPage();
  const activeSwatches = await page.$$eval('[data-testid^="color-swatch-"]', (els) =>
    els.filter((el) => el.className.includes('ring-2 ring-white')).length
  );
  assert.strictEqual(activeSwatches, 1, 'Exactly one official color swatch must be selected by default');
});

When('I click the {string} tool button', async function (this: PlaywrightWorld, toolName: string) {
  const page = this.getPage();
  if (toolName === 'Eraser') {
    await page.click('[data-testid="tool-eraser-btn"]');
  } else if (toolName === 'Brush') {
    await page.click('[data-testid="tool-brush-btn"]');
  } else if (toolName === 'Pan') {
    await page.click('[data-testid="tool-pan-btn"]');
  }
});

When('I select brush size {string}', async function (this: PlaywrightWorld, size: string) {
  const page = this.getPage();
  await page.click(`[data-testid="brush-size-${size}"]`);
});

When('I select the brick color swatch {string}', async function (this: PlaywrightWorld, colorName: string) {
  const page = this.getPage();
  await page.click(`[data-testid="color-swatch-${colorName}"]`);
});

Then(
  'the selected color should be {string} with hex {string}',
  async function (this: PlaywrightWorld, expectedName: string, expectedHex: string) {
    const page = this.getPage();
    const swatch = page.locator(`[data-testid="color-swatch-${expectedName}"]`);
    assert.strictEqual(await swatch.getAttribute('data-color-hex'), expectedHex);
    assert.strictEqual(await swatch.getAttribute('data-color-name'), expectedName);
  }
);

Then('the swatch for {string} should show an active visual indicator', async function (this: PlaywrightWorld, expectedName: string) {
  const page = this.getPage();
  const swatchClass = await page.$eval(`[data-testid="color-swatch-${expectedName}"]`, (el) => el.className);
  assert.ok(
    swatchClass.includes('ring-2 ring-white'),
    `Expected swatch ${expectedName} to have 'ring-2 ring-white' class in DOM`
  );
});

// ============================================================================
// Viewport (viewport.feature)
// ============================================================================

When(
  'the active bounding box is set to X {int}, Y {int}, Width {int}, Height {int}',
  async function (this: PlaywrightWorld, x: number, y: number, w: number, h: number) {
    const page = this.getPage();
    const xInput = page.locator('[data-testid="inspector-bbox-x"]');
    const yInput = page.locator('[data-testid="inspector-bbox-y"]');
    const wInput = page.locator('[data-testid="inspector-bbox-w"]');
    const hInput = page.locator('[data-testid="inspector-bbox-h"]');

    await wInput.fill(String(w));
    await wInput.blur();
    await hInput.fill(String(h));
    await hInput.blur();
    await xInput.fill(String(x));
    await xInput.blur();
    await yInput.fill(String(y));
    await yInput.blur();
  }
);

Then(
  'the canvas viewport should frame exactly the {int} by {int} subregion from \\({int}, {int}\\) to \\({int}, {int}\\)',
  async function (this: PlaywrightWorld, _w: number, _h: number, _x1: number, _y1: number, _x2: number, _y2: number) {
    const page = this.getPage();
    const canvas = page.locator('canvas[data-testid="canvas-viewport"]');
    assert.ok(await canvas.isVisible(), 'Canvas viewport must be visible in DOM');
  }
);

Then('the studs should be scaled to best fit the viewport with no scrollbars', async function (this: PlaywrightWorld) {
  const page = this.getPage();
  const canvasWidth = await page.$eval('canvas[data-testid="canvas-viewport"]', (el) =>
    parseInt((el as HTMLCanvasElement).getAttribute('width') || '0', 10)
  );
  const canvasHeight = await page.$eval('canvas[data-testid="canvas-viewport"]', (el) =>
    parseInt((el as HTMLCanvasElement).getAttribute('height') || '0', 10)
  );
  assert.ok(canvasWidth > 0, 'Canvas width must be strictly positive');
  assert.ok(canvasHeight > 0, 'Canvas height must be strictly positive');
});

Then('there should be no pink bounding box overlay on the canvas', async function (this: PlaywrightWorld) {
  const page = this.getPage();
  const pinkOverlays = await page.$$eval(
    '[data-testid="canvas-viewport-container"] [style*="pink"], [data-testid="canvas-viewport-container"] [class*="pink"], [data-testid="canvas-viewport-container"] [style*="magenta"]',
    (els) => els.length
  );
  assert.strictEqual(pinkOverlays, 0, 'No pink bounding box overlays should exist in the canvas viewport container');
});

When(
  'I click on the stud at coordinate \\({int}, {int}\\) in the viewport',
  async function (this: PlaywrightWorld, x: number, y: number) {
    const page = this.getPage();
    const canvas = page.locator('[data-testid="canvas-viewport"]');

    // Get active bounding box from inspector inputs
    const bboxX = parseInt(await page.inputValue('[data-testid="inspector-bbox-x"]'), 10);
    const bboxY = parseInt(await page.inputValue('[data-testid="inspector-bbox-y"]'), 10);
    const bboxW = parseInt(await page.inputValue('[data-testid="inspector-bbox-w"]'), 10);
    const bboxH = parseInt(await page.inputValue('[data-testid="inspector-bbox-h"]'), 10);

    const canvasWidth = parseInt((await canvas.getAttribute('width')) || '0', 10);
    const canvasHeight = parseInt((await canvas.getAttribute('height')) || '0', 10);

    const studW = canvasWidth / bboxW;
    const studH = canvasHeight / bboxH;

    const relX = x - bboxX;
    const relY = y - bboxY;

    const clickX = relX * studW + studW / 2;
    const clickY = relY * studH + studH / 2;

    await canvas.click({ position: { x: clickX, y: clickY } });
  }
);

Then(
  'the stud at coordinate \\({int}, {int}\\) should be rendered with color {string}',
  async function (this: PlaywrightWorld, x: number, y: number, expectedColorName: string) {
    const cell = this.asset.cells.find((c) => c.x === x && c.y === y);
    assert.ok(cell, `Expected cell (${x}, ${y}) to be painted`);
    const color = this.colors.find((c) => c.id === cell.colorId);
    assert.ok(color);
    assert.strictEqual(color.name, expectedColorName);
  }
);

Then('exactly {int} stud should be painted', async function (this: PlaywrightWorld, expectedCount: number) {
  assert.strictEqual(this.asset.paintedCellsCount, expectedCount);
});

Then('exactly {int} studs should be painted', async function (this: PlaywrightWorld, expectedCount: number) {
  assert.strictEqual(this.asset.paintedCellsCount, expectedCount);
});

Then(
  'the studs in bounding box \\({int}, {int}, {int}, {int}\\) should have color {string}',
  async function (this: PlaywrightWorld, x: number, y: number, w: number, h: number, colorName: string) {
    const color = this.colors.find((c) => c.name === colorName);
    assert.ok(color);
    for (let cx = x; cx < x + w; cx++) {
      for (let cy = y; cy < y + h; cy++) {
        const cell = this.asset.cells.find((c) => c.x === cx && c.y === cy);
        assert.ok(cell, `Cell (${cx}, ${cy}) must be painted`);
        assert.strictEqual(cell.colorId, color.id);
      }
    }
  }
);

Given(
  'the stud at coordinate \\({int}, {int}\\) is painted with color {string}',
  async function (this: PlaywrightWorld, x: number, y: number, colorName: string) {
    const page = this.getPage();
    await page.click(`[data-testid="color-swatch-${colorName}"]`);
    await page.click('[data-testid="tool-brush-btn"]');
    await page.click('[data-testid="brush-size-1x1"]');

    const canvas = page.locator('[data-testid="canvas-viewport"]');
    const bboxX = parseInt(await page.inputValue('[data-testid="inspector-bbox-x"]'), 10);
    const bboxY = parseInt(await page.inputValue('[data-testid="inspector-bbox-y"]'), 10);
    const bboxW = parseInt(await page.inputValue('[data-testid="inspector-bbox-w"]'), 10);
    const bboxH = parseInt(await page.inputValue('[data-testid="inspector-bbox-h"]'), 10);

    const canvasWidth = parseInt((await canvas.getAttribute('width')) || '0', 10);
    const canvasHeight = parseInt((await canvas.getAttribute('height')) || '0', 10);
    const studW = canvasWidth / bboxW;
    const studH = canvasHeight / bboxH;

    const clickX = (x - bboxX) * studW + studW / 2;
    const clickY = (y - bboxY) * studH + studH / 2;

    await canvas.click({ position: { x: clickX, y: clickY } });
  }
);

Then('the stud at coordinate \\({int}, {int}\\) should be unpainted', async function (this: PlaywrightWorld, x: number, y: number) {
  const cell = this.asset.cells.find((c) => c.x === x && c.y === y);
  assert.strictEqual(cell, undefined, `Expected cell (${x}, ${y}) to be unpainted`);
});

// ============================================================================
// Inspector & Minimap (inspector.feature)
// ============================================================================

When(
  'I enter bounding box coordinates X {int}, Y {int}, Width {int}, Height {int}',
  async function (this: PlaywrightWorld, x: number, y: number, w: number, h: number) {
    const page = this.getPage();
    const xInput = page.locator('[data-testid="inspector-bbox-x"]');
    const yInput = page.locator('[data-testid="inspector-bbox-y"]');
    const wInput = page.locator('[data-testid="inspector-bbox-w"]');
    const hInput = page.locator('[data-testid="inspector-bbox-h"]');

    await wInput.fill(String(w));
    await wInput.blur();
    await hInput.fill(String(h));
    await hInput.blur();
    await xInput.fill(String(x));
    await xInput.blur();
    await yInput.fill(String(y));
    await yInput.blur();
  }
);

Then(
  'the inspector inputs should reflect X {int}, Y {int}, Width {int}, Height {int}',
  async function (this: PlaywrightWorld, x: number, y: number, w: number, h: number) {
    const page = this.getPage();
    const ix = parseInt(await page.inputValue('[data-testid="inspector-bbox-x"]'), 10);
    const iy = parseInt(await page.inputValue('[data-testid="inspector-bbox-y"]'), 10);
    const iw = parseInt(await page.inputValue('[data-testid="inspector-bbox-w"]'), 10);
    const ih = parseInt(await page.inputValue('[data-testid="inspector-bbox-h"]'), 10);

    assert.strictEqual(ix, x);
    assert.strictEqual(iy, y);
    assert.strictEqual(iw, w);
    assert.strictEqual(ih, h);
  }
);

Then(
  'the canvas viewport should frame the subregion \\({int}, {int}, {int}, {int}\\)',
  async function (this: PlaywrightWorld, x: number, y: number, w: number, h: number) {
    const page = this.getPage();
    const ix = parseInt(await page.inputValue('[data-testid="inspector-bbox-x"]'), 10);
    const iy = parseInt(await page.inputValue('[data-testid="inspector-bbox-y"]'), 10);
    const iw = parseInt(await page.inputValue('[data-testid="inspector-bbox-w"]'), 10);
    const ih = parseInt(await page.inputValue('[data-testid="inspector-bbox-h"]'), 10);

    assert.strictEqual(ix, x);
    assert.strictEqual(iy, y);
    assert.strictEqual(iw, w);
    assert.strictEqual(ih, h);
  }
);

Then(
  'the minimap should display the bounding box indicator at position \\({int}, {int}, {int}, {int}\\) on the {int} by {int} asset',
  async function (this: PlaywrightWorld, x: number, y: number, w: number, h: number, aw: number, ah: number) {
    const page = this.getPage();
    const style = await page.$eval('[data-testid="minimap-bounding-box-indicator"]', (el) => ({
      left: (el as HTMLElement).style.left,
      top: (el as HTMLElement).style.top,
      width: (el as HTMLElement).style.width,
      height: (el as HTMLElement).style.height,
    }));

    const expectedLeft = `${(x / aw) * 100}%`;
    const expectedTop = `${(y / ah) * 100}%`;
    const expectedWidth = `${(w / aw) * 100}%`;
    const expectedHeight = `${(h / ah) * 100}%`;

    assert.strictEqual(style.left, expectedLeft);
    assert.strictEqual(style.top, expectedTop);
    assert.strictEqual(style.width, expectedWidth);
    assert.strictEqual(style.height, expectedHeight);
  }
);

Given(
  'the bounding box is currently at X {int}, Y {int}, Width {int}, Height {int}',
  async function (this: PlaywrightWorld, x: number, y: number, w: number, h: number) {
    const page = this.getPage();
    const xInput = page.locator('[data-testid="inspector-bbox-x"]');
    const yInput = page.locator('[data-testid="inspector-bbox-y"]');
    const wInput = page.locator('[data-testid="inspector-bbox-w"]');
    const hInput = page.locator('[data-testid="inspector-bbox-h"]');

    // To prevent validation collisions when current (x, y) + new (w, h) exceeds asset dimensions:
    // First shrink width and height so that (32 - current x) is not exceeded, or if current is 0,0:
    await wInput.fill(String(w));
    await wInput.blur();
    await hInput.fill(String(h));
    await hInput.blur();

    // Now x and y can safely be set up to 32 - w/h:
    await xInput.fill(String(x));
    await xInput.blur();
    await yInput.fill(String(y));
    await yInput.blur();
  }
);

When('I enter bounding box coordinate X {int}', async function (this: PlaywrightWorld, newX: number) {
  const page = this.getPage();
  const xInput = page.locator('[data-testid="inspector-bbox-x"]');
  await xInput.fill(String(newX));
  await xInput.blur();
});

Then('the input should be rejected and revert to X {int}', async function (this: PlaywrightWorld, expectedX: number) {
  const page = this.getPage();
  const val = await page.inputValue('[data-testid="inspector-bbox-x"]');
  assert.strictEqual(parseInt(val, 10), expectedX);
});

Then(
  'the canvas viewport framing should remain at \\({int}, {int}, {int}, {int}\\)',
  async function (this: PlaywrightWorld, x: number, y: number, w: number, h: number) {
    const page = this.getPage();
    const ix = parseInt(await page.inputValue('[data-testid="inspector-bbox-x"]'), 10);
    const iy = parseInt(await page.inputValue('[data-testid="inspector-bbox-y"]'), 10);
    const iw = parseInt(await page.inputValue('[data-testid="inspector-bbox-w"]'), 10);
    const ih = parseInt(await page.inputValue('[data-testid="inspector-bbox-h"]'), 10);

    assert.strictEqual(ix, x);
    assert.strictEqual(iy, y);
    assert.strictEqual(iw, w);
    assert.strictEqual(ih, h);
  }
);

When('I enter bounding box Width {int}', async function (this: PlaywrightWorld, newW: number) {
  const page = this.getPage();
  const wInput = page.locator('[data-testid="inspector-bbox-w"]');
  await wInput.fill(String(newW));
  await wInput.blur();
});

Then('the input should be rejected and revert to Width {int}', async function (this: PlaywrightWorld, expectedW: number) {
  const page = this.getPage();
  const val = await page.inputValue('[data-testid="inspector-bbox-w"]');
  assert.strictEqual(parseInt(val, 10), expectedW);
});

When('I click the {string} button in the inspector', async function (this: PlaywrightWorld, btnName: string) {
  const page = this.getPage();
  if (btnName === 'Fit to Asset') {
    await page.click('[data-testid="inspector-fit-to-asset-btn"]');
  } else if (btnName === 'Zoom In') {
    await page.click('[data-testid="inspector-zoom-in-btn"]');
  } else if (btnName === 'Zoom Out') {
    await page.click('[data-testid="inspector-zoom-out-btn"]');
  }
  await page.waitForTimeout(50);
});

Then(
  'the canvas viewport should frame the full asset \\({int}, {int}, {int}, {int}\\)',
  async function (this: PlaywrightWorld, x: number, y: number, w: number, h: number) {
    const page = this.getPage();
    const ix = parseInt(await page.inputValue('[data-testid="inspector-bbox-x"]'), 10);
    const iy = parseInt(await page.inputValue('[data-testid="inspector-bbox-y"]'), 10);
    const iw = parseInt(await page.inputValue('[data-testid="inspector-bbox-w"]'), 10);
    const ih = parseInt(await page.inputValue('[data-testid="inspector-bbox-h"]'), 10);

    assert.strictEqual(ix, x);
    assert.strictEqual(iy, y);
    assert.strictEqual(iw, w);
    assert.strictEqual(ih, h);
  }
);

Then(
  'the minimap bounding box indicator should cover the entire {int} by {int} asset',
  async function (this: PlaywrightWorld, _aw: number, _ah: number) {
    const page = this.getPage();
    const style = await page.$eval('[data-testid="minimap-bounding-box-indicator"]', (el) => ({
      left: (el as HTMLElement).style.left,
      top: (el as HTMLElement).style.top,
      width: (el as HTMLElement).style.width,
      height: (el as HTMLElement).style.height,
    }));
    assert.strictEqual(style.left, '0%');
    assert.strictEqual(style.top, '0%');
    assert.strictEqual(style.width, '100%');
    assert.strictEqual(style.height, '100%');
  }
);

// ============================================================================
// Extended Navigation & Zoom Steps
// ============================================================================

Then(
  'the bounding box width and height should decrease by approximately 25 percent',
  async function (this: PlaywrightWorld) {
    const page = this.getPage();
    const iw = parseInt(await page.inputValue('[data-testid="inspector-bbox-w"]'), 10);
    const ih = parseInt(await page.inputValue('[data-testid="inspector-bbox-h"]'), 10);
    // Was 16x16, 25% decrease -> ~12 or 13
    assert.ok(iw < 16 && iw >= 11, `Expected width to decrease by ~25%, got ${iw}`);
    assert.ok(ih < 16 && ih >= 11, `Expected height to decrease by ~25%, got ${ih}`);
  }
);

Then(
  'the bounding box width and height should increase by approximately 25 percent',
  async function (this: PlaywrightWorld) {
    const page = this.getPage();
    const iw = parseInt(await page.inputValue('[data-testid="inspector-bbox-w"]'), 10);
    const ih = parseInt(await page.inputValue('[data-testid="inspector-bbox-h"]'), 10);
    // Was 8x8, 25% increase -> ~10
    assert.ok(iw > 8 && iw <= 11, `Expected width to increase by ~25%, got ${iw}`);
    assert.ok(ih > 8 && ih <= 11, `Expected height to increase by ~25%, got ${ih}`);
  }
);

Then(
  'the center of the bounding box should remain approximately at \\({int}, {int}\\)',
  async function (this: PlaywrightWorld, cx: number, cy: number) {
    const page = this.getPage();
    const ix = parseInt(await page.inputValue('[data-testid="inspector-bbox-x"]'), 10);
    const iy = parseInt(await page.inputValue('[data-testid="inspector-bbox-y"]'), 10);
    const iw = parseInt(await page.inputValue('[data-testid="inspector-bbox-w"]'), 10);
    const ih = parseInt(await page.inputValue('[data-testid="inspector-bbox-h"]'), 10);

    const actualCx = ix + iw / 2;
    const actualCy = iy + ih / 2;

    assert.ok(Math.abs(actualCx - cx) <= 1.5, `Expected center X ~${cx}, got ${actualCx}`);
    assert.ok(Math.abs(actualCy - cy) <= 1.5, `Expected center Y ~${cy}, got ${actualCy}`);
  }
);

When(
  'I click on the minimap at asset position \\({int}, {int}\\)',
  async function (this: PlaywrightWorld, targetX: number, targetY: number) {
    const page = this.getPage();
    const canvas = page.locator('canvas[data-testid="minimap-canvas"]');
    await canvas.scrollIntoViewIfNeeded();
    const box = await canvas.boundingBox();
    assert.ok(box, 'Minimap canvas bounding box must be available');

    // Click relative to asset dimensions (32x32)
    // Offset slightly into the stud cell (+ 0.5 stud) so rounding lands safely inside
    const offsetX = Math.min(box.width - 2, Math.max(2, ((targetX + 0.5) / 32) * box.width));
    const offsetY = Math.min(box.height - 2, Math.max(2, ((targetY + 0.5) / 32) * box.height));

    await canvas.click({
      position: { x: offsetX, y: offsetY },
      force: true,
    });
    await page.waitForTimeout(50);
  }
);

Then(
  'the minimap bounding box indicator should be centered at position \\({int}, {int}\\)',
  async function (this: PlaywrightWorld, cx: number, cy: number) {
    const page = this.getPage();
    const ix = parseInt(await page.inputValue('[data-testid="inspector-bbox-x"]'), 10);
    const iy = parseInt(await page.inputValue('[data-testid="inspector-bbox-y"]'), 10);
    const iw = parseInt(await page.inputValue('[data-testid="inspector-bbox-w"]'), 10);
    const ih = parseInt(await page.inputValue('[data-testid="inspector-bbox-h"]'), 10);

    const actualCx = ix + iw / 2;
    const actualCy = iy + ih / 2;

    assert.strictEqual(actualCx, cx);
    assert.strictEqual(actualCy, cy);
  }
);

Then('the {string} button in the inspector should be disabled', async function (this: PlaywrightWorld, btnName: string) {
  const page = this.getPage();
  let selector = '';
  if (btnName === 'Zoom In') selector = '[data-testid="inspector-zoom-in-btn"]';
  else if (btnName === 'Zoom Out') selector = '[data-testid="inspector-zoom-out-btn"]';
  else if (btnName === 'Fit to Asset') selector = '[data-testid="inspector-fit-to-asset-btn"]';

  assert.ok(selector, `Unknown inspector button "${btnName}"`);
  const isDisabled = await page.isDisabled(selector);
  assert.ok(isDisabled, `Expected button "${btnName}" to be disabled`);
});

When(
  'I drag the mouse across the canvas viewport by an offset corresponding to {int} studs horizontally and {int} studs vertically',
  async function (this: PlaywrightWorld, studsX: number, studsY: number) {
    const page = this.getPage();
    const canvas = page.locator('canvas[data-testid="canvas-viewport"]');
    const box = await canvas.boundingBox();
    assert.ok(box, 'Canvas bounding box must be available');

    const width = parseInt(await page.inputValue('[data-testid="inspector-bbox-w"]'), 10);
    const studSize = box.width / width;

    const startX = box.x + box.width / 2;
    const startY = box.y + box.height / 2;

    // Drag natural grab: dragging cursor moves canvas
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX + studsX * studSize, startY + studsY * studSize, { steps: 5 });
    await page.mouse.up();
  }
);

When('I scroll the mouse wheel up over the canvas viewport', async function (this: PlaywrightWorld) {
  const page = this.getPage();
  await page.dispatchEvent('canvas[data-testid="canvas-viewport"]', 'wheel', {
    deltaY: -100,
    bubbles: true,
    cancelable: true,
  });
  await page.waitForTimeout(50);
});

When('I scroll the mouse wheel down over the canvas viewport', async function (this: PlaywrightWorld) {
  const page = this.getPage();
  await page.dispatchEvent('canvas[data-testid="canvas-viewport"]', 'wheel', {
    deltaY: 100,
    bubbles: true,
    cancelable: true,
  });
  await page.waitForTimeout(50);
});

// ============================================================================
// Persistence Steps (persistence.feature)
// ============================================================================

Given(
  'asset {string} has a persisted bounding box \\({int}, {int}, {int}, {int}\\) in storage',
  async function (this: PlaywrightWorld, assetName: string, x: number, y: number, w: number, h: number) {
    if (!this.page) {
      await this.initLiveApp(assetName, 32, 32);
    }
    const page = this.getPage();
    const key = `bwts:bbox:asset-test-1`; // Maps to active asset ID
    await page.evaluate(
      ([k, bbox]) => {
        window.localStorage.setItem(k, JSON.stringify(bbox));
      },
      [key, { x, y, width: w, height: h }] as const
    );
    await page.reload();
    await page.waitForSelector('[data-testid="header-asset-name"]');
  }
);

Given('asset {string} has no persisted bounding box in storage', async function (this: PlaywrightWorld, assetName: string) {
  if (!this.page) {
    await this.initLiveApp(assetName, 32, 32);
  }
  const page = this.getPage();
  await page.evaluate(() => {
    window.localStorage.clear();
  });
});

When(
  'the UI is loaded with active asset {string} of {int} by {int} studs',
  async function (this: PlaywrightWorld, assetName: string, width: number, height: number) {
    // Re-init with this asset name and size
    await this.initLiveApp(assetName, width, height);
  }
);

When('the asset {string} dimensions are currently {int} by {int} studs', async function (this: PlaywrightWorld, _assetName: string, width: number, height: number) {
  this.asset.width = width;
  this.asset.height = height;
});

When('the UI is loaded with active asset {string}', async function (this: PlaywrightWorld, assetName: string) {
  await this.initLiveApp(assetName, this.asset.width, this.asset.height);
});

Then(
  'the persisted bounding box in storage for {string} should be self-healed to \\({int}, {int}, {int}, {int}\\)',
  async function (this: PlaywrightWorld, _assetName: string, x: number, y: number, w: number, h: number) {
    const page = this.getPage();
    const key = `bwts:bbox:asset-test-1`;
    const stored = await page.evaluate((k) => window.localStorage.getItem(k), key);
    assert.ok(stored, 'Expected self-healed entry in localStorage');
    const parsed = JSON.parse(stored);
    assert.deepStrictEqual(parsed, { x, y, width: w, height: h });
  }
);

Then(
  'the storage entry for {string} should contain bounding box \\({int}, {int}, {int}, {int}\\)',
  async function (this: PlaywrightWorld, _assetName: string, x: number, y: number, w: number, h: number) {
    const page = this.getPage();
    const key = `bwts:bbox:asset-test-1`;
    // Wait for debounce write (150ms)
    await page.waitForTimeout(200);
    const stored = await page.evaluate((k) => window.localStorage.getItem(k), key);
    assert.ok(stored, 'Expected bounding box to be stored in localStorage');
    const parsed = JSON.parse(stored);
    assert.deepStrictEqual(parsed, { x, y, width: w, height: h });
  }
);

Then('the storage entry for {string} should be removed', async function (this: PlaywrightWorld, _assetName: string) {
  const page = this.getPage();
  const key = `bwts:bbox:asset-test-1`;
  await page.waitForFunction(
    (k) => window.localStorage.getItem(k) === null,
    key,
    { timeout: 2000 }
  );
  const stored = await page.evaluate((k) => window.localStorage.getItem(k), key);
  assert.strictEqual(stored, null);
});

Then(
  'the minimap thumbnail canvas should preserve the aspect ratio for a {int} by {int} asset',
  async function (this: PlaywrightWorld, width: number, height: number) {
    const page = this.getPage();
    const containerBox = await page.locator('[data-testid="minimap-container"]').boundingBox();
    const canvasBox = await page.locator('canvas[data-testid="minimap-canvas"]').boundingBox();
    assert.ok(containerBox, 'Minimap container must be present');
    assert.ok(canvasBox, 'Minimap canvas must be present');

    assert.ok(
      canvasBox.width <= containerBox.width + 1 && canvasBox.height <= containerBox.height + 1,
      `Minimap canvas (${canvasBox.width}x${canvasBox.height}) must not overflow container (${containerBox.width}x${containerBox.height})`
    );

    const expectedRatio = width / height;
    const actualRatio = canvasBox.width / canvasBox.height;
    assert.ok(
      Math.abs(actualRatio - expectedRatio) < 0.05,
      `Expected aspect ratio ~${expectedRatio}, got ${actualRatio} (width=${canvasBox.width}, height=${canvasBox.height})`
    );
  }
);

Then(
  'the minimap thumbnail should be centered within its container',
  async function (this: PlaywrightWorld) {
    const page = this.getPage();
    const containerBox = await page.locator('[data-testid="minimap-container"]').boundingBox();
    const canvasBox = await page.locator('canvas[data-testid="minimap-canvas"]').boundingBox();
    assert.ok(containerBox, 'Minimap container must be present');
    assert.ok(canvasBox, 'Minimap canvas must be present');

    const containerCenterX = containerBox.x + containerBox.width / 2;
    const containerCenterY = containerBox.y + containerBox.height / 2;
    const canvasCenterX = canvasBox.x + canvasBox.width / 2;
    const canvasCenterY = canvasBox.y + canvasBox.height / 2;

    assert.ok(
      Math.abs(canvasCenterX - containerCenterX) <= 2,
      `Expected horizontal center ${containerCenterX}, got ${canvasCenterX}`
    );
    assert.ok(
      Math.abs(canvasCenterY - containerCenterY) <= 2,
      `Expected vertical center ${containerCenterY}, got ${canvasCenterY}`
    );
  }
);
