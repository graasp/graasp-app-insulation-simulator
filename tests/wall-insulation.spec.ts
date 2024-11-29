import { expect, test } from '@playwright/test';

const PLAYER_PATH = '/';

test('should change the wall insulation', async ({ page }) => {
  await page.goto(PLAYER_PATH);
  await page.getByLabel('Wall Insulation').click();
  await page.getByRole('option', { name: 'Fiberglass' }).click();

  // Check that the Insulation changed correctly.
  await expect(
    page.getByRole('combobox', { name: 'Wall Insulation' }),
  ).toHaveText('Fiberglass');
});

test('should only update the aerogel material', async ({ page }) => {
  await page.goto(PLAYER_PATH);

  await page.getByLabel('House').getByRole('button').first().click();
  await page.getByRole('tab', { name: 'Aerogel' }).click();
  await page.getByLabel('Price').click();
  await page.getByLabel('Price').fill('100');
  await page.getByLabel('Thickness').click();
  await page.getByLabel('Thickness').fill('1');

  // expect Price and Thickness have changed
  await expect(page.getByLabel('Price')).toHaveValue('100');
  await expect(page.getByLabel('Thickness')).toHaveValue('1');

  // expect Brick haven't been changed
  await page.getByRole('tab', { name: 'Brick' }).click();
  await expect(page.getByLabel('Price')).not.toHaveValue('100');
  await expect(page.getByLabel('Thickness')).not.toHaveValue('1');

  await page.getByRole('button', { name: 'Close' }).click();
  await page.getByLabel('House').getByRole('button').first().click();
  await page.getByRole('tab', { name: 'Aerogel' }).click();

  // expect Price and Thickness or Aergoel have not been reset
  await expect(page.getByLabel('Price')).toHaveValue('100');
  await expect(page.getByLabel('Thickness')).toHaveValue('1');
});

test('should update all the materials without reset', async ({ page }) => {
  await page.goto(PLAYER_PATH);

  await page.getByLabel('House').getByRole('button').first().click();
  await page.getByLabel('Price').click();
  await page.getByLabel('Price').fill('10');
  await page.getByLabel('Thickness').click();
  await page.getByLabel('Thickness').fill('50');

  // expect Price and Thickness have changed
  await expect(page.getByLabel('Price')).toHaveValue('10');
  await expect(page.getByLabel('Thickness')).toHaveValue('50');

  await page.getByRole('tab', { name: 'Aerogel' }).click();
  await page.getByLabel('Price').click();
  await page.getByLabel('Price').fill('100');
  await page.getByLabel('Thickness').click();
  await page.getByLabel('Thickness').fill('1');

  // expect Price and Thickness have changed
  await expect(page.getByLabel('Price')).toHaveValue('100');
  await expect(page.getByLabel('Thickness')).toHaveValue('1');

  await page.getByRole('tab', { name: 'Brick' }).click();
  // expect Price and Thickness have not been reset
  await expect(page.getByLabel('Price')).toHaveValue('10');
  await expect(page.getByLabel('Thickness')).toHaveValue('50');

  await page.getByRole('tab', { name: 'Aerogel' }).click();
  // expect Price and Thickness have not been reset
  await expect(page.getByLabel('Price')).toHaveValue('100');
  await expect(page.getByLabel('Thickness')).toHaveValue('1');
});

test('price should accept numbers only', async ({ page }) => {
  await page.goto(PLAYER_PATH);
  await page.getByLabel('House').getByRole('button').first().click();
  await page.getByRole('tab', { name: 'Aerogel' }).click();
  await page.getByLabel('Price').click();
  await page.getByLabel('Price').pressSequentially('Not a number');

  await expect(page.getByLabel('Price')).toHaveValue('');
});

