import { setWorldConstructor, World } from '@cucumber/cucumber';
import type { IWorldOptions } from '@cucumber/cucumber';
import type { Asset, BoundingBox, BrickColor, CellData } from '@lego-wargame-terrain-studio/domain';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { chromium, type Browser, type Page } from 'playwright';

let sharedServer: http.Server | null = null;
let sharedServerPort: number = 5180;
let sharedBrowser: Browser | null = null;

const distDir = path.resolve(process.cwd(), 'packages/ui/dist');
const mimeTypes: Record<string, string> = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
};

export async function ensureSharedServer(): Promise<number> {
  if (sharedServer) return sharedServerPort;

  return new Promise((resolve, reject) => {
    sharedServer = http.createServer((req, res) => {
      let reqPath = req.url?.split('?')[0] || '/';
      if (reqPath === '/') reqPath = '/index.html';
      const filePath = path.join(distDir, reqPath);
      if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath);
        res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
        fs.createReadStream(filePath).pipe(res);
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        fs.createReadStream(path.join(distDir, 'index.html')).pipe(res);
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
    cells: [],
  };

  public colors: BrickColor[] = [];
  public deletedAssetId: string | null = null;
  public lastExportRequest: any = null;
  public initiatedDownloads: Array<{ filename: string; url?: string }> = [];

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

    this.asset = {
      id: 'asset-test-1',
      name: assetName,
      width,
      height,
      paintedCellsCount: 0,
      cells: [],
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
                paintedCellsCount: this.asset.cells.length,
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
          this.asset = {
            ...this.asset,
            width: p.width,
            height: p.height,
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
        const newAsset: Asset = {
          id: 'asset-test-2',
          name: p.name || 'Modular Outpost',
          width: p.width || 32,
          height: p.height || 32,
          paintedCellsCount: 0,
          cells: [],
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

          const cellMap = new Map<string, number>();
          for (const c of this.asset.cells) {
            cellMap.set(`${c.x},${c.y}`, c.colorId);
          }

          for (let cx = minX; cx <= maxX; cx++) {
            for (let cy = minY; cy <= maxY; cy++) {
              const key = `${cx},${cy}`;
              if (colorId === null) {
                cellMap.delete(key);
              } else {
                cellMap.set(key, colorId);
              }
            }
          }

          const updatedCells: CellData[] = [];
          for (const [key, cid] of cellMap.entries()) {
            const [cx, cy] = key.split(',').map(Number);
            updatedCells.push({ x: cx, y: cy, colorId: cid });
          }

          this.asset = {
            ...this.asset,
            paintedCellsCount: updatedCells.length,
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
    return this.page;
  }

  public getPage(): Page {
    if (!this.page) {
      throw new Error('Playwright page is not initialized. Call initLiveApp first.');
    }
    return this.page;
  }
}

setWorldConstructor(PlaywrightWorld);
