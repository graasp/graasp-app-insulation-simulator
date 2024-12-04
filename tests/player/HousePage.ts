import { Page, expect } from '@playwright/test';

import { MaterialEditorPage } from './MaterialEditorPage';
import { WindowEditorPage } from './WindowEditorPage';

// Page Object for the house configuration page
export class HousePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
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
}
