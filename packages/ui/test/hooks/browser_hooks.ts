import assert from 'node:assert/strict';
import { Before, After, AfterAll, setDefaultTimeout } from '@cucumber/cucumber';
import { PlaywrightWorld, closeSharedBrowser } from '../support/playwright_world.js';

setDefaultTimeout(30000);

Before({ tags: '@ui' }, async function (this: PlaywrightWorld) {
  this.toolMode = 'Brush';
  this.brushSize = '1x1';
  if (this.colors.length > 0) {
    this.selectedColor = this.colors[0];
  } else {
    this.selectedColor = {
      id: 1,
      name: 'White',
      hex: '#FFFFFF',
    };
  }
});

After({ tags: '@ui' }, async function (this: PlaywrightWorld) {
  const errors = [...(this.consoleErrors ?? [])];
  if (this.page) {
    await this.page.close();
    this.page = null;
  }
  assert.deepStrictEqual(
    errors,
    [],
    `Browser console error(s) detected during scenario execution:\n${errors.join('\n')}`
  );
});

AfterAll(async function () {
  await closeSharedBrowser();
});
