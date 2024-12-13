import { Locator, Page } from '@playwright/test';

import { changeSlider } from '../utils/SliderComponent';

const clickOnButton = async (button: Locator): Promise<void> => {
  await button.scrollIntoViewIfNeeded();
  await button.click();
};

export class SimulationControlPage {
  private readonly testId = 'simulation-control-dates';

  readonly page: Page;

  readonly dateSlider: Locator;

  readonly firstDate: Locator;

  readonly lastDate: Locator;

  constructor(page: Page) {
    this.page = page;
    this.dateSlider = this.page.getByTestId(`${this.testId}-slider`);
    this.firstDate = this.page.getByTestId(`${this.testId}-min`);
    this.lastDate = this.page.getByTestId(`${this.testId}-max`);
  }

  getControlButton(action: 'start' | 'pause'): Locator {
    return this.page.getByTestId(`simulation-control-button-${action}`);
  }

  getSpeedButton(speed: number): Locator {
    return this.page.getByTestId(`speed-button-x${speed}`);
  }

  async startSimulation(): Promise<void> {
    await clickOnButton(
      this.page.getByTestId('simulation-control-button-start'),
    );
  }

  async pauseSimulation(): Promise<void> {
    await clickOnButton(
      this.page.getByTestId('simulation-control-button-pause'),
    );
  }

  async moveDateSlider(percentage: number): Promise<void> {
    await changeSlider(this.page, this.dateSlider, percentage);
  }
}
