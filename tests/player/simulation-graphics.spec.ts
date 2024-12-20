import { expect, test } from 'playwright-test-coverage';

import { HousePage } from './HousePage';

test('displaying the graphics should not reset the house components', async ({
  page,
}) => {
  const housePage = new HousePage(page);
  const { info } = housePage;
  await housePage.goto();
  const heatLoss = await info.heatLossInfo.textContent();
  await page.getByRole('tab', { name: 'Analyze' }).click();
  expect(await info.heatLossInfo.textContent()).toBe(heatLoss);
});
