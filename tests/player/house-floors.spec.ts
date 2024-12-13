import { expect, test } from 'playwright-test-coverage';

import { HousePage } from './HousePage';

test('changing the number of floors should change the simulation info', async ({
  page,
}) => {
  const housePage = new HousePage(page);
  const { info, settings } = housePage;
  const { totElectricityCostInfo, totHeatLossInfo, heatLossInfo } = info;

  await housePage.goto();
  // Check that the heat loss has been calculated to compare the real changes between 1 to 2 floors.
  await expect(heatLossInfo).not.toHaveText('0 Watt');

  const heatLoss = await heatLossInfo.textContent();
  const totHeatLoss = await totHeatLossInfo.textContent();
  const totElectricityCost = await totElectricityCostInfo.textContent();

  await settings.selectNumberOfFloors(2);

  expect(await heatLossInfo.textContent()).not.toBe(heatLoss);
  expect(await totHeatLossInfo.textContent()).not.toBe(totHeatLoss);
  expect(await totElectricityCostInfo.textContent()).not.toBe(
    totElectricityCost,
  );
});
