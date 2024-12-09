import { expect, test } from 'playwright-test-coverage';

import { HousePage } from './HousePage';

test('should change the wall insulation', async ({ page }) => {
  const housePage = new HousePage(page);
  const { info, settings } = housePage;
  const { heatLossInfo, totHeatLossInfo, totElectricityCostInfo } = info;
  await housePage.goto();

  const heatLoss = await heatLossInfo.textContent();
  const totHeatLoss = await totHeatLossInfo.textContent();
  const totElectricityCost = await totElectricityCostInfo.textContent();

  await settings.selectWallInsulation('Fiberglass');

  // expect that the simulation recomputed on changes
  expect(await heatLossInfo.textContent()).not.toBe(heatLoss);
  expect(await totHeatLossInfo.textContent()).not.toBe(totHeatLoss);
  expect(await totElectricityCostInfo.textContent()).not.toBe(
    totElectricityCost,
  );
});

test('changing the wall insulation should recompute the whole simulation and not only the current day', async ({
  page,
}) => {
  const housePage = new HousePage(page);
  const { info, settings, control } = housePage;
  const { heatLossInfo, totHeatLossInfo, totElectricityCostInfo } = info;
  await housePage.goto();

  // Go to the end of the simulation and check the validity of the informations.
  await control.moveDateSlider(100);
  expect(await heatLossInfo.textContent()).toBe('11.9 KiloWatt');
  expect(await totHeatLossInfo.textContent()).toBe('3 MegaWatt');
  expect(await totElectricityCostInfo.textContent()).toBe('651 CHF');

  // Go back to the middle of the simulation and change the insulation
  await control.moveDateSlider(50);
  await settings.selectWallInsulation('Fiberglass');
  // We have to wait otherwise the test continue before the re-render.
  await page.waitForTimeout(1_000);
  // Then go to the end of the simulation and check that the informations are different.
  await control.moveDateSlider(100);

  expect(await heatLossInfo.textContent()).not.toBe('11.9 KiloWatt');
  expect(await totHeatLossInfo.textContent()).not.toBe('3 MegaWatt');
  expect(await totElectricityCostInfo.textContent()).not.toBe('651 CHF');

  // Now if we change the insulation by Aerogel at the end of the simulation,
  // it should have the same effect as having defined the Aerogle at the beginning of the simulation.
  // When we update a parameter, it recompute the whole simulation with it.
  await settings.selectWallInsulation('Aerogel');
  await page.waitForTimeout(1_000);
  expect(await heatLossInfo.textContent()).toBe('11.9 KiloWatt');
  expect(await totHeatLossInfo.textContent()).toBe('3 MegaWatt');
  expect(await totElectricityCostInfo.textContent()).toBe('651 CHF');
});

test('should only update the aerogel material', async ({ page }) => {
  const housePage = new HousePage(page);
  const { info, settings } = housePage;
  const { heatLossInfo, totHeatLossInfo, totElectricityCostInfo } = info;
  await housePage.goto();

  const heatLoss = await heatLossInfo.textContent();
  const totHeatLoss = await totHeatLossInfo.textContent();
  const totElectricityCost = await totElectricityCostInfo.textContent();

  let materialEditor = await settings.openMaterialEditor();
  await materialEditor.selectTab('Aerogel');
  await materialEditor.setMaterialPrice('100');
  await materialEditor.setMaterialThickness('1');

  // expect Brick haven't been changed
  await materialEditor.selectTab('Brick');

  await expect(materialEditor.materialPrice).not.toHaveValue('100');
  await expect(materialEditor.materialThickness).not.toHaveValue('1');

  await materialEditor.close();
  materialEditor = await settings.openMaterialEditor();
  await materialEditor.selectTab('Aerogel');

  // expect Price and Thickness or Aergoel have not been reset
  await expect(materialEditor.materialPrice).toHaveValue('100');
  await expect(materialEditor.materialThickness).toHaveValue('1');
  await materialEditor.close();

  // expect that the simulation recomputed on changes
  expect(await heatLossInfo.textContent()).not.toBe(heatLoss);
  expect(await totHeatLossInfo.textContent()).not.toBe(totHeatLoss);
  expect(await totElectricityCostInfo.textContent()).not.toBe(
    totElectricityCost,
  );
});

