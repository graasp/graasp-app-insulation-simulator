import test, { expect } from '@playwright/test';

import { HousePage } from './HousePage';

test('simulation duration should be disabled when simulation is running', async ({
  page,
}) => {
  const housePage = new HousePage(page);
  const { settings, control } = housePage;
  await housePage.goto();
  await settings.setSimulationDuration(25);
  await control.getControlButton('start').click();
  await expect(settings.simulationDuration).toBeDisabled();
});

test('changing duration should update the date in the slider', async ({
  page,
}) => {
  const housePage = new HousePage(page);
  const { settings, control } = housePage;
  await housePage.goto();

  const firstDate = await control.firstDate.textContent();
  const lastDate = await control.lastDate.textContent();

  await settings.setSimulationDuration(25);

  expect(await control.firstDate.textContent()).toBe(firstDate);
  expect(await control.lastDate.textContent()).not.toBe(lastDate);
});

test('changing duration should not reset the current day', async ({ page }) => {
  const housePage = new HousePage(page);
  const { settings, control, info } = housePage;
  await housePage.goto();

  await control.moveDateSlider(50);
  const currentDate = await info.dateInfo.textContent();
  const currentTotalHeatLoss = await info.totHeatLossInfo.textContent();

  await settings.setSimulationDuration(25);
  // check that changing the duration doesn't reset the simulation
  expect(await info.dateInfo.textContent()).toBe(currentDate);
  expect(await info.totHeatLossInfo.textContent()).toBe(currentTotalHeatLoss);

  await settings.setSimulationDuration(1);
  // check that changing the duration doesn't reset the simulation
  expect(await info.dateInfo.textContent()).toBe(currentDate);
  expect(await info.totHeatLossInfo.textContent()).toBe(currentTotalHeatLoss);
});

test('changing duration to a shorter period should set the current day to the end of the new duration', async ({
  page,
}) => {
  const housePage = new HousePage(page);
  const { settings, control, info } = housePage;
  await housePage.goto();

  await settings.setSimulationDuration(25);
  // Move to the end of the simulation.
  await control.moveDateSlider(100);
  const currentDate = await info.dateInfo.textContent();
  const currentTotalHeatLoss = await info.totHeatLossInfo.textContent();

  await settings.setSimulationDuration(1);

  // Check that the current date is the last day of the new, shorter duration.
  expect(await info.dateInfo.textContent()).not.toBe(currentDate);
  expect(await info.totHeatLossInfo.textContent()).not.toBe(
    currentTotalHeatLoss,
  );
  expect(await info.dateInfo.textContent()).toBe(
    await control.lastDate.textContent(),
  );
});
