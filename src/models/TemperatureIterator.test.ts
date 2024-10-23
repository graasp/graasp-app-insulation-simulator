import { describe, expect, it } from 'vitest';

import { SIMULATION_SLIDING_WINDOW } from '@/config/simulation';
import { TemperatureRow } from '@/types/temperatures';
import { TimeUnit, TimeUnitType } from '@/types/time';
import { timeConversionFactors } from '@/utils/time';

import { TemperatureIterator } from './TemperatureIterator';

const createDummyTemperatures = (
  count: number,
  measurementFrequency: TimeUnitType,
): TemperatureRow[] =>
  Array.from(
    {
      length:
        (count * timeConversionFactors[TimeUnit.Days]) /
        timeConversionFactors[measurementFrequency],
    },
    (_, i) => ({
      time: new Date(Date.UTC(2024, 0, i + 1, i)).toISOString(), // Create dates for each day or hour
      temperature: 10 + i,
    }),
  );

describe('TemperatureIterator', () => {
  it('should initialize correctly by hours', () => {
    const temperatures = createDummyTemperatures(10, TimeUnit.Hours);
    expect(temperatures.length).toBe(240); // Should have more initially
    const iterator = new TemperatureIterator({
      temperatures,
      measurementFrequency: TimeUnit.Days,
    });
    expect(iterator.hasMore()).toBe(true); // Should have more initially
  });

  it('should initialize correctly by days', () => {
    const temperatures = createDummyTemperatures(10, TimeUnit.Days);
    expect(temperatures.length).toBe(10); // Should have more initially
    const iterator = new TemperatureIterator({
      temperatures,
      measurementFrequency: TimeUnit.Days,
    });
    expect(iterator.hasMore()).toBe(true); // Should have more initially
  });

  it('should iterate through the temperatures with the correct sliding window', () => {
    const temperatures = createDummyTemperatures(10, TimeUnit.Days);

    const iterator = new TemperatureIterator({
      temperatures,
      measurementFrequency: TimeUnit.Days,
      slidingWindow: { window: 3, unit: TimeUnit.Days },
    });

    let window = iterator.getNext();
    expect(window.temperatures).toEqual([10, 11, 12]);
    expect(window.mean).toEqual(11);
    expect(window.size).toEqual(3);
    expect(window.totalCount).toEqual(10);

    window = iterator.getNext();
    expect(window.temperatures).toEqual([13, 14, 15]);
    expect(window.mean).toEqual(14);

    window = iterator.getNext();
    expect(window.temperatures).toEqual([16, 17, 18]);
    expect(window.mean).toEqual(17);

    window = iterator.getNext();
    expect(window.temperatures).toEqual([19]); // Last window might be smaller
    expect(window.mean).toEqual(19);

    expect(iterator.hasMore()).toBe(false); // Should have no more after iterating
  });

  it('should handle different measurement frequencies and sliding window units', () => {
    const temperaturesHourly = createDummyTemperatures(5, TimeUnit.Hours); // 5 days of hourly data
    const iteratorHourly = new TemperatureIterator({
      temperatures: temperaturesHourly,
      measurementFrequency: TimeUnit.Hours,
      slidingWindow: { window: 2, unit: TimeUnit.Days },
    });

    const firstWindowHourly = iteratorHourly.getNext();
    expect(firstWindowHourly.size).toBe(48); // 2 days * 24 hours/day

    const temperaturesDaily = createDummyTemperatures(5, TimeUnit.Days);
    let iteratorDaily = new TemperatureIterator({
      temperatures: temperaturesDaily,
      measurementFrequency: TimeUnit.Days,
      slidingWindow: { window: 2, unit: TimeUnit.Days },
    });

    let firstWindowDaily = iteratorDaily.getNext();
    expect(firstWindowDaily.size).toBe(2); // 2 days

    // Sliding window (2 hours) < measurement frequency (1 day), expect 1 day's data per iteration.
    iteratorDaily = new TemperatureIterator({
      temperatures: temperaturesDaily,
      measurementFrequency: TimeUnit.Days,
      slidingWindow: { window: 2, unit: TimeUnit.Hours },
    });
    firstWindowDaily = iteratorDaily.getNext();
    expect(firstWindowDaily.size).toBe(1);
    expect(firstWindowDaily.temperatures).toStrictEqual([10]);

    firstWindowDaily = iteratorDaily.getNext();
    expect(firstWindowDaily.size).toBe(1);
    expect(firstWindowDaily.temperatures).toStrictEqual([11]);
  });

  it('should not throw an error if the window size is greater than the number of temperatures', () => {
    const temperatures = createDummyTemperatures(2, TimeUnit.Days);
    const iterator = new TemperatureIterator({
      temperatures,
      measurementFrequency: TimeUnit.Days,
      slidingWindow: { window: 3, unit: TimeUnit.Days },
    });

    const firstWindowDaily = iterator.getNext(); // Get the first (and only) window
    expect(firstWindowDaily.size).toBe(2); // 2 days
  });

  it('should throw an error if there are no temperatures', () => {
    const temperatures = createDummyTemperatures(0, TimeUnit.Days);
    const iterator = new TemperatureIterator({
      temperatures,
      measurementFrequency: TimeUnit.Days,
      slidingWindow: { window: 3, unit: TimeUnit.Days },
    });

    expect(() => iterator.getNext()).toThrowError(
      'There is no more temperatures!',
    );
  });

  it('should throw an error if there are no more temperatures', () => {
    const temperatures = createDummyTemperatures(2, TimeUnit.Days);
    const iterator = new TemperatureIterator({
      temperatures,
      measurementFrequency: TimeUnit.Days,
      slidingWindow: { window: 2, unit: TimeUnit.Days },
    });

    iterator.getNext(); // get first window

    expect(() => iterator.getNext()).toThrowError(
      'There is no more temperatures!',
    );
  });

  it('should reset the iterator correctly', () => {
    const temperatures = createDummyTemperatures(5, TimeUnit.Days);
    const iterator = new TemperatureIterator({
      temperatures,
      measurementFrequency: TimeUnit.Days,
      slidingWindow: { window: 2, unit: TimeUnit.Days },
    });

    iterator.getNext(); // Move to the second window
    iterator.reset(); // Reset the iterator

    const resetWindow = iterator.getNext(); // Get the first window again
    expect(resetWindow.temperatures).toEqual([10, 11]); // Should be back to the first window's data
  });

  it('should use the default sliding window if none is provided', () => {
    const temperatures = createDummyTemperatures(45, TimeUnit.Days);
    const iterator = new TemperatureIterator({
      temperatures,
      measurementFrequency: TimeUnit.Days,
    });

    const window = iterator.getNext();
    expect(window.size).toBe(SIMULATION_SLIDING_WINDOW.window); // Should use the default window size
  });

  it('should handle edge cases with small datasets and large sliding windows', () => {
    const temperatures = createDummyTemperatures(2, TimeUnit.Days); // Dataset of 2 data
    const iterator = new TemperatureIterator({
      temperatures,
      measurementFrequency: TimeUnit.Days,
      slidingWindow: { window: 5, unit: TimeUnit.Days }, // Window larger than dataset
    });

    const window = iterator.getNext();
    expect(window.temperatures).toEqual([10, 11]); // Should include all available data
  });
});
