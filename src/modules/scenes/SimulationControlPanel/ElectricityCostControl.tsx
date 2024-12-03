import { useTranslation } from 'react-i18next';

import { useSimulation } from '@/context/SimulationContext';
import { FormControlValidator } from '@/modules/common/FormControlValidator';

export const ElectricityCostControl = (): JSX.Element => {
  const { t } = useTranslation('SIMULATION_CONTROL_PANEL');
  const { setPricekWh } = useSimulation();

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
      label={t('ELECTRICITY_CONTROL_PANEL.ELECTRICITY_COST_LABEL')}
      value="0.22"
      onChange={(value) => handleElectricityCostChange(value)}
      validationRules={{
        min: 1e-3,
        max: 10,
        required: true,
        isNumber: true,
      }}
      unit="CHF/kWh"
    />
  );
};
