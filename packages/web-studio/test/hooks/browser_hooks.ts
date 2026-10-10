import { Before, After } from '@cucumber/cucumber';
import type { PlaywrightWorld } from '../support/playwright_world.js';

Before({ tags: '@ui' }, async function (this: PlaywrightWorld) {
  // In a full browser setup, launch playwright chromium:
  // this.browser = await chromium.launch({ headless: true });
  // this.page = await this.browser.newPage();
  this.activeTool = 'Select';
  this.selectedColor = 'None';
});

After({ tags: '@ui' }, async function (this: PlaywrightWorld) {
  if (this.page) {
    await this.page.close();
    this.page = null;
  }
  if (this.browser) {
    await this.browser.close();
    this.browser = null;
  }
});
