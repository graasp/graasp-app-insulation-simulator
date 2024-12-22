import { useTranslation } from 'react-i18next';

import {
  LinearProgress,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';

import { ChartLine, Rotate3d } from 'lucide-react';

import { SIMULATION_FRAME_MS } from '@/config/simulation';
import { ChartProvider } from '@/context/ChartContext';
import { SeasonProvider } from '@/context/SeasonContext';
import { SimulationProvider, useSimulation } from '@/context/SimulationContext';
import { SimulationStatus } from '@/types/simulation';

import { SimulationCanvas } from '../common/SimulationCanvas';
import { SimulationControl } from '../common/SimulationControl';
import { SimulationInformations } from '../common/SimulationInformations/SimulationInformations';
import { SimulationSettingsPanel } from '../common/SimulationSettingsPanel/SimulationSettingsPanel';
import { HeatLossCharts } from '../common/charts/HeatLossCharts';
import { Tabs } from '../common/tabs/Tabs';

const SM = { width: 350, height: 475 };
const MD = { width: 500, height: 500 };

const PlayerViewComponent = (): JSX.Element => {
  const { t } = useTranslation('INITIAL_LOADING');
  const { t: tTabs } = useTranslation('SIMULATION_TABS');
  const { status } = useSimulation('simulation');

  const theme = useTheme();
  const md = useMediaQuery(theme.breakpoints.up('sm'));
  const width = md ? MD.width : SM.width;
  const height = md ? MD.height : SM.height;

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
        <ChartProvider>
          <Tabs
            height={height}
            width={width}
            tabs={[
              {
                label: tTabs('VISUALIZE'),
                icon: <Rotate3d />,
                element: <SimulationCanvas size={width} />,
              },
              {
                label: tTabs('ANALYZE'),
                icon: <ChartLine />,
                element: <HeatLossCharts width={width} />,
                // unmount to optimize performances
                unmountOnExit: true,
              },
            ]}
          />
        </ChartProvider>
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
