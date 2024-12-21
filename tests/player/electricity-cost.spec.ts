import { expect, test } from '@playwright/test';

import { HousePage } from './HousePage';

test('changing the electricity cost should update the simulation', async ({
  page,
}) => {
  const housePage = new HousePage(page);
  const { info, settings } = housePage;
  await housePage.goto();
  // Check that the cost has been calculated to compare the real changes.
  await expect(info.totElectricityCostInfo).not.toHaveText('0 CHF');

  const totElectricityCost = await info.totElectricityCostInfo.textContent();
  await settings.setElectricityCost('0.88');

  expect(await info.totElectricityCostInfo.textContent()).not.toBe(
    totElectricityCost,
  );
});

test('should not accept text', async ({ page }) => {
  const housePage = new HousePage(page);
  const { info, settings } = housePage;
  await housePage.goto();
  await page.waitForTimeout(50);

  const electricityCost = await info.totElectricityCostInfo.textContent();
  await settings.electricityCost.click();
  await settings.electricityCost.pressSequentially('Not a number');

  await expect(settings.electricityCost).toHaveValue('');
  expect(await info.totElectricityCostInfo.textContent()).toBe(electricityCost);
});

test('should be required', async ({ page }) => {
  const housePage = new HousePage(page);
  const { info, settings } = housePage;
  await housePage.goto();

  const electricityCost = await info.totElectricityCostInfo.textContent();

  await settings.electricityCost.click();
  await settings.electricityCost.clear();
  await expect(settings.electricityCost).toHaveValue('');
  await settings.checkErrorIsVisible('electricity-cost', 'Required');
  expect(await info.totElectricityCostInfo.textContent()).toBe(electricityCost);
});

test('should not be negative', async ({ page }) => {
  const housePage = new HousePage(page);
  const { info, settings } = housePage;
  await housePage.goto();

  const electricityCost = await info.totElectricityCostInfo.textContent();

  await settings.setElectricityCost('-1');

  await settings.checkErrorIsVisible('electricity-cost', 'Min');
  expect(await info.totElectricityCostInfo.textContent()).toBe(electricityCost);
});

test('should not exceed max', async ({ page }) => {
  const housePage = new HousePage(page);
  const { info, settings } = housePage;
  await housePage.goto();

  const electricityCost = await info.totElectricityCostInfo.textContent();

  await settings.setElectricityCost('5');

  await settings.checkErrorIsVisible('electricity-cost', 'Max');
  expect(await info.totElectricityCostInfo.textContent()).toBe(electricityCost);
});
