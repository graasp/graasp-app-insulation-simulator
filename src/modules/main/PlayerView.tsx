import { Stack } from '@mui/material';

import { SIMULATION_FRAME_MS } from '@/config/simulation';
import { SeasonProvider } from '@/context/SeasonContext';
import { SimulationProvider } from '@/context/SimulationContext';

import { SimulationCanvas } from '../common/SimulationCanvas';
import { SimulationControl } from '../common/SimulationControl';
import { SimulationInformations } from '../common/SimulationInformations/SimulationInformations';
import { SimulationSettingsPanel } from '../common/SimulationSettingsPanel/SimulationSettingsPanel';

const PlayerViewComponent = (): JSX.Element => (
  <Stack
    sx={{ background: '#fafaff' }}
    height="100%"
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

const PlayerView = (): JSX.Element => (
  <SimulationProvider simulationFrameMS={SIMULATION_FRAME_MS}>
    <SeasonProvider>
      <PlayerViewComponent />
    </SeasonProvider>
  </SimulationProvider>
);

export default PlayerView;
