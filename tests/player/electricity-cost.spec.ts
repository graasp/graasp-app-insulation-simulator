import { expect, test } from '@playwright/test';

import { HousePage } from './HousePage';

test('should change electricity cost successfully', async ({ page }) => {
  const housePage = new HousePage(page);
  await housePage.goto();
  await housePage.setElectricityCost('0.33');
});

test('should not accept text', async ({ page }) => {
  const housePage = new HousePage(page);
  await housePage.goto();
  await housePage.electricityCost.click();
  await housePage.electricityCost.pressSequentially('Not a number');
  await expect(housePage.electricityCost).toHaveValue('');
});

test('should be required', async ({ page }) => {
  const housePage = new HousePage(page);
  await housePage.goto();
  await housePage.electricityCost.click();
  await housePage.electricityCost.clear();
  await expect(housePage.electricityCost).toHaveValue('');

  await housePage.checkErrorIsVisible('electricity-cost', 'Required');
});

test('should not be negative', async ({ page }) => {
  const housePage = new HousePage(page);
  await housePage.goto();
  await housePage.setElectricityCost('-1');

  await housePage.checkErrorIsVisible('electricity-cost', 'Min');
});

test('should not exceed max', async ({ page }) => {
  const housePage = new HousePage(page);
  await housePage.goto();
  await housePage.setElectricityCost('5');

  await housePage.checkErrorIsVisible('electricity-cost', 'Max');
});
