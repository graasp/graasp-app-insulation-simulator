import { Locator, Page, expect } from '@playwright/test';

import { changeSlider } from '../utils/SliderComponent';
import { MaterialEditorPage } from './MaterialEditorPage';
import { WindowEditorPage } from './WindowEditorPage';

// Page Object for the house configuration page
export class HousePage {
  readonly page: Page;

  readonly electricityCost: Locator;

  readonly indoorTemperatureInfo: Locator;

  constructor(page: Page) {
    this.page = page;
    this.electricityCost = this.page.getByRole('spinbutton', {
      name: 'Electricity Cost',
    });
    this.indoorTemperatureInfo = this.page.getByTestId(
      'simulation-info-indoor-temperature',
    );
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  async selectWindowInsulation(newInsulation: string): Promise<void> {
    await this.page.getByLabel('Windows Insulation').click();
    await this.page.getByRole('option', { name: newInsulation }).click();
    await expect(
      this.page.getByRole('combobox', { name: 'Windows Insulation' }),
    ).toHaveText(newInsulation);
  }

  async selectWallInsulation(newInsulation: string): Promise<void> {
    await this.page.getByLabel('Wall Insulation').click();
    await this.page.getByRole('option', { name: newInsulation }).click();
    await expect(
      this.page.getByRole('combobox', { name: 'Wall Insulation' }),
    ).toHaveText(newInsulation);
  }

  async openMaterialEditor(): Promise<MaterialEditorPage> {
    const button = this.page.getByLabel('House').getByRole('button').first();
    await button.click();

    return new MaterialEditorPage(this.page);
  }

  async openWindowEditor(): Promise<WindowEditorPage> {
    const button = this.page.getByLabel('House').getByRole('button').nth(1);
    await button.click();

    return new WindowEditorPage(this.page);
  }

  async setElectricityCost(newElectricityCost: string): Promise<void> {
    await this.electricityCost.click();
    await this.electricityCost.fill(newElectricityCost);
    await expect(this.electricityCost).toHaveValue(newElectricityCost);
  }

  async setIndoorTemperature(percentage: number): Promise<string> {
    const slider = this.page.getByTestId('indoor-temperature-slider');
    const sliderLabel = this.page.getByTestId('indoor-temperature-label');
    const currValue = (await sliderLabel.textContent()) ?? '';

    await changeSlider(this.page, slider, percentage);
    await expect(sliderLabel).not.toHaveText(currValue);

    return (await sliderLabel.textContent()) ?? '';
  }

  async checkErrorIsVisible(
    label: string,
    type: 'Required' | 'Min' | 'Max',
  ): Promise<void> {
    const errorId = `error-${label.toLowerCase()}-${type.toLowerCase()}`;
    await expect(this.page.getByTestId(errorId)).toBeVisible();
  }
}
