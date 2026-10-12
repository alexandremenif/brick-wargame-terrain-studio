import fs from 'node:fs';
import { setWorldConstructor, World, Before, After } from '@cucumber/cucumber';
import type { IWorldOptions } from '@cucumber/cucumber';
import type { EngineDriver } from './driver.js';
import { InMemoryDriver } from './memory_driver.js';
import type { JsonRpcResponse, TerrainEngineService } from '@lego-wargame-terrain-studio/domain';

export type DriverFactory = () => EngineDriver;

export class StudioWorld extends World {
  private static readonly driverFactories = new Map<string, DriverFactory>([
    ['memory', () => new InMemoryDriver()]
  ]);

  public static registerDriver(type: string, factory: DriverFactory): void {
    StudioWorld.driverFactories.set(type, factory);
  }

  public driver: EngineDriver;
  public lastError: Error | null = null;

  // Protocol & Wire scenario context
  public jsonRpcService: TerrainEngineService | null = null;
  public lastJsonRpcResponse: any = null;
  public lastRequestId: string | number | null = null;
  public colorsList: any[] | null = null;
  public lastExportResult: { data: string } | null = null;
  public lastExportImageWidth: number = 0;
  public lastExportImageHeight: number = 0;
  public lastExportCanvasData: Uint8ClampedArray | null = null;

  // Persistence scenario context
  public tempDbPath: string | null = null;
  public db: any = null;
  public persistedId: string | null = null;

  // HTTP scenario context
  public httpServer: any = null;
  public lastHttpResponse: {
    statusCode: number;
    headers: Record<string, string | string[] | undefined>;
    body: string;
    json?: any;
  } | null = null;

  constructor(options: IWorldOptions) {
    super(options);
    const driverType = (this.parameters?.driver as string) || 'memory';
    const factory = StudioWorld.driverFactories.get(driverType);

    if (!factory) {
      throw new Error(
        `Unsupported driver type "${driverType}". Available registered drivers: [${Array.from(
          StudioWorld.driverFactories.keys()
        ).join(', ')}]`
      );
    }

    this.driver = factory();
  }
}

setWorldConstructor(StudioWorld);

Before(async function (this: StudioWorld) {
  this.lastError = null;
  this.lastJsonRpcResponse = null;
  this.lastRequestId = null;
  this.jsonRpcService = null;
  this.tempDbPath = null;
  this.db = null;
  this.persistedId = null;
  this.httpServer = null;
  this.lastHttpResponse = null;
  this.lastExportResult = null;
  this.lastExportImageWidth = 0;
  this.lastExportImageHeight = 0;
  this.lastExportCanvasData = null;
  await this.driver.start();
});

After(async function (this: StudioWorld) {
  if (this.db) {
    try {
      this.db.close();
    } catch (_) {
      // Ignored if already closed
    }
    this.db = null;
  }

  if (this.tempDbPath && fs.existsSync(this.tempDbPath)) {
    try {
      fs.unlinkSync(this.tempDbPath);
    } catch (_) {
      // Ignored if already deleted
    }
    this.tempDbPath = null;
  }

  if (this.httpServer) {
    await new Promise<void>((resolve) => {
      this.httpServer.close(() => resolve());
    });
    this.httpServer = null;
  }

  await this.driver.stop();
});
