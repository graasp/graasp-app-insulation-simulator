import { expect, test } from '@playwright/test';

import { HousePage } from './HousePage';

test('changing indoor temperature should update the informations', async ({
  page,
}) => {
  const housePage = new HousePage(page);
  const simulationInfoPage = housePage.simulationInfo;
  await housePage.goto();

  const newValue = await housePage.setIndoorTemperature(10);
  await expect(simulationInfoPage.indoorTemperatureInfo).toHaveText(newValue);
});

test('should not change outdoor temperature if not override', async ({
  page,
}) => {
  const housePage = new HousePage(page);
  const simulationInfoPage = housePage.simulationInfo;
  await housePage.goto();
  await housePage.setOverrideOutdoorTemperature(false);

  const value = await housePage.setOutdoorTemperature(10, {
    shouldHaveChanged: false,
  });
  await expect(simulationInfoPage.outdoorTemperatureInfo).toHaveText(value);
});

test('changing outdoor temperature should update the informations', async ({
  page,
}) => {
  const housePage = new HousePage(page);
  const simulationInfoPage = housePage.simulationInfo;
  await housePage.goto();
  await housePage.setOverrideOutdoorTemperature(true);

  const value = await housePage.setOutdoorTemperature(10, {
    shouldHaveChanged: true,
  });
  await expect(simulationInfoPage.outdoorTemperatureInfo).toHaveText(value);
});
