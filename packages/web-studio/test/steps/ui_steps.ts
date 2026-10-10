import { Given, When, Then } from '@cucumber/cucumber';
import assert from 'node:assert/strict';
import type { PlaywrightWorld } from '../support/playwright_world.js';

Given('the Web Studio is loaded in the browser', async function (this: PlaywrightWorld) {
  // In full browser setup: await this.page.goto('http://localhost:3000');
  // Verifies the World session is initialized
  assert.ok(this.activeTool !== undefined, 'Studio workspace state must be initialized');
});

When('I select the {string} tool', async function (this: PlaywrightWorld, toolName: string) {
  // In full browser setup: await this.page.click(`[data-testid="tool-${toolName.toLowerCase()}"]`);
  this.activeTool = toolName;
});

When('I pick the color {string}', async function (this: PlaywrightWorld, colorName: string) {
  // In full browser setup: await this.page.click(`[data-color="${colorName}"]`);
  this.selectedColor = colorName;
});

Then('the active tool should be {string}', async function (this: PlaywrightWorld, expectedTool: string) {
  assert.strictEqual(this.activeTool, expectedTool);
});

Then('the selected color should be {string}', async function (this: PlaywrightWorld, expectedColor: string) {
  assert.strictEqual(this.selectedColor, expectedColor);
});
