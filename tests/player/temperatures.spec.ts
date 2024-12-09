import { expect, test } from '@playwright/test';

import { HousePage } from './HousePage';

test('changing indoor temperature should update the informations', async ({
  page,
}) => {
  const housePage = new HousePage(page);
  const { info, settings } = housePage;
  const {
    indoorTemperatureInfo,
    heatLossInfo,
    totHeatLossInfo,
    totElectricityCostInfo,
  } = info;
  await housePage.goto();

  const heatLoss = await heatLossInfo.textContent();
  const totHeatLoss = await totHeatLossInfo.textContent();
  const totElectricityCost = await totElectricityCostInfo.textContent();

  const newValue = await settings.setIndoorTemperature(10);
  await expect(indoorTemperatureInfo).toHaveText(newValue);
  expect(await heatLossInfo.textContent()).not.toBe(heatLoss);
  expect(await totHeatLossInfo.textContent()).not.toBe(totHeatLoss);
  expect(await totElectricityCostInfo.textContent()).not.toBe(
    totElectricityCost,
  );
});

test('should not change outdoor temperature if not override', async ({
  page,
}) => {
  const housePage = new HousePage(page);
  const { info, settings } = housePage;
  const {
    outdoorTemperatureInfo,
    heatLossInfo,
    totHeatLossInfo,
    totElectricityCostInfo,
  } = info;
  await housePage.goto();
  await settings.setOverrideOutdoorTemperature(false);

  const heatLoss = await heatLossInfo.textContent();
  const totHeatLoss = await totHeatLossInfo.textContent();
  const totElectricityCost = await totElectricityCostInfo.textContent();

  const value = await settings.setOutdoorTemperature(10, {
    shouldHaveChanged: false,
  });
  await expect(outdoorTemperatureInfo).toHaveText(value);
  expect(await heatLossInfo.textContent()).toBe(heatLoss);
  expect(await totHeatLossInfo.textContent()).toBe(totHeatLoss);
  expect(await totElectricityCostInfo.textContent()).toBe(totElectricityCost);
});

test('changing outdoor temperature should update the informations', async ({
  page,
}) => {
  const housePage = new HousePage(page);
  const { info, settings } = housePage;
  const {
    outdoorTemperatureInfo,
    heatLossInfo,
    totHeatLossInfo,
    totElectricityCostInfo,
  } = info;
  await housePage.goto();
  await settings.setOverrideOutdoorTemperature(true);

  const heatLoss = await heatLossInfo.textContent();
  const totHeatLoss = await totHeatLossInfo.textContent();
  const totElectricityCost = await totElectricityCostInfo.textContent();

  const value = await settings.setOutdoorTemperature(10, {
    shouldHaveChanged: true,
  });
  await expect(outdoorTemperatureInfo).toHaveText(value);
  expect(await heatLossInfo.textContent()).not.toBe(heatLoss);
  expect(await totHeatLossInfo.textContent()).not.toBe(totHeatLoss);
  expect(await totElectricityCostInfo.textContent()).not.toBe(
    totElectricityCost,
  );
});
