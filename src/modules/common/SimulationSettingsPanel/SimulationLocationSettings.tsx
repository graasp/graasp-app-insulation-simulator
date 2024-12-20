import { useTranslation } from 'react-i18next';

import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';

import { SIMULATION_CSV_FILES, WeatherLocation } from '@/config/simulation';
import { useSimulation } from '@/context/SimulationContext';
import { SimulationStatus } from '@/types/simulation';

const OPTIONS = Object.keys(SIMULATION_CSV_FILES);

export const SimulationLocationSettings = (): JSX.Element => {
  const { t } = useTranslation('SIMULATION_SETTINGS_PANEL', {
    keyPrefix: 'CSV_SETTINGS_PANEL',
  });
  const { t: tLocations } = useTranslation('LOCATIONS');

  const { status, location } = useSimulation('simulation');

  const selectIsDisabled = [
    SimulationStatus.LOADING,
    SimulationStatus.RUNNING,
  ].includes(status);

  const handleChange = (newlocation: string): void => {
    if (selectIsDisabled) {
      return;
    }

    location.update(newlocation as WeatherLocation);
  };

  return (
    <FormControl fullWidth>
      <InputLabel id="house-location-select-label">
        {t('LABEL_LOCATION')}
      </InputLabel>
      <Select
        labelId="house-location-select-label"
        id="house-location-select"
        label={t('LABEL_LOCATION')}
        value={location.value}
        onChange={(e) => handleChange(e.target.value)}
        type="number"
        disabled={selectIsDisabled}
      >
        {OPTIONS.map((loc) => (
          <MenuItem key={loc} value={loc}>
            {tLocations(loc as WeatherLocation)}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
