import { setWorldConstructor, World } from '@cucumber/cucumber';
import type { IWorldOptions } from '@cucumber/cucumber';
import type { Browser, Page } from '@playwright/test';

export class PlaywrightWorld extends World {
  public browser: Browser | null = null;
  public page: Page | null = null;
  public activeTool: string = 'Select';
  public selectedColor: string = 'None';

  constructor(options: IWorldOptions) {
    super(options);
  }
}

setWorldConstructor(PlaywrightWorld);
