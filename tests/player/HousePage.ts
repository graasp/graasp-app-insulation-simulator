import { Locator, Page, expect } from '@playwright/test';

import { changeSlider } from '../utils/SliderComponent';
import { MaterialEditorPage } from './MaterialEditorPage';
import { WindowEditorPage } from './WindowEditorPage';

// Page Object for the house configuration page
export class HousePage {
  readonly page: Page;

  readonly electricityCost: Locator;

  readonly indoorTemperatureInfo: Locator;

  readonly outdoorTemperatureInfo: Locator;

  constructor(page: Page) {
    this.page = page;
    this.electricityCost = this.page.getByRole('spinbutton', {
      name: 'Electricity Cost',
    });
    this.indoorTemperatureInfo = this.page.getByTestId(
      'simulation-info-indoor-temperature',
    );
    this.outdoorTemperatureInfo = this.page.getByTestId(
      'simulation-info-outdoor-temperature',
    );
  }

  async goto(): Promise<void> {
    await this.page.goto('/');
  }

  private async updateSelect(
    selectLabel: string,
    selectOption: string,
  ): Promise<void> {
    await this.page.getByLabel(selectLabel).click();
    await this.page.getByRole('option', { name: selectOption }).click();
    await expect(
      this.page.getByRole('combobox', { name: selectLabel }),
    ).toHaveText(selectOption);
  }

  async selectWindowInsulation(newInsulation: string): Promise<void> {
    await this.updateSelect('Windows Insulation', newInsulation);
  }

  async selectWallInsulation(newInsulation: string): Promise<void> {
    await this.updateSelect('Wall Insulation', newInsulation);
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

  private async setTemperature(
    id: string,
    percentage: number,
    shouldChanged: boolean = true,
  ): Promise<string> {
    const slider = this.page.getByTestId(`${id}-temperature-slider`);
    const sliderLabel = this.page.getByTestId(`${id}-temperature-label`);
    const currValue = (await sliderLabel.textContent()) ?? '';

    await changeSlider(this.page, slider, percentage);

    if (shouldChanged) {
      await expect(sliderLabel).not.toHaveText(currValue);
    } else {
      await expect(sliderLabel).toHaveText(currValue);
    }

    return (await sliderLabel.textContent()) ?? '';
  }

  async setIndoorTemperature(percentage: number): Promise<string> {
    return this.setTemperature('indoor', percentage);
  }

  async selectNumberOfFloors(nthFloor: number): Promise<void> {
    const floorText = `${nthFloor} floor${nthFloor > 1 ? 's' : ''}`;
    await this.updateSelect('Number of floors', floorText);
  }

  async setOutdoorTemperature(
    percentage: number,
    { shouldHaveChanged }: { shouldHaveChanged: boolean },
  ): Promise<string> {
    return this.setTemperature('outdoor', percentage, shouldHaveChanged);
  }

  async setOverrideOutdoorTemperature(checked: boolean): Promise<void> {
    await this.page.getByLabel('Override Temperature').setChecked(checked);
  }

  async checkErrorIsVisible(
    label: string,
    type: 'Required' | 'Min' | 'Max',
  ): Promise<void> {
    const errorId = `error-${label.toLowerCase()}-${type.toLowerCase()}`;
    await expect(this.page.getByTestId(errorId)).toBeVisible();
  }
}