test('price should not be empty', async ({ page }) => {
  await page.goto(PLAYER_PATH);
  await page.getByLabel('House').getByRole('button').first().click();
  await page.getByRole('tab', { name: 'Aerogel' }).click();
  await page.getByLabel('Price').click();
  await page.getByLabel('Price').fill('150');
  await page.getByLabel('Price').fill('');

  await expect(page.getByText('Required')).toBeVisible();

  await page.getByRole('tab', { name: 'Brick' }).click();
  await page.getByRole('tab', { name: 'Aerogel' }).click();

  await expect(page.getByLabel('Price')).toHaveValue('150');
});

test('price should not be negative', async ({ page }) => {
  await page.goto(PLAYER_PATH);
  await page.getByLabel('House').getByRole('button').first().click();
  await page.getByRole('tab', { name: 'Aerogel' }).click();
  await page.getByLabel('Price').click();
  await page.getByLabel('Price').fill('150');
  await page.getByLabel('Price').fill('-1');

  await expect(page.getByText('Min')).toBeVisible();

  await page.getByRole('tab', { name: 'Brick' }).click();
  await page.getByRole('tab', { name: 'Aerogel' }).click();

  await expect(page.getByLabel('Price')).toHaveValue('150');
});

test('price should not exceed max value', async ({ page }) => {
  await page.goto(PLAYER_PATH);
  await page.getByLabel('House').getByRole('button').first().click();
  await page.getByRole('tab', { name: 'Aerogel' }).click();
  await page.getByLabel('Price').click();
  await page.getByLabel('Price').fill('150');
  await page.getByLabel('Price').fill('1000000000');

  await expect(page.getByText('Max')).toBeVisible();

  await page.getByRole('tab', { name: 'Brick' }).click();
  await page.getByRole('tab', { name: 'Aerogel' }).click();

  await expect(page.getByLabel('Price')).toHaveValue('150');
});

test('thickness should accept numbers only', async ({ page }) => {
  await page.goto(PLAYER_PATH);
  await page.getByLabel('House').getByRole('button').first().click();
  await page.getByRole('tab', { name: 'Aerogel' }).click();
  await page.getByLabel('Thickness').click();
  await page.getByLabel('Thickness').pressSequentially('Not a number');

  await expect(page.getByLabel('Thickness')).toHaveValue('');
});

test('thickness should not be empty', async ({ page }) => {
  await page.goto(PLAYER_PATH);
  await page.getByLabel('House').getByRole('button').first().click();
  await page.getByRole('tab', { name: 'Aerogel' }).click();
  await page.getByLabel('Thickness').click();
  await page.getByLabel('Thickness').fill('25');
  await page.getByLabel('Thickness').fill('');

  await expect(page.getByText('Required')).toBeVisible();

  await page.getByRole('tab', { name: 'Brick' }).click();
  await page.getByRole('tab', { name: 'Aerogel' }).click();

  await expect(page.getByLabel('Thickness')).toHaveValue('25');
});

test('thickness should not be negative or 0', async ({ page }) => {
  await page.goto(PLAYER_PATH);
  await page.getByLabel('House').getByRole('button').first().click();
  await page.getByRole('tab', { name: 'Aerogel' }).click();
  await page.getByLabel('Thickness').click();
  await page.getByLabel('Thickness').fill('25');
  await page.getByLabel('Thickness').fill('-1');

  await expect(page.getByText('Min')).toBeVisible();

  await page.getByLabel('Thickness').fill('0');

  await page.getByRole('tab', { name: 'Brick' }).click();
  await page.getByRole('tab', { name: 'Aerogel' }).click();

  await expect(page.getByLabel('Thickness')).toHaveValue('25');
});

test('thickness should not exceed max value', async ({ page }) => {
  await page.goto(PLAYER_PATH);
  await page.getByLabel('House').getByRole('button').first().click();
  await page.getByRole('tab', { name: 'Aerogel' }).click();
  await page.getByLabel('Thickness').click();
  await page.getByLabel('Thickness').fill('25');
  await page.getByLabel('Thickness').fill('100');

  await expect(page.getByText('Max')).toBeVisible();

  await page.getByRole('tab', { name: 'Brick' }).click();
  await page.getByRole('tab', { name: 'Aerogel' }).click();

  await expect(page.getByLabel('Thickness')).toHaveValue('25');
});
