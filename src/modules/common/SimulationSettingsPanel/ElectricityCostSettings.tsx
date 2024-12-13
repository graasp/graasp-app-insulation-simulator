import { useTranslation } from 'react-i18next';

import { useSimulation } from '@/context/SimulationContext';
import { FormControlValidator } from '@/modules/common/FormControlValidator';

export const ElectricityCostSettings = (): JSX.Element => {
  const { t } = useTranslation('SIMULATION_SETTINGS_PANEL');
  const { pricekWh, setPricekWh } = useSimulation();

  const handleElectricityCostChange = (newValue: string): void => {
    const newPrice = Number.parseFloat(newValue);

    if (!Number.isNaN(newPrice)) {
      setPricekWh(newPrice);
    } else {
      console.error(`Invalid price for ${newValue}`);
    }
  };

  return (
    <FormControlValidator
      label={t('ELECTRICITY_SETTINGS_PANEL.ELECTRICITY_COST_LABEL')}
      value={pricekWh.toString()}
      onChange={(value) => handleElectricityCostChange(value)}
      validationRules={{
        min: 1e-3,
        max: 2,
        required: true,
        isNumber: true,
      }}
      unit="CHF/kWh"
    />
  );
};
