import { expect, test } from 'playwright-test-coverage';

import { HousePage } from './HousePage';

test('should change the wall insulation', async ({ page }) => {
  const housePage = new HousePage(page);
  await housePage.goto();
  await housePage.selectWallInsulation('Fiberglass');
});

test('should only update the aerogel material', async ({ page }) => {
  const housePage = new HousePage(page);
  await housePage.goto();

  let materialEditor = await housePage.openMaterialEditor();
  await materialEditor.selectTab('Aerogel');
  await materialEditor.setMaterialPrice('100');
  await materialEditor.setMaterialThickness('1');

  // expect Brick haven't been changed
  await materialEditor.selectTab('Brick');

  await expect(materialEditor.materialPrice).not.toHaveValue('100');
  await expect(materialEditor.materialThickness).not.toHaveValue('1');

  await materialEditor.close();
  materialEditor = await housePage.openMaterialEditor();
  await materialEditor.selectTab('Aerogel');

  // expect Price and Thickness or Aergoel have not been reset
  await expect(materialEditor.materialPrice).toHaveValue('100');
  await expect(materialEditor.materialThickness).toHaveValue('1');
});

test('should update all the materials without reset', async ({ page }) => {
  const housePage = new HousePage(page);
  await housePage.goto();

  const materialEditor = await housePage.openMaterialEditor();
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
  await housePage.goto();

  const materialEditor = await housePage.openMaterialEditor();
  await materialEditor.selectTab('Aerogel');
  await materialEditor.materialPrice.click();
  await materialEditor.materialPrice.pressSequentially('Not a number');
  await expect(materialEditor.materialPrice).toHaveValue('');
});

test('price should not be empty', async ({ page }) => {
  const housePage = new HousePage(page);
  await housePage.goto();

  const materialEditor = await housePage.openMaterialEditor();
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
  await housePage.goto();

  const materialEditor = await housePage.openMaterialEditor();
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
  await housePage.goto();

  const materialEditor = await housePage.openMaterialEditor();
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
  await housePage.goto();

  const materialEditor = await housePage.openMaterialEditor();
  await materialEditor.selectTab('Aerogel');
  await materialEditor.materialThickness.click();
  await materialEditor.materialThickness.pressSequentially('Not a number');
  await expect(materialEditor.materialThickness).toHaveValue('');
});

test('thickness should not be empty', async ({ page }) => {
  const housePage = new HousePage(page);
  await housePage.goto();

  const materialEditor = await housePage.openMaterialEditor();
  await materialEditor.selectTab('Aerogel');
  await materialEditor.setMaterialThickness('25');
  await materialEditor.materialThickness.fill('');

  await materialEditor.checkErrorIsVisible('thickness', 'Required');

  await materialEditor.selectTab('Brick');
  await materialEditor.selectTab('Aerogel');
  await expect(materialEditor.materialThickness).toHaveValue('25');
});

test('thickness should not be negative or 0', async ({ page }) => {
  const housePage = new HousePage(page);
  await housePage.goto();

  const materialEditor = await housePage.openMaterialEditor();
  await materialEditor.selectTab('Aerogel');
  await materialEditor.setMaterialThickness('25');
  await materialEditor.setMaterialThickness('-1');

  await materialEditor.checkErrorIsVisible('thickness', 'Min');

  await materialEditor.setMaterialThickness('0');

  await materialEditor.selectTab('Brick');
  await materialEditor.selectTab('Aerogel');
  await expect(materialEditor.materialThickness).toHaveValue('25');
});

test('thickness should not exceed max value', async ({ page }) => {
  const housePage = new HousePage(page);
  await housePage.goto();

  const materialEditor = await housePage.openMaterialEditor();
  await materialEditor.selectTab('Aerogel');
  await materialEditor.setMaterialThickness('25');
  await materialEditor.setMaterialThickness('101');

  await materialEditor.checkErrorIsVisible('thickness', 'Max');

  await materialEditor.selectTab('Brick');
  await materialEditor.selectTab('Aerogel');
  await expect(materialEditor.materialThickness).toHaveValue('25');
});
