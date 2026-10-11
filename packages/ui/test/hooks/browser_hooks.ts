import { Before, After, AfterAll } from '@cucumber/cucumber';
import { PlaywrightWorld, closeSharedBrowser } from '../support/playwright_world.js';

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
  if (this.page) {
    await this.page.close();
    this.page = null;
  }
});

AfterAll(async function () {
  await closeSharedBrowser();
});
