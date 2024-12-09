import { Locator, Page, expect } from '@playwright/test';

export const changeSlider = async (
  page: Page,
  slider: Locator,
  targetPercentage: number,
): Promise<void> => {
  await slider.scrollIntoViewIfNeeded();
  await expect(slider).toBeInViewport();

  const sliderBoundingBox = await slider.boundingBox();

  if (!sliderBoundingBox) {
    throw new Error('SliderBoundingBox is null');
  }

  // This is to ensure that the slider is at the very end.
  const finalPercentage = targetPercentage === 100 ? 110 : targetPercentage;

  const startPoint = {
    x: sliderBoundingBox.x,
    y: sliderBoundingBox.y + sliderBoundingBox.height / 2,
  };

  // Slide it to some endpoint determined by the target percentage
  const endPoint = {
    x: sliderBoundingBox.x + (sliderBoundingBox.width * finalPercentage) / 100,
    y: startPoint.y,
  };

  await page.mouse.move(startPoint.x, startPoint.y);
  await page.mouse.down();
  await page.mouse.move(endPoint.x, endPoint.y);
  await page.mouse.up();
};
