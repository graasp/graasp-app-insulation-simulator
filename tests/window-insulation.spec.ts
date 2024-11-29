import { expect, test } from 'playwright-test-coverage';

const PLAYER_PATH = '/';

test('should change the window insulation', async ({ page }) => {
  await page.goto(PLAYER_PATH);
  await page.getByLabel('Double Pane').click();
  await page.getByRole('option', { name: 'Triple Pane' }).click();

  // Check that the Insulation changed correctly.
  await expect(
    page.getByRole('combobox', { name: 'Windows Insulation' }),
  ).toHaveText('Triple Pane');
});

test('changing window size should update the size helper label', async ({
  page,
}) => {
  await page.goto(PLAYER_PATH);
  await page.getByLabel('Double Pane').click();
  await page.getByRole('option', { name: 'Single Pane' }).click();
  await page.getByLabel('House').getByRole('button').nth(1).click();

  await expect(page.getByTestId('window-size-helper-medium')).toBeVisible();

  await page.getByLabel('Medium').click();
  await page.getByRole('option', { name: 'Small' }).click();

  await expect(page.getByTestId('window-size-helper-medium')).not.toBeVisible();
  await expect(page.getByTestId('window-size-helper-small')).toBeVisible();
});
