import { expect, test } from '@playwright/test';

import { HousePage } from './HousePage';

test('changing indoor temperature should update the informations', async ({
  page,
}) => {
  const housePage = new HousePage(page);
  await housePage.goto();

  const newValue = await housePage.setIndoorTemperature(10);
  await expect(housePage.indoorTemperatureInfo).toHaveText(newValue);
});
