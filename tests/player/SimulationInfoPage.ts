import { Locator, Page } from '@playwright/test';

export class SimulationInfoPage {
  readonly dateInfo: Locator;

  readonly outdoorTemperatureInfo: Locator;

  readonly indoorTemperatureInfo: Locator;

  readonly heatLossInfo: Locator;

  readonly totHeatLossInfo: Locator;

  readonly totElectricityCostInfo: Locator;

  constructor(private readonly page: Page) {
    this.dateInfo = this.page.getByTestId('simulation-info-date');
    this.outdoorTemperatureInfo = this.page.getByTestId(
      'simulation-info-outdoor-temperature',
    );
    this.indoorTemperatureInfo = this.page.getByTestId(
      'simulation-info-indoor-temperature',
    );
    this.heatLossInfo = this.page.getByTestId('simulation-info-heatloss');
    this.totHeatLossInfo = this.page.getByTestId(
      'simulation-info-tot-heatloss',
    );
    this.totElectricityCostInfo = this.page.getByTestId(
      'simulation-info-tot-electricity-cost',
    );
  }
}
