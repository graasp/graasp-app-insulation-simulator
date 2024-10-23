import { SIMULATION_SLIDING_WINDOW } from '@/config/simulation';
import {
  SlidingWindow,
  SlidingWindowOptions,
  TemperatureRow,
} from '@/types/temperatures';
import { TimeUnitType } from '@/types/time';
import { timeConversionFactors } from '@/utils/time';

export const initSlidingWindow = (idx: number): SlidingWindow => ({
  idx,
  mean: 0,
  temperatures: [],
  period: { from: new Date(), to: new Date(), durationInHours: 0 },
  size: 0,
  totalCount: 0,
});

const initSlidingWindowIdx = (slidingWindowSize: number): number => {
  if (slidingWindowSize < 0) {
    throw new Error('The sliding window size must be a positive number.');
  }

  // We initialize the index to -slidingSize
  // to ensure the next call to nextTemperature() starts at index 0.
  return -slidingWindowSize;
};

type TemperatureIteratorConstructor = {
  slidingWindow?: SlidingWindowOptions;
  temperatures: TemperatureRow[];
  measurementFrequency: TimeUnitType;
};

export class TemperatureIterator {
  private readonly temperatureRows: TemperatureRow[];

  private readonly numberOfRows: number;

  private readonly measurementFrequency: TimeUnitType;

  private readonly slidingWindowSize: number;

  private currentSlidingWindow: SlidingWindow;

  /**
   *
   * @param temperatures          - The complete array of loaded temperatures.
   * @param measurementFrequency  - The time unit corresponding to the frequency of the temperature measurements.
   *                               Indicates whether the temperatures are recorded once per hour, once per day, etc.
   * @param slidingWindow         - Defines the size of the sliding window.
   *                              For example, `{ window: 45, unit: 'days' }` creates a 45-day sliding window.
   *                              Each iteration of the iterator will analyze a chunk of data corresponding to this
   *                              window size.  If the `measurementFrequency` is in days and the `slidingWindow`
   *                              is 45 days, each iteration will process 45 temperature readings (rows).  If the
   *                              `measurementFrequency` is in hours and the `slidingWindow` is 45 days, each
   *                              iteration will process 45 * 24 = 1080 hourly temperature readings.
   */
  constructor({
    temperatures,
    measurementFrequency,
    slidingWindow = SIMULATION_SLIDING_WINDOW,
  }: TemperatureIteratorConstructor) {
    this.temperatureRows = temperatures;
    this.numberOfRows = temperatures.length;
    this.measurementFrequency = measurementFrequency;

    // Calculate the sliding window size in terms of the measurement frequency.
    // This converts the user-provided window (e.g., 45 days) into the
    // equivalent number of measurement intervals (e.g., hours, days).
    // If the sliding window size is smaller thant the measurement frequency,
    // the final size will be 1 unit of measurement frequency.
    // ie. Window size of 2 hours with daily temperatures will have a final size of 1 day.
    this.slidingWindowSize = Math.max(
      Math.round(
        (slidingWindow.window * timeConversionFactors[slidingWindow.unit]) / // Convert window in hours
          timeConversionFactors[measurementFrequency], // Convert window according to measurement frequency
      ),
      1,
    );

    this.currentSlidingWindow = initSlidingWindow(
      initSlidingWindowIdx(this.slidingWindowSize),
    );
  }

  hasMore(): boolean {
    if (this.numberOfRows === 0) {
      return false;
    }

    return (
      this.currentSlidingWindow.idx + this.slidingWindowSize < this.numberOfRows
    );
  }

  reset(): void {
    this.currentSlidingWindow = initSlidingWindow(
      initSlidingWindowIdx(this.slidingWindowSize),
    );
  }

  getNext(): SlidingWindow {
    if (!this.hasMore()) {
      throw new Error('There is no more temperatures!');
    }

    const { idx: prevIdx } = this.currentSlidingWindow;
    const currIdx = Math.min(
      prevIdx + this.slidingWindowSize,
      this.numberOfRows - 1,
    );
    const lastIdx = Math.min(
      currIdx + this.slidingWindowSize,
      this.numberOfRows,
    );
    const currentRows = this.temperatureRows.slice(currIdx, lastIdx);
    const temperatures = currentRows.map((r) => r.temperature);
    const total = temperatures.reduce((sum, currVal) => sum + currVal, 0);
    const currentSize = temperatures.length;

    this.currentSlidingWindow = {
      idx: currIdx,
      mean: Math.round(total / currentSize),
      temperatures,
      period: {
        durationInHours:
          temperatures.length *
          timeConversionFactors[this.measurementFrequency],
        from: new Date(currentRows[0].time),
        to: new Date(currentRows[currentRows.length - 1].time),
      },
      size: currentSize,
      totalCount: this.numberOfRows,
    };

    return this.currentSlidingWindow;
  }
}
