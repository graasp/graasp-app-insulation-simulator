import { Locator, Page, expect } from '@playwright/test';

import { WindowSizeType } from '../../src/types/window';

// Page Object for the window editor (modal)
export class WindowEditorPage {
  private readonly page: Page;

  private readonly closeButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.closeButton = this.page.getByRole('button', { name: 'Close' });
  }

  async getWindowSizeHelper(size: WindowSizeType): Promise<Locator> {
    return this.page.getByTestId(`window-size-helper-${size.toLowerCase()}`);
  }

  async selectWindowSize(
    newSize: WindowSizeType,
    currentSize: WindowSizeType = 'Medium',
  ): Promise<void> {
    await this.page.getByLabel(currentSize).click();
    await this.page.getByRole('option', { name: newSize }).click();

    await expect(
      this.page.getByRole('combobox', { name: 'Window Size' }),
    ).toHaveText(newSize);
  }

  async checkIsOpen(): Promise<void> {
    await expect(this.closeButton).toBeVisible();
  }

  async checkIsClosed(): Promise<void> {
    await expect(this.closeButton).not.toBeVisible();
  }

  async close(): Promise<void> {
    await this.closeButton.click();
  }
}
