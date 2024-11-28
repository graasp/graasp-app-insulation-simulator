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
          <Typography>{period.from.toLocaleDateString()}</Typography>
        </Stack>

        <Stack pl={2} spacing={1}>
          <Stack direction="row" alignItems="center" spacing={1}>
            {seasonIcon}
            <Typography>{season}</Typography>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={1}>
            <ThermometerSun />
            <Typography>Outdoor</Typography>
            <Typography>{outdoorTemperature} °C</Typography>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={1}>
            <Thermometer />
            <Typography>Indoor</Typography>
            <Typography>{indoorTemperature} °C</Typography>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={1}>
            <Heater />
            <Typography>Heat Loss</Typography>
            <Typography>
              {heatLoss.value} {heatLoss.unit}
            </Typography>
          </Stack>
        </Stack>
      </Stack>

      <Divider orientation="vertical" variant="middle" flexItem />

      <Stack spacing={1} direction="column">
        <Stack direction="row" alignItems="center" spacing={1}>
          Total
        </Stack>

        <Stack pl={2} spacing={1}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <Heater />
            <Typography>Heat Loss</Typography>
            <Typography>
              {totalHeatLoss.value} {totalHeatLoss.unit}
            </Typography>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={1}>
            <Plug />
            <Typography>Electricity Cost</Typography>
            <Typography>{electricityCost} CHF</Typography>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={1}>
            <House />
            <Stack direction="row" alignItems="baseline" spacing={1}>
              <Typography>House Walls</Typography>
              <Typography>{formattedWallSize}</Typography>
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
};
