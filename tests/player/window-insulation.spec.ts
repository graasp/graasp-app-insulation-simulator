import { expect, test } from 'playwright-test-coverage';

import { HousePage } from './HousePage';

test('should change the window insulation', async ({ page }) => {
  const housePage = new HousePage(page);
  await housePage.goto();
  await housePage.selectWindowInsulation('Triple Pane');
});

test('changing window size should update the size helper label', async ({
  page,
}) => {
  const housePage = new HousePage(page);
  await housePage.goto();
  await housePage.selectWindowInsulation('Single Pane');

  const windowEditorPage = await housePage.openWindowEditor();
  await expect(await windowEditorPage.getWindowSizeHelper()).toBeVisible();
  await windowEditorPage.selectWindowSize('Small');

  await expect(await windowEditorPage.getWindowSizeHelper()).not.toBeVisible();
  await expect(
    await windowEditorPage.getWindowSizeHelper('Small'),
  ).toBeVisible();
});

test('close button should close the modal', async ({ page }) => {
  const housePage = new HousePage(page);
  await housePage.goto();

  const windowEditorPage = await housePage.openWindowEditor();
  await windowEditorPage.checkIsOpen();
  await windowEditorPage.close();
  await windowEditorPage.checkIsClosed();
});
