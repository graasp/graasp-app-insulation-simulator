import { Page } from '@playwright/test';

import { SimulationControlPage } from './SimulationControlPage';
import { SimulationInfoPage } from './SimulationInfoPage';
import { SimulationSettingsPage } from './SimulationSettingsPage';

// Page Object for the house configuration page
export class HousePage {
  readonly page: Page;

  readonly info: SimulationInfoPage;

  readonly settings: SimulationSettingsPage;

  readonly control: SimulationControlPage;

  constructor(page: Page) {
    this.page = page;
    this.info = new SimulationInfoPage(this.page);
    this.settings = new SimulationSettingsPage(this.page);
    this.control = new SimulationControlPage(this.page);
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
    // wait to have loaded the simulation correctly
    await this.info.expectIsVisible();
    // try to mitigate flacky tests
    await this.page.waitForTimeout(50);
  }
}