test('should update all the materials without reset', async ({ page }) => {
  const housePage = new HousePage(page);
  const { settings } = housePage;
  await housePage.goto();

  const materialEditor = await settings.openMaterialEditor();
  await materialEditor.setMaterialPrice('10');
  await materialEditor.setMaterialThickness('50');

  await materialEditor.selectTab('Aerogel');
  await materialEditor.setMaterialPrice('100');
  await materialEditor.setMaterialThickness('1');

  await materialEditor.selectTab('Brick');
  // expect Price and Thickness have not been reset
  await expect(materialEditor.materialPrice).toHaveValue('10');
  await expect(materialEditor.materialThickness).toHaveValue('50');

  await materialEditor.selectTab('Aerogel');
  // expect Price and Thickness have not been reset
  await expect(materialEditor.materialPrice).toHaveValue('100');
  await expect(materialEditor.materialThickness).toHaveValue('1');
});

test('price should accept numbers only', async ({ page }) => {
  const housePage = new HousePage(page);
  const { settings } = housePage;
  await housePage.goto();

  const materialEditor = await settings.openMaterialEditor();
  await materialEditor.selectTab('Aerogel');
  await materialEditor.materialPrice.click();
  await materialEditor.materialPrice.pressSequentially('Not a number');
  await expect(materialEditor.materialPrice).toHaveValue('');
});

test('price should not be empty', async ({ page }) => {
  const housePage = new HousePage(page);
  const { settings } = housePage;
  await housePage.goto();

  const materialEditor = await settings.openMaterialEditor();
  await materialEditor.selectTab('Aerogel');
  await materialEditor.setMaterialPrice('150');
  await materialEditor.materialPrice.fill('');

  await materialEditor.checkErrorIsVisible('price', 'Required');

  await materialEditor.selectTab('Brick');
  await materialEditor.selectTab('Aerogel');
  await expect(materialEditor.materialPrice).toHaveValue('150');
});

test('price should not be negative', async ({ page }) => {
  const housePage = new HousePage(page);
  const { settings } = housePage;
  await housePage.goto();

  const materialEditor = await settings.openMaterialEditor();
  await materialEditor.selectTab('Aerogel');
  await materialEditor.setMaterialPrice('150');
  await materialEditor.setMaterialPrice('-1');

  await materialEditor.checkErrorIsVisible('price', 'Min');

  await materialEditor.selectTab('Brick');
  await materialEditor.selectTab('Aerogel');
  await expect(materialEditor.materialPrice).toHaveValue('150');
});

test('price should not exceed max value', async ({ page }) => {
  const housePage = new HousePage(page);
  const { settings } = housePage;
  await housePage.goto();

  const materialEditor = await settings.openMaterialEditor();
  await materialEditor.selectTab('Aerogel');
  await materialEditor.setMaterialPrice('150');
  await materialEditor.setMaterialPrice('1000000000');

  await materialEditor.checkErrorIsVisible('price', 'Max');

  await materialEditor.selectTab('Brick');
  await materialEditor.selectTab('Aerogel');
  await expect(materialEditor.materialPrice).toHaveValue('150');
});

test('thickness should accept numbers only', async ({ page }) => {
  const housePage = new HousePage(page);
  const { info, settings } = housePage;
  const { heatLossInfo, totHeatLossInfo, totElectricityCostInfo } = info;
  await housePage.goto();

  const heatLoss = await heatLossInfo.textContent();
  const totHeatLoss = await totHeatLossInfo.textContent();
  const totElectricityCost = await totElectricityCostInfo.textContent();

  const materialEditor = await settings.openMaterialEditor();
  await materialEditor.selectTab('Aerogel');
  await materialEditor.materialThickness.click();
  await materialEditor.materialThickness.pressSequentially('Not a number');
  await expect(materialEditor.materialThickness).toHaveValue('');
  await materialEditor.close();

  // expect that the simulation didn't recomputed
  expect(await heatLossInfo.textContent()).toBe(heatLoss);
  expect(await totHeatLossInfo.textContent()).toBe(totHeatLoss);
  expect(await totElectricityCostInfo.textContent()).toBe(totElectricityCost);
});

