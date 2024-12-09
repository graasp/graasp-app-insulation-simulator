import { Locator, Page, expect } from '@playwright/test';

import { changeSlider } from '../utils/SliderComponent';
import { MaterialEditorPage } from './MaterialEditorPage';
import { SimulationInfoPage } from './SimulationInfoPage';
import { WindowEditorPage } from './WindowEditorPage';

// Page Object for the house configuration page
export class HousePage {
  readonly simulationInfo: SimulationInfoPage;

  readonly electricityCost: Locator;

  readonly simulationDuration: Locator;

  constructor(readonly page: Page) {
    this.simulationInfo = new SimulationInfoPage(this.page);
    this.electricityCost = this.page.getByRole('spinbutton', {
      name: 'Electricity Cost',
    });
    this.simulationDuration = this.page.getByLabel('Duration of Simulation');
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
    const overrideBtn = this.page.getByLabel('Override Temperature');
    await overrideBtn.scrollIntoViewIfNeeded();
    await overrideBtn.setChecked(checked);
  }

  async setSimulationDuration(duration: number): Promise<void> {
    await this.updateSelect(
      'Duration of Simulation',
      `${duration} year${duration > 1 ? 's' : ''}`,
    );
  }

  getSimulationControlButton(action: 'start' | 'pause'): Locator {
    return this.page.getByTestId(`simulation-control-button-${action}`);
  }

  // eslint-disable-next-line class-methods-use-this
  private async clickOnButton(button: Locator): Promise<void> {
    await button.scrollIntoViewIfNeeded();
    await button.click();
  }

  async startSimulation(): Promise<void> {
    await this.clickOnButton(
      this.page.getByTestId('simulation-control-button-start'),
    );
  }

  async pauseSimulation(): Promise<void> {
    await this.clickOnButton(
      this.page.getByTestId('simulation-control-button-pause'),
    );
  }

  async checkErrorIsVisible(
    label: string,
    type: 'Required' | 'Min' | 'Max',
  ): Promise<void> {
    const errorId = `error-${label.toLowerCase()}-${type.toLowerCase()}`;
    await expect(this.page.getByTestId(errorId)).toBeVisible();
  }
}
