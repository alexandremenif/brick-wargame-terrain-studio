import type { Page, Browser } from 'playwright';
import assert from 'node:assert';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

export async function waitForWebAwesome(page: Page): Promise<void> {
  await page.evaluate(async () => {
    if (document.fonts?.ready) {
      await document.fonts.ready;
    }
    const tags = Array.from(new Set(
      Array.from(document.querySelectorAll('*'))
        .map((el) => el.localName)
        .filter((name) => name.startsWith('wa-'))
    ));
    await Promise.all(tags.map((tag) => customElements.whenDefined(tag)));
    const elements = Array.from(document.querySelectorAll('*')).filter((el) =>
      el.localName.startsWith('wa-')
    ) as Array<HTMLElement & { updateComplete?: Promise<boolean> }>;
    await Promise.all(elements.map((el) => el.updateComplete));
  });
}

import fs from 'node:fs';
import path from 'node:path';

export async function assertMatchesMockup(
  livePage: Page,
  mockupName: string,
  _port: number,
  _browser: Browser
): Promise<void> {
  // Ensure fixed 1280x800 resolution
  await livePage.setViewportSize({ width: 1280, height: 800 });
  await waitForWebAwesome(livePage);

  const candidatePaths = [
    path.resolve(process.cwd(), `specs/ui/mockups/${mockupName}.png`),
    path.resolve(process.cwd(), `../../specs/ui/mockups/${mockupName}.png`),
  ];
  const refPath = candidatePaths.find((p) => fs.existsSync(p));
  assert.ok(
    refPath,
    `Mockup reference image "${mockupName}.png" not found on disk. Ensure "npm run mockups:render" ran before executing UI parity tests.`
  );

  const refBuffer = fs.readFileSync(refPath);
  const liveBuffer = await livePage.screenshot({ animations: 'disabled' });

  const livePng = PNG.sync.read(liveBuffer);
  const refPng = PNG.sync.read(refBuffer);

  // 1. Structural landmark presence & visibility checks
  const requiredLandmarks = [
    '[data-testid="studio-top-header"]',
    '[data-testid="left-toolbox-sidebar"]',
    '[data-testid="canvas-viewport-container"]',
    '[data-testid="right-inspector-sidebar"]',
  ];
  for (const selector of requiredLandmarks) {
    const loc = livePage.locator(selector);
    assert.ok(
      (await loc.count()) > 0 && (await loc.first().isVisible()),
      `Required UI landmark "${selector}" is missing or not visible`
    );
  }

  if (mockupName === 'delete_asset_modal') {
    const dialogLoc = livePage.locator('[data-testid="delete-asset-dialog"]');
    await dialogLoc.waitFor({ state: 'attached' });
    const isOpen = await dialogLoc.evaluate((el: any) => Boolean(el.open || el.hasAttribute('open')));
    assert.ok(
      isOpen,
      'Delete asset confirmation dialog must be open for delete_asset_modal mockup test'
    );
    // Wait for Web Awesome dialog entrance transition to settle
    await livePage.waitForTimeout(400);
  }

  // 2. Strict layout bounds assertion on central container to detect sidebar collapse
  const containerBox = await livePage.locator('[data-testid="canvas-viewport-container"]').boundingBox();
  assert.ok(containerBox, 'canvas-viewport-container bounding box not found');
  assert.ok(
    Math.abs(containerBox.x - 304) <= 2 &&
    Math.abs(containerBox.y - 48) <= 2 &&
    Math.abs(containerBox.width - 720) <= 2 &&
    Math.abs(containerBox.height - 752) <= 2,
    `Canvas viewport container has invalid layout bounds: ${JSON.stringify(containerBox)}`
  );

  // 3. Locate active modal dialog bounds if present (to NEVER mask over modal dialog pixels)
  let dialogBox: { x: number; y: number; width: number; height: number } | null = null;
  const activeDialog = livePage.locator('[data-testid="delete-asset-dialog"]');
  if ((await activeDialog.count()) > 0) {
    const isModalOpen = await activeDialog.first().evaluate((el: any) => Boolean(el.open || el.hasAttribute('open')));
    if (isModalOpen) {
      dialogBox = await activeDialog.first().evaluate((el: any) => {
        const dialogPart = el.shadowRoot?.querySelector('dialog') || el;
        const r = dialogPart.getBoundingClientRect();
        return { x: r.left, y: r.top, width: r.width, height: r.height };
      });
    }
  }

  // 4. Mask ONLY dynamic inner canvas pixels (excluding modal dialog)
  const canvasLocator = livePage.locator('[data-testid="canvas-viewport"]');
  if ((await canvasLocator.count()) > 0) {
    const box = await canvasLocator.first().boundingBox();
    if (box) {
      const x0 = Math.max(0, Math.floor(box.x));
      const y0 = Math.max(0, Math.floor(box.y));
      const x1 = Math.min(livePng.width, Math.ceil(box.x + box.width));
      const y1 = Math.min(livePng.height, Math.ceil(box.y + box.height));

      for (let y = y0; y < y1; y++) {
        for (let x = x0; x < x1; x++) {
          // Do NOT mask modal dialog pixels!
          if (
            dialogBox &&
            x >= dialogBox.x &&
            x <= dialogBox.x + dialogBox.width &&
            y >= dialogBox.y &&
            y <= dialogBox.y + dialogBox.height
          ) {
            continue;
          }

          const idx = (y * livePng.width + x) * 4;
          livePng.data[idx] = 0;
          livePng.data[idx + 1] = 0;
          livePng.data[idx + 2] = 0;
          livePng.data[idx + 3] = 255;

          refPng.data[idx] = 0;
          refPng.data[idx + 1] = 0;
          refPng.data[idx + 2] = 0;
          refPng.data[idx + 3] = 255;
        }
      }
    }
  }

  const { width, height } = livePng;
  const diffPng = new PNG({ width, height });

  const diffPixels = pixelmatch(
    livePng.data,
    refPng.data,
    diffPng.data,
    width,
    height,
    { threshold: 0.1 }
  );
  const diffRatio = diffPixels / (width * height);

  assert.ok(
    diffRatio <= 0.01,
    `Visual snapshot mismatch between live React UI and ${mockupName}.png: diff ratio is ${(diffRatio * 100).toFixed(2)}% (${diffPixels} pixels differ)`
  );
}
