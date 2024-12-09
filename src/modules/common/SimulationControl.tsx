import { Fab, Stack } from '@mui/material';

import { PauseIcon, PlayIcon } from 'lucide-react';

import { useSimulation } from '@/context/SimulationContext';
import { SimulationStatus } from '@/types/simulation';

import { LabelledSlider } from './LabelledSlider';

export const SimulationControl = (): JSX.Element => {
  const {
    currDayIdx,
    numberOfDays,
    status,
    getDateOf,
    gotToDay,
    pauseSimulation,
    startSimulation,
  } = useSimulation();

  const handleGoToDay = (idx: number | number[]): void => {
    if (typeof idx === 'number') {
      gotToDay(idx);
    }
  };

  return (
    <Stack mt={2} alignItems="center" spacing={2}>
      <LabelledSlider
        dataTestId="simulation-control-dates"
        value={currDayIdx}
        sx={{ minWidth: '350px', maxWidth: '500px' }}
        onChange={(v) => handleGoToDay(v)}
        min={0}
        max={numberOfDays - 1}
        hideValue
        hideLabels={status === SimulationStatus.LOADING}
        formatValue={(v) => getDateOf(v).toLocaleDateString()}
        disabled={status === SimulationStatus.LOADING}
      />
      <Fab
        data-testid={`simulation-control-button-${status === SimulationStatus.RUNNING ? 'pause' : 'start'}`}
        color="primary"
        disabled={status === SimulationStatus.LOADING}
        onClick={
          status === SimulationStatus.RUNNING
            ? pauseSimulation
            : startSimulation
        }
      >
        {status === SimulationStatus.RUNNING ? <PauseIcon /> : <PlayIcon />}
      </Fab>
    </Stack>
  );
};
