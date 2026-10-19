import { setWorldConstructor, World } from '@cucumber/cucumber';
import type { IWorldOptions } from '@cucumber/cucumber';
import type { Asset, BoundingBox, BrickColor } from '@lego-wargame-terrain-studio/domain';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { chromium, type Browser, type Page } from 'playwright';

let sharedServer: http.Server | null = null;
let sharedServerPort: number = 5180;
let sharedBrowser: Browser | null = null;

import { waitForWebAwesome, assertMatchesMockup } from './mockup_parity.js';
export { waitForWebAwesome, assertMatchesMockup };

function createEmptyGrid(width: number, height: number): number[][] {
  return Array.from({ length: height }, () => Array(width).fill(0));
}

function resizeGrid(oldCells: number[][], newWidth: number, newHeight: number): { cells: number[][]; paintedCellsCount: number } {
  let paintedCellsCount = 0;
  const cells = Array.from({ length: newHeight }, (_, y) =>
    Array.from({ length: newWidth }, (_, x) => {
      const val = oldCells[y]?.[x] ?? 0;
      if (val > 0) paintedCellsCount++;
      return val;
    })
  );
  return { cells, paintedCellsCount };
}

const rootDir = process.cwd();
const distDir = path.resolve(rootDir, 'packages/ui/dist');
const mimeTypes: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.json': 'application/json',
  '.png': 'image/png',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

export async function ensureSharedServer(): Promise<number> {
  if (sharedServer) return sharedServerPort;

  return new Promise((resolve, reject) => {
    sharedServer = http.createServer((req, res) => {
      let reqPath = req.url?.split('?')[0] || '/';
      if (reqPath === '/') reqPath = '/index.html';

      let filePath: string;
      if (
        reqPath.startsWith('/specs/') ||
        reqPath.startsWith('/node_modules/') ||
        reqPath.startsWith('/packages/')
      ) {
        filePath = path.join(rootDir, reqPath);
      } else {
        filePath = path.join(distDir, reqPath);
      }

      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath);
        res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
        fs.createReadStream(filePath).pipe(res);
      } else if (!reqPath.startsWith('/specs/') && !reqPath.startsWith('/node_modules/')) {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        fs.createReadStream(path.join(distDir, 'index.html')).pipe(res);
      } else {
        res.writeHead(404);
        res.end();
      }
    });

    sharedServer.listen(sharedServerPort, () => {
      resolve(sharedServerPort);
    });
    sharedServer.on('error', reject);
  });
}

export async function getSharedBrowser(): Promise<Browser> {
  if (!sharedBrowser) {
    sharedBrowser = await chromium.launch({ headless: true });
  }
  return sharedBrowser;
}

export async function closeSharedBrowser(): Promise<void> {
  if (sharedBrowser) {
    await sharedBrowser.close();
    sharedBrowser = null;
  }
  if (sharedServer) {
    await new Promise<void>((resolve) => {
      sharedServer?.close(() => resolve());
      sharedServer = null;
    });
  }
}

export class PlaywrightWorld extends World {
  public page: Page | null = null;

  public asset: Asset = {
    id: 'asset-test-1',
    name: 'Modular Outpost',
    width: 32,
    height: 32,
    paintedCellsCount: 0,
    cells: createEmptyGrid(32, 32),
  };

  public colors: BrickColor[] = [];
  public deletedAssetId: string | null = null;
  public lastExportRequest: any = null;
  public initiatedDownloads: Array<{ filename: string; url?: string }> = [];

  public consoleErrors: string[] = [];

  constructor(options: IWorldOptions) {
    super(options);
    this.loadColorsFromCsv();
  }

