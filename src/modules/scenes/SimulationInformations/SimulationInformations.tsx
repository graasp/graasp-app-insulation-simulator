import { useTranslation } from 'react-i18next';

import { Divider, Stack, Typography } from '@mui/material';

import {
  CalendarRange,
  Heater,
  House,
  Plug,
  Thermometer,
  ThermometerSun,
} from 'lucide-react';

import { useSeason } from '@/context/SeasonContext';
import { useSimulation } from '@/context/SimulationContext';

import { useSimulationInformations } from './useSimulationInformations';

export const SimulationInformations = (): JSX.Element => {
  const { t: tSeasons } = useTranslation('SEASONS');
  const { t: tInformations } = useTranslation('SIMULATION_INFORMATIONS');
  const { season } = useSeason();

  const {
    indoorTemperature,
    outdoorTemperature,
    period,
    totalHeatLoss,
    electricityCost,
  } = useSimulation();

  const { seasonIcon, heatLoss, formattedWallSize } =
    useSimulationInformations();

  return (
    <Stack
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
        <Stack direction="row" alignItems="center" spacing={1}>
          <CalendarRange />
          <Typography data-testid="simulation-info-date">
            {period.to.toLocaleDateString()}
          </Typography>
        </Stack>

        <Stack pl={2} spacing={1}>
          <Stack direction="row" alignItems="center" spacing={1}>
            {seasonIcon}
            <Typography>{tSeasons(season)}</Typography>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={1}>
            <ThermometerSun />
            <Typography>{tInformations('CURRENT_PERIOD.OUTDOOR')}</Typography>
            <Typography data-testid="simulation-info-outdoor-temperature">
              {outdoorTemperature.value} °C
            </Typography>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={1}>
            <Thermometer />
            <Typography>{tInformations('CURRENT_PERIOD.INDOOR')}</Typography>
            <Typography data-testid="simulation-info-indoor-temperature">
              {indoorTemperature} °C
            </Typography>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={1}>
            <Heater />
            <Typography>{tInformations('CURRENT_PERIOD.HEAT_LOSS')}</Typography>
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

        <Stack pl={2} spacing={1}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Heater />
            <Typography>{tInformations('TOTAL.HEAT_LOSS')}</Typography>
            <Typography data-testid="simulation-info-tot-heatloss">
              {totalHeatLoss.value} {totalHeatLoss.unit}
            </Typography>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={1}>
            <Plug />
            <Typography>{tInformations('TOTAL.ELECTRICITY_COST')}</Typography>
            <Typography data-testid="simulation-info-tot-electricity-cost">
              {electricityCost} CHF
            </Typography>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={1}>
            <House />
            <Stack direction="row" alignItems="baseline" spacing={1}>
              <Typography>{tInformations('TOTAL.HOUSE_WALL_SIZE')}</Typography>
              <Typography>{formattedWallSize}</Typography>
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
};
