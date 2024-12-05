import { expect, test } from 'playwright-test-coverage';

import { HousePage } from './HousePage';

test('clicking on start should run the simulation', async ({ page }) => {
  const housePage = new HousePage(page);
  const simulationInfoPage = housePage.simulationInfo;
  await housePage.goto();
  await housePage.startSimulation();

  // Wait for *any* change in the current date
  await page.waitForTimeout(1_000);

  await expect(housePage.getSimulationControlButton('pause')).toBeVisible();
  await housePage.pauseSimulation();

  const date = (await simulationInfoPage.dateInfo.textContent()) ?? '';
  const outdoorTemp =
    (await simulationInfoPage.outdoorTemperatureInfo.textContent()) ?? '';
  const heatLoss = (await simulationInfoPage.heatLossInfo.textContent()) ?? '';
  const totHeatLoss =
    (await simulationInfoPage.totHeatLossInfo.textContent()) ?? '';
  const totElectricityCost =
    (await simulationInfoPage.totElectricityCostInfo.textContent()) ?? '';

  await expect(housePage.getSimulationControlButton('start')).toBeVisible();
  await housePage.startSimulation();

  // Wait for *any* change in the current date
  await page.waitForTimeout(1_000);

  await expect(simulationInfoPage.dateInfo).not.toHaveText(date);
  await expect(simulationInfoPage.outdoorTemperatureInfo).not.toHaveText(
    outdoorTemp,
  );
  await expect(simulationInfoPage.heatLossInfo).not.toHaveText(heatLoss);
  await expect(simulationInfoPage.totHeatLossInfo).not.toHaveText(totHeatLoss);
  await expect(simulationInfoPage.totElectricityCostInfo).not.toHaveText(
    totElectricityCost,
  );
});
