import { useTranslation } from 'react-i18next';

import { FormControl, InputLabel, MenuItem, Select } from '@mui/material';

import { SIMULATION_CSV_FILES } from '@/config/simulation';
import { useSimulation } from '@/context/SimulationContext';
import { SimulationStatus } from '@/types/simulation';

const OPTIONS = Object.keys(SIMULATION_CSV_FILES.ECUBLENS);

export const SimulationDurationSettings = (): JSX.Element => {
  const { t } = useTranslation('SIMULATION_SETTINGS_PANEL', {
    keyPrefix: 'CSV_SETTINGS_PANEL',
  });

  const { t: tDates } = useTranslation('DATES');

  const { duration, status } = useSimulation('simulation');

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
      duration.update({ durationInYears: value });
    } else {
      console.error(`The duration ${newDuration} is not a valid number!`);
    }
  };

  return (
    <FormControl fullWidth>
      <InputLabel id="house-duration-select-label">
        {t('LABEL_DURATION')}
      </InputLabel>
      <Select
        labelId="house-duration-select-label"
        id="house-duration-select"
        label={t('LABEL_DURATION')}
        value={duration.years}
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
