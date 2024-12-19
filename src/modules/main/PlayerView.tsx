import { useTranslation } from 'react-i18next';

import { LinearProgress, Stack, Typography } from '@mui/material';

import { SIMULATION_FRAME_MS } from '@/config/simulation';
import { SeasonProvider } from '@/context/SeasonContext';
import { SimulationProvider, useSimulation } from '@/context/SimulationContext';
import { SimulationStatus } from '@/types/simulation';

import { SimulationCanvas } from '../common/SimulationCanvas';
import { SimulationControl } from '../common/SimulationControl';
import { SimulationInformations } from '../common/SimulationInformations/SimulationInformations';
import { SimulationSettingsPanel } from '../common/SimulationSettingsPanel/SimulationSettingsPanel';

const PlayerViewComponent = (): JSX.Element => {
  const { t } = useTranslation('INITIAL_LOADING');
  const { status } = useSimulation('simulation');

  if (status === SimulationStatus.INITIAL_LOADING) {
    return (
      <Stack
        width="100%"
        height="100vh"
        p={2}
        justifyContent="center"
        spacing={1}
      >
        <Stack alignItems="center">
          <Typography variant="h4">{t('LOADING_MESSAGE')}</Typography>
        </Stack>
        <LinearProgress />
      </Stack>
    );
  }

  return (
    <Stack
      direction={{ xs: 'column-reverse', md: 'row' }}
      justifyContent="center"
    >
      <Stack justifyContent="space-between" alignItems="center" flexGrow={4}>
        <SimulationInformations />
        <SimulationCanvas />
        <SimulationControl />
      </Stack>

      <Stack m={2} flexGrow={1}>
        <SimulationSettingsPanel />
      </Stack>
    </Stack>
  );
};

const PlayerView = (): JSX.Element => (
  <SimulationProvider simulationFrameMS={SIMULATION_FRAME_MS}>
    <SeasonProvider>
      <PlayerViewComponent />
    </SeasonProvider>
  </SimulationProvider>
);

export default PlayerView;