  private loadColorsFromCsv(): void {
    const candidatePaths = [
      path.resolve(process.cwd(), 'specs/domain/colors.csv'),
      path.resolve(process.cwd(), '../../specs/domain/colors.csv')
    ];
    const csvPath = candidatePaths.find(p => fs.existsSync(p));
    if (csvPath) {
      const content = fs.readFileSync(csvPath, 'utf-8');
      const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);
      const [, ...rows] = lines;
      this.colors = rows.map(r => {
        const [idStr, name, hex] = r.split(',');
        return {
          id: parseInt(idStr.trim(), 10),
          name: name.trim(),
          hex: hex.trim(),
        };
      });
    }
  }

  public async initLiveApp(assetName: string, width: number, height: number, existingStorage?: Record<string, string>): Promise<Page> {
    await ensureSharedServer();
    const browser = await getSharedBrowser();
    if (!this.page) {
      this.page = await browser.newPage({
        viewport: { width: 1280, height: 800 }
      });
    }

    this.consoleErrors = [];
    this.page.on('console', (msg) => {
      if (msg.type() === 'error') {
        this.consoleErrors.push(msg.text());
      }
    });
    this.page.on('pageerror', (err) => {
      this.consoleErrors.push(err.message);
    });

    this.asset = {
      id: 'asset-test-1',
      name: assetName,
      width,
      height,
      paintedCellsCount: 0,
      cells: createEmptyGrid(width, height),
    };
    this.deletedAssetId = null;
    this.lastExportRequest = null;
    this.initiatedDownloads = [];

    // Track browser downloads
    this.page.on('download', (download) => {
      this.initiatedDownloads.push({
        filename: download.suggestedFilename(),
        url: download.url(),
      });
    });

    // Also observe programmatic anchor downloads
    await this.page.addInitScript(() => {
      const origClick = HTMLAnchorElement.prototype.click;
      HTMLAnchorElement.prototype.click = function () {
        if (this.download) {
          (window as any).__lastDownload = {
            filename: this.download,
            href: this.href,
          };
        }
        return origClick.apply(this, arguments as any);
      };
    });

    // Route RPC requests through local test world state
    await this.page.route('**/rpc', async (route) => {
      const postData = JSON.parse(route.request().postData() || '{}');
      const { method, id, params } = postData;

      if (method === 'listColors') {
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            jsonrpc: '2.0',
            id,
            result: { colors: this.colors },
          }),
        });
      }

      if (method === 'listAssets') {
        const assets = this.asset
          ? [
              {
                id: this.asset.id,
                name: this.asset.name,
                width: this.asset.width,
                height: this.asset.height,
                paintedCellsCount: this.asset.paintedCellsCount,
              },
            ]
          : [];
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            jsonrpc: '2.0',
            id,
            result: { assets },
          }),
        });
      }

      if (method === 'getAsset') {
        if (!this.asset) {
          return route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              jsonrpc: '2.0',
              id,
              error: { code: -32000, message: 'Asset not found' },
            }),
          });
        }
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            jsonrpc: '2.0',
            id,
            result: { asset: this.asset },
          }),
        });
      }

      if (method === 'updateAsset') {
        const p = params[0];
        if (this.asset) {
          const newName = p.name ?? this.asset.name;
          const newWidth = p.width ?? this.asset.width;
          const newHeight = p.height ?? this.asset.height;
          const { cells, paintedCellsCount } = resizeGrid(this.asset.cells, newWidth, newHeight);
          this.asset = {
            ...this.asset,
            name: newName,
            width: newWidth,
            height: newHeight,
            paintedCellsCount,
            cells,
          };
        }
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            jsonrpc: '2.0',
            id,
            result: { asset: this.asset },
          }),
        });
      }

      if (method === 'createAsset') {
        const p = params[0];
        const w = p.width || 32;
        const h = p.height || 32;
        const newAsset: Asset = {
          id: 'asset-test-2',
          name: p.name || 'Modular Outpost',
          width: w,
          height: h,
          paintedCellsCount: 0,
          cells: createEmptyGrid(w, h),
        };
        this.asset = newAsset;
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            jsonrpc: '2.0',
            id,
            result: { asset: newAsset },
          }),
        });
      }

      if (method === 'deleteAsset') {
        if (this.asset) {
          this.deletedAssetId = this.asset.id;
          this.asset = null as any;
        }
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            jsonrpc: '2.0',
            id,
            result: { success: true },
          }),
        });
      }

      if (method === 'paintArea') {
        const { bbox, colorId } = params[0];
        if (this.asset) {
          const minX = Math.max(0, bbox.x);
          const minY = Math.max(0, bbox.y);
          const maxX = Math.min(this.asset.width - 1, bbox.x + bbox.width - 1);
          const maxY = Math.min(this.asset.height - 1, bbox.y + bbox.height - 1);

          const updatedCells = this.asset.cells.map((row) => [...row]);
          for (let cy = minY; cy <= maxY; cy++) {
            for (let cx = minX; cx <= maxX; cx++) {
              updatedCells[cy][cx] = colorId;
            }
          }

          let paintedCellsCount = 0;
          for (const row of updatedCells) {
            for (const val of row) {
              if (val > 0) paintedCellsCount++;
            }
          }

          this.asset = {
            ...this.asset,
            paintedCellsCount,
            cells: updatedCells,
          };
        }

        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            jsonrpc: '2.0',
            id,
            result: { success: true },
          }),
        });
      }

      if (method === 'exportImage') {
        const p = params[0];
        this.lastExportRequest = p;
        // 1x1 transparent PNG base64 for dummy response
        const dummyPngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
        return route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            jsonrpc: '2.0',
            id,
            result: { data: dummyPngBase64 },
          }),
        });
      }

      return route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          jsonrpc: '2.0',
          id,
          result: {},
        }),
      });
    });

    await this.page.goto(`http://localhost:${sharedServerPort}`);
    await this.page.waitForSelector('[data-testid="header-asset-name"]');
    await waitForWebAwesome(this.page);
    return this.page;
  }

  public getPage(): Page {
    if (!this.page) {
      throw new Error('Playwright page is not initialized. Call initLiveApp first.');
    }
    return this.page;
  }

  public getServerPort(): number {
    return sharedServerPort;
  }

  public async getBrowser(): Promise<Browser> {
    return await getSharedBrowser();
  }
}

setWorldConstructor(PlaywrightWorld);
