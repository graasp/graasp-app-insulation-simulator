import { useTranslation } from 'react-i18next';

import { Slider, Stack, Typography } from '@mui/material';

import { SIMULATION_INDOOR_TEMPERATURE_CELCIUS } from '@/config/simulation';
import { useSimulation } from '@/context/SimulationContext';

export const TemperatureControl = (): JSX.Element => {
  const { t } = useTranslation('SIMULATION_CONTROL_PANEL', {
    keyPrefix: 'TEMPERATURES_CONTROL_PANEL',
  });

  const { indoorTemperature, updateIndoorTemperature } = useSimulation();
  const { MIN: minTemperature, MAX: maxTemperature } =
    SIMULATION_INDOOR_TEMPERATURE_CELCIUS;

  const formatTemperature = (value: number): string => `${value} °C`;

  return (
    <Stack>
      <Typography variant="caption">{t('INDOOR_TEMPERATURE_LABEL')}</Typography>

      <Stack direction="row" alignItems="flex-start" spacing={2}>
        <Stack flexGrow={1}>
          <Slider
            value={indoorTemperature}
            onChange={(_, value) => {
              if (typeof value === 'number') {
                updateIndoorTemperature(value);
              }
            }}
            valueLabelDisplay="auto"
            min={minTemperature}
            max={maxTemperature}
            role="slider"
            aria-label="indoor-temperature"
            data-testid="indoor-temperature-slider"
          />
          <Stack justifyContent="space-between" direction="row">
            <Typography>{formatTemperature(minTemperature)}</Typography>
            <Typography>{formatTemperature(maxTemperature)}</Typography>
          </Stack>
        </Stack>
        {/* padding use to align with the slider */}
        <Typography
          data-testid="indoor-temperature-label"
          variant="caption"
          pt={0.5}
        >
          {formatTemperature(indoorTemperature)}
        </Typography>
      </Stack>
    </Stack>
  );
};
