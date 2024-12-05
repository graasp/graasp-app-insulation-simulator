import test, { expect } from '@playwright/test';

import { HousePage } from './HousePage';

test('simulation duration should be disabled when simulation is running', async ({
  page,
}) => {
  const housePage = new HousePage(page);
  await housePage.goto();
  await housePage.setSimulationDuration(25);
  await housePage.getSimulationControlButton('start').click();
  await expect(housePage.simulationDuration).toBeDisabled();
});
