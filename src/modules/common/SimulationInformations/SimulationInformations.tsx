import { useTranslation } from 'react-i18next';

import {
  Divider,
  Stack,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';

import {
  BrickWall,
  CalendarRange,
  Heater,
  House,
  Plug,
  Thermometer,
  ThermometerSun,
} from 'lucide-react';

import { useSeason } from '@/context/SeasonContext';
import { useSimulation } from '@/context/SimulationContext';
import { LoadingComponent } from '@/modules/common/LoadingComponent';
import { SimulationStatus } from '@/types/simulation';
import { formatNumber } from '@/utils/numbers';

import { useSimulationInformations } from './useSimulationInformations';

export const SimulationInformations = (): JSX.Element => {
  const { t: tSeasons } = useTranslation('SEASONS');
  const { t: tInformations } = useTranslation('SIMULATION_INFORMATIONS');
  const { season } = useSeason();

  const {
    electricity: { cost: electricityCost },
    heatLoss: { total: totalHeatLoss },
    temperatures: { indoor, outdoor },
    simulation: { date, status },
  } = useSimulation();

  const { seasonIcon, heatLoss, formattedWallSize, wallsPrice } =
    useSimulationInformations();

  const theme = useTheme();
  const md = useMediaQuery(theme.breakpoints.up('sm'));
  const iconSize = md ? 24 : 16;

  return (
    <LoadingComponent isLoading={status === SimulationStatus.LOADING}>
      <Stack
        data-testid="simulation-informations"
        bgcolor="white"
        direction="row"
        m={2}
        p={2}
        border="1px solid #C4C4C4"
        borderRadius={3}
        spacing={3}
        justifyContent="space-between"
        maxWidth="max-content"
      >
        <Stack spacing={1} direction="column">
          <Stack direction="row" alignItems="center" spacing={1} flexGrow={1}>
            {/* The stack ensure that the icon take the defined size  */}
            <Stack height={iconSize} width={iconSize} alignItems="center">
              <CalendarRange />
            </Stack>
            <Typography data-testid="simulation-info-date">
              {date.toLocaleDateString()}
            </Typography>
          </Stack>

          <Stack pl={md ? 2 : 1} spacing={1}>
            <Stack direction="row" alignItems="center" spacing={1} flexGrow={1}>
              <Stack height={iconSize} width={iconSize} alignItems="center">
                {seasonIcon}
              </Stack>
              <Typography>{tSeasons(season)}</Typography>
            </Stack>

            <Stack direction="row" alignItems="center" spacing={1} flexGrow={1}>
              <Stack height={iconSize} width={iconSize} alignItems="center">
                <ThermometerSun />
              </Stack>
              <Typography>{tInformations('CURRENT_PERIOD.OUTDOOR')}</Typography>
              <Typography data-testid="simulation-info-outdoor-temperature">
                {outdoor.value} °C
              </Typography>
            </Stack>

            <Stack direction="row" alignItems="center" spacing={1}>
              <Stack height={iconSize} width={iconSize} alignItems="center">
                <Thermometer />
              </Stack>
              <Typography>{tInformations('CURRENT_PERIOD.INDOOR')}</Typography>
              <Typography data-testid="simulation-info-indoor-temperature">
                {indoor} °C
              </Typography>
            </Stack>

            <Stack direction="row" alignItems="center" spacing={1}>
              <Stack height={iconSize} width={iconSize} alignItems="center">
                <Heater />
              </Stack>
              <Typography>
                {tInformations('CURRENT_PERIOD.HEAT_LOSS')}
              </Typography>
              <Typography data-testid="simulation-info-heatloss">
                {heatLoss.value} {heatLoss.unit}
              </Typography>
            </Stack>
          </Stack>
        </Stack>

        <Divider orientation="vertical" variant="middle" flexItem />

        <Stack spacing={1} direction="column">
          <Stack direction="row" alignItems="center" spacing={1}>
            {tInformations('TOTAL.TITLE')}
          </Stack>

          <Stack pl={md ? 2 : 1} spacing={1}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Stack height={iconSize} width={iconSize} alignItems="center">
                <Heater />
              </Stack>
              <Typography>{tInformations('TOTAL.HEAT_LOSS')}</Typography>
              <Typography data-testid="simulation-info-tot-heatloss">
                {totalHeatLoss.value} {totalHeatLoss.unit}
              </Typography>
            </Stack>

            <Stack direction="row" alignItems="center" spacing={1}>
              <Stack height={iconSize} width={iconSize} alignItems="center">
                <Plug />
              </Stack>
              <Typography>{tInformations('TOTAL.ELECTRICITY_COST')}</Typography>
              <Typography data-testid="simulation-info-tot-electricity-cost">
                {formatNumber(electricityCost)} CHF
              </Typography>
            </Stack>

            <Stack direction="row" alignItems="center" spacing={1}>
              <Stack height={iconSize} width={iconSize} alignItems="center">
                <House />
              </Stack>
              <Stack direction="row" alignItems="baseline" spacing={1}>
                <Typography>
                  {tInformations('TOTAL.HOUSE_WALL_SIZE')}
                </Typography>
                <Typography>{formattedWallSize}</Typography>
              </Stack>
            </Stack>

            <Stack direction="row" alignItems="center" spacing={1}>
              <Stack height={iconSize} width={iconSize} alignItems="center">
                <BrickWall />
              </Stack>
              <Stack direction="row" alignItems="baseline" spacing={1}>
                <Typography>
                  {tInformations('TOTAL.HOUSE_WALL_MATERIAL_COST')}
                </Typography>
                <Typography>{formatNumber(wallsPrice)} CHF</Typography>
              </Stack>
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    </LoadingComponent>
  );
};