test('thickness should not be empty', async ({ page }) => {
  const housePage = new HousePage(page);
  const { info, settings } = housePage;
  const { heatLossInfo, totHeatLossInfo, totElectricityCostInfo } = info;
  await housePage.goto();

  let materialEditor = await settings.openMaterialEditor();
  await materialEditor.selectTab('Aerogel');
  await materialEditor.setMaterialThickness('25');
  await materialEditor.close();

  const heatLoss = await heatLossInfo.textContent();
  const totHeatLoss = await totHeatLossInfo.textContent();
  const totElectricityCost = await totElectricityCostInfo.textContent();

  materialEditor = await settings.openMaterialEditor();
  await materialEditor.selectTab('Aerogel');
  await materialEditor.setMaterialThickness('25');
  await materialEditor.materialThickness.fill('');

  await materialEditor.checkErrorIsVisible('thickness', 'Required');

  await materialEditor.selectTab('Brick');
  await materialEditor.selectTab('Aerogel');
  await expect(materialEditor.materialThickness).toHaveValue('25');
  await materialEditor.close();

  // expect that the simulation didn't recomputed
  expect(await heatLossInfo.textContent()).toBe(heatLoss);
  expect(await totHeatLossInfo.textContent()).toBe(totHeatLoss);
  expect(await totElectricityCostInfo.textContent()).toBe(totElectricityCost);
});

test('thickness should not be negative or 0', async ({ page }) => {
  const housePage = new HousePage(page);
  const { info, settings } = housePage;
  const { heatLossInfo, totHeatLossInfo, totElectricityCostInfo } = info;
  await housePage.goto();

  let materialEditor = await settings.openMaterialEditor();
  await materialEditor.selectTab('Aerogel');
  await materialEditor.setMaterialThickness('25');
  await materialEditor.close();

  const heatLoss = await heatLossInfo.textContent();
  const totHeatLoss = await totHeatLossInfo.textContent();
  const totElectricityCost = await totElectricityCostInfo.textContent();

  materialEditor = await settings.openMaterialEditor();
  await materialEditor.setMaterialThickness('-1');
  await materialEditor.checkErrorIsVisible('thickness', 'Min');
  await materialEditor.setMaterialThickness('0');
  await materialEditor.selectTab('Brick');
  await materialEditor.selectTab('Aerogel');
  await expect(materialEditor.materialThickness).toHaveValue('25');
  await materialEditor.close();

  // expect that the simulation didn't recomputed
  expect(await heatLossInfo.textContent()).toBe(heatLoss);
  expect(await totHeatLossInfo.textContent()).toBe(totHeatLoss);
  expect(await totElectricityCostInfo.textContent()).toBe(totElectricityCost);
});

test('thickness should not exceed max value', async ({ page }) => {
  const housePage = new HousePage(page);
  const { info, settings } = housePage;
  const { heatLossInfo, totHeatLossInfo, totElectricityCostInfo } = info;
  await housePage.goto();

  let materialEditor = await settings.openMaterialEditor();
  await materialEditor.selectTab('Aerogel');
  await materialEditor.setMaterialThickness('25');
  await materialEditor.close();

  const heatLoss = await heatLossInfo.textContent();
  const totHeatLoss = await totHeatLossInfo.textContent();
  const totElectricityCost = await totElectricityCostInfo.textContent();

  materialEditor = await settings.openMaterialEditor();
  await materialEditor.setMaterialThickness('101');

  await materialEditor.checkErrorIsVisible('thickness', 'Max');

  await materialEditor.selectTab('Brick');
  await materialEditor.selectTab('Aerogel');
  await expect(materialEditor.materialThickness).toHaveValue('25');
  await materialEditor.close();

  // expect that the simulation didn't recomputed
  expect(await heatLossInfo.textContent()).toBe(heatLoss);
  expect(await totHeatLossInfo.textContent()).toBe(totHeatLoss);
  expect(await totElectricityCostInfo.textContent()).toBe(totElectricityCost);
});
