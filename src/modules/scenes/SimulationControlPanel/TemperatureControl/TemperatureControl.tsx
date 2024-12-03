import { useTranslation } from 'react-i18next';

import { Checkbox, FormControlLabel, Stack } from '@mui/material';

import {
  SIMULATION_INDOOR_TEMPERATURE_CELCIUS,
  SIMULATION_OUTDOOR_TEMPERATURE_CELCIUS,
} from '@/config/simulation';
import { useSimulation } from '@/context/SimulationContext';

import { SliderTemperature } from './SliderTemperature';

export const TemperatureControl = (): JSX.Element => {
  const { t } = useTranslation('SIMULATION_CONTROL_PANEL', {
    keyPrefix: 'TEMPERATURES_CONTROL_PANEL',
  });

  const {
    indoorTemperature,
    updateIndoorTemperature,
    outdoorTemperature,
    updateOutdoorTemperature,
  } = useSimulation();

  const { MIN: minIndoorTemperature, MAX: maxIndoorTemperature } =
    SIMULATION_INDOOR_TEMPERATURE_CELCIUS;

  const { MIN: minOutdoorTemperature, MAX: maxOutdoorTemperature } =
    SIMULATION_OUTDOOR_TEMPERATURE_CELCIUS;

  return (
    <Stack spacing={3}>
      <SliderTemperature
        dataTestId="indoor-temperature"
        label={t('INDOOR_TEMPERATURE_LABEL')}
        value={indoorTemperature}
        minTemperature={minIndoorTemperature}
        maxTemperature={maxIndoorTemperature}
        onChange={updateIndoorTemperature}
      />

      <Stack>
        <SliderTemperature
          dataTestId="outdoor-temperature"
          label={t('OUTDOOR_TEMPERATURE_LABEL')}
          value={outdoorTemperature.value}
          minTemperature={minOutdoorTemperature}
          maxTemperature={maxOutdoorTemperature}
          onChange={(v) =>
            updateOutdoorTemperature({
              override: outdoorTemperature.override,
              value: v,
            })
          }
          disabled={!outdoorTemperature.override}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={outdoorTemperature.override}
              onChange={(_, checked) =>
                updateOutdoorTemperature({
                  override: checked,
                  value: outdoorTemperature.value,
                })
              }
            />
          }
          label={t('OUTDOOR_TEMPERATURE_OVERRIDE_LABEL')}
        />
      </Stack>
    </Stack>
  );
};
