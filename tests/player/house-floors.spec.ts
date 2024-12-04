import { test } from 'playwright-test-coverage';

import { HousePage } from './HousePage';

test('should change the number of floors', async ({ page }) => {
  const housePage = new HousePage(page);
  await housePage.goto();
  await housePage.selectNumberOfFloors(2);
});
