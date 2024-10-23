import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from 'react';

import { TemperatureRow } from '@/types/temperatures';
import { loadTemperaturesFromCSV } from '@/utils/temperatures';

type Unit = {
  hours: 'hours';
  days: 'days';
  weeks: 'weeks';
  months: 'months';
  years: 'years';
};

type SlidingWindowOptions = {
  window: number;
  unit: keyof Unit;
};

type SlidingWindow = {
  idx: number;
  mean: number;
  temperatures: number[];
  period: { from: Date; to: Date; duration: string };
};

type TemperatureContextType = {
  meanTemperature: number;
  temperatures: number[];
  period: SlidingWindow['period'];
  progression: {
    timeLeft: number;
    progress: number;
  };
  nextTemperature: () => void;
  hasMoreTemperature: () => boolean;
  reset: () => void;
};

const TEMPERATURE_ERROR_CONTEXT =
  'The Temperature context is being used, but the corresponding provider is not found. Please ensure that the provider is defined and properly wrapped around the component.';

const TemperatureContext = createContext<TemperatureContextType>({
  meanTemperature: NaN,
  temperatures: [],
  period: { from: new Date(), to: new Date(), duration: '-' },
  progression: { progress: 0, timeLeft: 0 },
  nextTemperature: () => {
    throw new Error(TEMPERATURE_ERROR_CONTEXT);
  },
  hasMoreTemperature: () => {
    throw new Error(TEMPERATURE_ERROR_CONTEXT);
  },
  reset: () => {
    throw new Error(TEMPERATURE_ERROR_CONTEXT);
  },
});

const conversionFactors: { [key in keyof Unit]: number } = {
  hours: 1,
  days: 24,
  weeks: 24 * 7,
  months: 24 * 30, // Approximate as 30 days
  years: 24 * 365, // Approximate as 365 days
};

const convertHours = (hours: number): string => {
  let restHours = hours;
  const days = Math.floor(restHours / conversionFactors.days);
  restHours %= conversionFactors.days;

  if (days > 0) {
    return `${days} day${days !== 1 ? 's' : ''}`;
  }

  return `${hours} hour${hours !== 1 ? 's' : ''}`;
};

type Props = {
  children: ReactNode;
  slidingWindow?: SlidingWindowOptions;
};

const initSlidingWindow = (idx: number): SlidingWindow => ({
  idx,
  mean: 0,
  temperatures: [],
  period: { from: new Date(), to: new Date(), duration: '-' },
});

const initSlidingWindowIdx = (slidingWindowSize: number): number => {
  if (slidingWindowSize < 1) {
    throw new Error('The sliding window size must be greater than 0.');
  }

  // We initialize the index to - (sliding size - 1) to ensure the next call to nextTemperature() starts at index 0.
  return -slidingWindowSize - 1;
};

export const TemperatureProvider = ({
  children,
  slidingWindow = { window: 45, unit: 'days' },
}: Props): ReactNode => {
  const slidingWindowInHours =
    slidingWindow.window * conversionFactors[slidingWindow.unit];
  const numberOfRows = useRef(0);
  const temperatureRows = useRef<TemperatureRow[]>([]);

  const slidingWindowIdx = useRef(initSlidingWindowIdx(slidingWindowInHours));
  const [currentSlidingWindow, setCurrentSlidingWindow] =
    useState<SlidingWindow>(() => initSlidingWindow(slidingWindowIdx.current));

  const progression = useRef({
    timeLeft: 0,
    progress: 0,
  });

  useMemo(async () => {
    const loadedTemperatures = await loadTemperaturesFromCSV();
    temperatureRows.current = loadedTemperatures;
    numberOfRows.current = loadedTemperatures.length;
  }, []);

  const hasMoreTemperature = useCallback(
    (): boolean => slidingWindowIdx.current + 1 < numberOfRows.current,
    [],
  );

  const nextTemperature = useCallback((): void => {
    if (!hasMoreTemperature()) {
      throw new Error('There is no more temperatures!');
    }

    setCurrentSlidingWindow(({ idx: prevIdx }) => {
      const idx = Math.min(
        prevIdx + slidingWindowInHours + 1,
        numberOfRows.current - 1,
      );
      const lastIdx = Math.min(
        idx + slidingWindowInHours, // +1 to include the last one
        numberOfRows.current,
      );
      const currentRows = temperatureRows.current.slice(idx, lastIdx);
      const temperatures = currentRows.map((r) => r.temperature);
      const total = temperatures.reduce((sum, currVal) => sum + currVal, 0);

      progression.current = {
        progress: Math.round((lastIdx / numberOfRows.current) * 100),
        timeLeft:
          // TODO: use const instead of 150...
          Math.round(
            (((numberOfRows.current - lastIdx) / slidingWindowInHours) * 150) /
              1000,
          ),
      };

      // We have to update it here because otherwise, the current idx is never updated when using a state
      slidingWindowIdx.current = idx;

      return {
        idx,
        mean: total > 0 ? Math.round(total / temperatures.length) : 0,
        temperatures,
        period: {
          duration: convertHours(temperatures.length),
          from: new Date(currentRows[0].time),
          to: new Date(currentRows[currentRows.length - 1].time),
        },
      };
    });
  }, [hasMoreTemperature, slidingWindowInHours]);

  const reset = useCallback((): void => {
    slidingWindowIdx.current = initSlidingWindowIdx(slidingWindowInHours);
    setCurrentSlidingWindow(initSlidingWindow(slidingWindowIdx.current));
  }, [slidingWindowInHours]);

  const contextValue = useMemo(
    () => ({
      temperatures: currentSlidingWindow.temperatures,
      meanTemperature: currentSlidingWindow.mean,
      period: currentSlidingWindow.period,
      progression: progression.current,
      nextTemperature,
      hasMoreTemperature,
      reset,
    }),
    [
      currentSlidingWindow.mean,
      currentSlidingWindow.period,
      currentSlidingWindow.temperatures,
      hasMoreTemperature,
      nextTemperature,
      reset,
    ],
  );

  return (
    <TemperatureContext.Provider value={contextValue}>
      {children}
    </TemperatureContext.Provider>
  );
};

export const useTemperature = (): TemperatureContextType =>
  useContext<TemperatureContextType>(TemperatureContext);
