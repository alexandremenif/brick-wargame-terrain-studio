import { setWorldConstructor, World, Before, After } from '@cucumber/cucumber';
import type { IWorldOptions } from '@cucumber/cucumber';
import type { EngineDriver } from './driver.js';
import { InMemoryDriver } from './memory_driver.js';

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
  await this.driver.start();
});

After(async function (this: StudioWorld) {
  await this.driver.stop();
});
