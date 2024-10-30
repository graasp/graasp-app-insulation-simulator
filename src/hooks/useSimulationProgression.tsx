import { useMemo } from 'react';

import { SimulationProgression } from '@/types/simulation';
import { SlidingWindow } from '@/types/temperatures';

const FACTOR_MILLISECONDS_TO_SECONDS = 1000;

type UseSimulationProgressionReturnType = {
  progression: SimulationProgression;
};
type Props = { currentWindow: SlidingWindow; simulationFrameMS: number };

export const useSimulationProgression = ({
  currentWindow,
  simulationFrameMS,
}: Props): UseSimulationProgressionReturnType => {
  const { idx, totalCount, size } = currentWindow;

  const progression = useMemo(() => {
    if (size === 0) {
      return { progress: 0, timeLeft: 0 };
    }

    const progressPercentage = Math.round((idx / totalCount) * 100);

    const remainingItems = totalCount - idx;
    const timeLeftSeconds = Math.round(
      ((remainingItems / size) * simulationFrameMS) /
        FACTOR_MILLISECONDS_TO_SECONDS,
    );

    return {
      progress: progressPercentage,
      timeLeft: timeLeftSeconds,
    };
  }, [idx, simulationFrameMS, size, totalCount]);

  return { progression };
};
