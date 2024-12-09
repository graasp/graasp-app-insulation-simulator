import { useTranslation } from 'react-i18next';

import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';

import { SIMULATION_CSV_FILES } from '@/config/simulation';
import { useSimulation } from '@/context/SimulationContext';
import { SimulationStatus } from '@/types/simulation';
import { TimeUnit } from '@/types/time';

const OPTIONS = Object.keys(SIMULATION_CSV_FILES);

export const SimulationDurationSettings = (): JSX.Element => {
  const { t } = useTranslation('SIMULATION_SETTINGS_PANEL', {
    keyPrefix: 'DURATION_SETTINGS_PANEL',
  });

  const { t: tDates } = useTranslation('DATES');

  const { duration, updateSimulationDuration, status } = useSimulation();

  const selectIsDisabled = [
    SimulationStatus.LOADING,
    SimulationStatus.RUNNING,
  ].includes(status);

  const handleChange = (newDuration: string | number): void => {
    if (selectIsDisabled) {
      return;
    }

    const value =
      typeof newDuration === 'number'
        ? newDuration
        : Number.parseInt(newDuration, 10);

    if (!Number.isNaN(value)) {
      updateSimulationDuration({ value, unit: TimeUnit.Years });
    } else {
      console.error(`The duration ${newDuration} is not a valid number!`);
    }
  };

  return (
    <FormControl fullWidth>
      <InputLabel id="house-duration-select-label">{t('LABEL')}</InputLabel>
      <Select
        labelId="house-duration-select-label"
        id="house-duration-select"
        label={t('LABEL')}
        value={duration.value}
        onChange={(e) => handleChange(e.target.value)}
        type="number"
        disabled={selectIsDisabled}
      >
        {OPTIONS.map((years) => (
          <MenuItem key={years} value={years}>
            {tDates('YEARS', {
              count: Number.parseInt(years, 10),
            })}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};
