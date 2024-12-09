import { useTranslation } from 'react-i18next';

import { Checkbox, FormControlLabel, Stack } from '@mui/material';

import {
  SIMULATION_INDOOR_TEMPERATURE_CELCIUS,
  SIMULATION_OUTDOOR_TEMPERATURE_CELCIUS,
} from '@/config/simulation';
import { useSimulation } from '@/context/SimulationContext';
import { LabelledSlider } from '@/modules/common/LabelledSlider';

export const TemperatureSettings = (): JSX.Element => {
  const { t } = useTranslation('SIMULATION_SETTINGS_PANEL', {
    keyPrefix: 'TEMPERATURES_SETTINGS_PANEL',
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

  const formatTemperature = (temperature: number): string =>
    `${temperature} °C`;

  return (
    <Stack spacing={3}>
      <LabelledSlider
        dataTestId="indoor-temperature"
        label={t('INDOOR_TEMPERATURE_LABEL')}
        value={indoorTemperature}
        min={minIndoorTemperature}
        max={maxIndoorTemperature}
        onChange={updateIndoorTemperature}
        formatValue={formatTemperature}
      />

      <Stack>
        <LabelledSlider
          dataTestId="outdoor-temperature"
          label={t('OUTDOOR_TEMPERATURE_LABEL')}
          value={outdoorTemperature.value}
          min={minOutdoorTemperature}
          max={maxOutdoorTemperature}
          onChange={(v) =>
            updateOutdoorTemperature({
              override: outdoorTemperature.userOverride,
              value: v,
            })
          }
          formatValue={formatTemperature}
          disabled={!outdoorTemperature.userOverride}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={outdoorTemperature.userOverride}
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
