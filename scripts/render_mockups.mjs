import { chromium } from '@playwright/test';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const mockupsDir = path.join(rootDir, 'specs/ui/mockups');

async function renderAllMockups() {
  const loaderPath = path.join(mockupsDir, 'webawesome-loader.ts');
  const bundleOutPath = path.join(mockupsDir, 'webawesome.elements.js');

  if (fs.existsSync(loaderPath)) {
    console.log('Bundling Web Awesome elements for mockups...');
    await build({
      entryPoints: [loaderPath],
      bundle: true,
      outfile: bundleOutPath,
      format: 'iife',
      minify: true,
      target: 'es2022',
    });
  }

  // Dynamically discover all *.html mockup files in specs/ui/mockups/
  const files = fs.readdirSync(mockupsDir);
  const htmlFiles = files.filter((file) => file.endsWith('.html'));

  if (htmlFiles.length === 0) {
    console.log('No HTML mockups found in', mockupsDir);
    return;
  }

  console.log(`Discovered ${htmlFiles.length} HTML mockups: ${htmlFiles.join(', ')}`);

  const browser = await chromium.launch();
  try {
    for (const htmlFile of htmlFiles) {
      const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
      const filePath = path.join(mockupsDir, htmlFile);
      const pngFile = htmlFile.replace(/\.html$/, '.png');
      const outPath = path.join(mockupsDir, pngFile);

      await page.goto(`file://${filePath}`, { waitUntil: 'networkidle' });

      // Wait for any Web Awesome or custom elements to be defined and hydrated
      await page.evaluate(async () => {
        const elements = Array.from(document.querySelectorAll('*')).filter((el) =>
          el.tagName.toLowerCase().startsWith('wa-')
        );
        await Promise.all(
          elements.map((el) => customElements.whenDefined(el.tagName.toLowerCase()))
        );
        await Promise.all(
          elements.map((el) => (el).updateComplete || Promise.resolve(true))
        );
      });

      await page.waitForTimeout(500);
      await page.screenshot({ path: outPath });
      console.log(`Rendered mockup: ${htmlFile} -> ${pngFile}`);
      await page.close();
    }
  } finally {
    await browser.close();
  }
}

renderAllMockups().catch((err) => {
  console.error('Failed to render mockups:', err);
  process.exit(1);
});
