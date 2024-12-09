import { expect, test } from 'playwright-test-coverage';

import { HousePage } from './HousePage';

test('should change the window insulation', async ({ page }) => {
  const housePage = new HousePage(page);
  const { info, settings } = housePage;
  const { heatLossInfo, totHeatLossInfo, totElectricityCostInfo } = info;
  await housePage.goto();

  const heatLoss = await heatLossInfo.textContent();
  const totHeatLoss = await totHeatLossInfo.textContent();
  const totElectricityCost = await totElectricityCostInfo.textContent();

  await settings.selectWindowInsulation('Triple Pane');

  // expect that the simulation recomputed on changes
  expect(await heatLossInfo.textContent()).not.toBe(heatLoss);
  expect(await totHeatLossInfo.textContent()).not.toBe(totHeatLoss);
  expect(await totElectricityCostInfo.textContent()).not.toBe(
    totElectricityCost,
  );
});

test('changing window size should update the size helper label', async ({
  page,
}) => {
  const housePage = new HousePage(page);
  const { info, settings } = housePage;
  const { heatLossInfo, totHeatLossInfo, totElectricityCostInfo } = info;
  await housePage.goto();
  await settings.selectWindowInsulation('Single Pane');

  const heatLoss = await heatLossInfo.textContent();
  const totHeatLoss = await totHeatLossInfo.textContent();
  const totElectricityCost = await totElectricityCostInfo.textContent();

  const windowEditorPage = await settings.openWindowEditor();
  await expect(
    await windowEditorPage.getWindowSizeHelper('Medium'),
  ).toBeVisible();
  await windowEditorPage.selectWindowSize('Small');

  await expect(
    await windowEditorPage.getWindowSizeHelper('Medium'),
  ).not.toBeVisible();
  await expect(
    await windowEditorPage.getWindowSizeHelper('Small'),
  ).toBeVisible();
  await windowEditorPage.close();

  // expect that the simulation recomputed on changes
  expect(await heatLossInfo.textContent()).not.toBe(heatLoss);
  expect(await totHeatLossInfo.textContent()).not.toBe(totHeatLoss);
  expect(await totElectricityCostInfo.textContent()).not.toBe(
    totElectricityCost,
  );
});

test('close button should close the modal', async ({ page }) => {
  const housePage = new HousePage(page);
  const { settings } = housePage;
  await housePage.goto();

  const windowEditorPage = await settings.openWindowEditor();
  await windowEditorPage.checkIsOpen();
  await windowEditorPage.close();
  await windowEditorPage.checkIsClosed();
});
