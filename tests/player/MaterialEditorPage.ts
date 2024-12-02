import { Locator, Page, expect } from '@playwright/test';

// Page Object for the material editor (modal)
export class MaterialEditorPage {
  private readonly page: Page;

  readonly materialPrice: Locator;

  readonly materialThickness: Locator;

  constructor(page: Page) {
    this.page = page;
    this.materialPrice = this.page.getByLabel('Price');
    this.materialThickness = this.page.getByLabel('Thickness');
  }

  async selectTab(tabName: string): Promise<void> {
    await this.page.getByRole('tab', { name: tabName }).click();
  }

  async setMaterialPrice(price: string): Promise<void> {
    await this.materialPrice.fill(price);
    await expect(this.materialPrice).toHaveValue(price);
  }

  async setMaterialThickness(thickness: string): Promise<void> {
    await this.materialThickness.fill(thickness);
    await expect(this.materialThickness).toHaveValue(thickness);
  }

  async close(): Promise<void> {
    await this.page.getByRole('button', { name: 'Close' }).click();
  }

  async checkErrorIsVisible(
    label: string,
    type: 'Required' | 'Min' | 'Max',
  ): Promise<void> {
    const errorId = `error-${label.toLowerCase()}-${type.toLowerCase()}`;
    await expect(this.page.getByTestId(errorId)).toBeVisible();
  }
}
