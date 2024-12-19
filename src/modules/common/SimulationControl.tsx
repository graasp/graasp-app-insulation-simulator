import { Fab, Stack } from '@mui/material';

import { PauseIcon, PlayIcon } from 'lucide-react';

import { useSimulation } from '@/context/SimulationContext';
import { SimulationStatus } from '@/types/simulation';

import { LabelledSlider } from './LabelledSlider';
import { SpeedButton } from './SpeedButton';

export const SimulationControl = (): JSX.Element => {
  const {
    days: { currentIdx, total, getDateOf, goToDay },
    pause,
    start,
    status,
  } = useSimulation('simulation');

  const handleGoToDay = (idx: number | number[]): void => {
    if (typeof idx === 'number') {
      goToDay(idx);
    }
  };

  return (
    <Stack mt={2} alignItems="center" spacing={2}>
      <Stack alignItems="end">
        <SpeedButton />
        <LabelledSlider
          dataTestId="simulation-control-dates"
          value={currentIdx}
          sx={{ minWidth: '350px', maxWidth: '500px' }}
          onChange={(v) => handleGoToDay(v)}
          min={0}
          max={total - 1}
          hideValue
          hideLabels={status === SimulationStatus.LOADING}
          formatValue={(v) => getDateOf(v).toLocaleDateString()}
          disabled={status === SimulationStatus.LOADING}
        />
      </Stack>
      <Fab
        data-testid={`simulation-control-button-${status === SimulationStatus.RUNNING ? 'pause' : 'start'}`}
        color="primary"
        disabled={status === SimulationStatus.LOADING}
        onClick={status === SimulationStatus.RUNNING ? pause : start}
      >
        {status === SimulationStatus.RUNNING ? <PauseIcon /> : <PlayIcon />}
      </Fab>
    </Stack>
  );
};
