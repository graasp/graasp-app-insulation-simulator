import { expect, test } from 'playwright-test-coverage';

import { HousePage } from './HousePage';

test('clicking on start should run the simulation', async ({ page }) => {
  const housePage = new HousePage(page);
  const { info, control } = housePage;
  await housePage.goto();
  await control.startSimulation();

  // Wait for *any* change in the current date
  await page.waitForTimeout(1_000);

  await expect(control.getButton('pause')).toBeVisible();
  await control.pauseSimulation();

  const date = await info.dateInfo.textContent();
  const outdoorTemp = await info.outdoorTemperatureInfo.textContent();
  const heatLoss = await info.heatLossInfo.textContent();
  const totHeatLoss = await info.totHeatLossInfo.textContent();
  const totElectricityCost = await info.totElectricityCostInfo.textContent();

  expect(date).toBeDefined();
  await expect(control.getButton('start')).toBeVisible();
  await control.startSimulation();

  // Wait for *any* change in the current date
  await page.waitForTimeout(1_000);

  const newDate = await info.dateInfo.textContent();
  expect(newDate).toBeDefined();
  expect(new Date(newDate!).getTime()).toBeGreaterThan(
    new Date(date!).getTime(),
  );
  expect(await info.outdoorTemperatureInfo.textContent()).not.toBe(outdoorTemp);
  expect(await info.heatLossInfo.textContent()).not.toBe(heatLoss);
  expect(await info.totHeatLossInfo.textContent()).not.toBe(totHeatLoss);
  expect(await info.totElectricityCostInfo.textContent()).not.toBe(
    totElectricityCost,
  );
});

test('moving in the futur should work when the simulation is not runned', async ({
  page,
}) => {
  const housePage = new HousePage(page);
  const { info, control } = housePage;
  await housePage.goto();

  const outdoorTemp = await info.outdoorTemperatureInfo.textContent();
  const heatLoss = await info.heatLossInfo.textContent();
  const totHeatLoss = await info.totHeatLossInfo.textContent();
  const totElectricityCost = await info.totElectricityCostInfo.textContent();
  const date = await info.dateInfo.textContent();
  expect(date).toBeDefined();

  await control.moveDateSlider(50);

  const newDate = await info.dateInfo.textContent();
  expect(newDate).toBeDefined();
  expect(new Date(newDate!).getTime()).toBeGreaterThan(
    new Date(date!).getTime(),
  );
  expect(await info.outdoorTemperatureInfo.textContent()).not.toBe(outdoorTemp);
  expect(await info.heatLossInfo.textContent()).not.toBe(heatLoss);
  expect(await info.totHeatLossInfo.textContent()).not.toBe(totHeatLoss);
  expect(await info.totElectricityCostInfo.textContent()).not.toBe(
    totElectricityCost,
  );

  // the user should be able to resume the simulation
  await control.startSimulation();
  await page.waitForTimeout(1_000);
  await expect(control.getButton('pause')).toBeVisible();
  const finalDate = await info.dateInfo.textContent();
  expect(finalDate).toBeDefined();
  expect(new Date(finalDate!).getTime()).toBeGreaterThan(
    new Date(newDate!).getTime(),
  );
});

test('moving in the futur should pause the simulation when running', async ({
  page,
}) => {
  const housePage = new HousePage(page);
  const { info, control } = housePage;
  await housePage.goto();
  await control.startSimulation();
  // Wait for *any* change in the current date
  await page.waitForTimeout(1_000);
  await expect(control.getButton('pause')).toBeVisible();

  await control.moveDateSlider(50);

  const date = await info.dateInfo.textContent();
  expect(date).toBeDefined();
  await expect(control.getButton('start')).toBeVisible();

  // the user should be able to resume the simulation
  await control.startSimulation();
  await page.waitForTimeout(1_000);
  await expect(control.getButton('pause')).toBeVisible();
  const newDate = await info.dateInfo.textContent();
  expect(newDate).toBeDefined();
  expect(new Date(newDate!).getTime()).toBeGreaterThan(
    new Date(date!).getTime(),
  );
});

test('should move in the futur and in the past', async ({ page }) => {
  const housePage = new HousePage(page);
  const { info, control } = housePage;
  await housePage.goto();

  // move to the middle of the simulation
  await control.moveDateSlider(50);
  const date = await info.dateInfo.textContent();
  expect(date).toBeDefined();

  // run the simulation
  await control.startSimulation();
  // Wait for *any* change in the current date
  await page.waitForTimeout(1_000);
  await expect(control.getButton('pause')).toBeVisible();

  const newDate = await info.dateInfo.textContent();
  expect(newDate).toBeDefined();
  expect(new Date(newDate!).getTime()).toBeGreaterThan(
    new Date(date!).getTime(),
  );

  // move to the past
  await control.moveDateSlider(10);
  await expect(control.getButton('start')).toBeVisible();
  const dateInThePast = await info.dateInfo.textContent();
  expect(dateInThePast).toBeDefined();
  expect(new Date(dateInThePast!).getTime()).toBeLessThan(
    new Date(newDate!).getTime(),
  );

  // the user should be able to resume the simulation
  await control.startSimulation();
  await page.waitForTimeout(1_000);
  await expect(control.getButton('pause')).toBeVisible();
  const finalDate = await info.dateInfo.textContent();
  expect(finalDate).toBeDefined();
  expect(new Date(finalDate!).getTime()).toBeGreaterThan(
    new Date(dateInThePast!).getTime(),
  );
});
