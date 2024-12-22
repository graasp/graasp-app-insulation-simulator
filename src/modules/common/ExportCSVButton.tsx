import { useTranslation } from 'react-i18next';

import { Button } from '@mui/material';

import { FileSpreadsheet } from 'lucide-react';
import Papa from 'papaparse';

import { useSimulation } from '@/context/SimulationContext';
import { useHouseCost } from '@/hooks/useHouseCost';

export const ExportCSVButton = (): JSX.Element => {
  const { t } = useTranslation('SIMULATION_GRAPHICS', {
    keyPrefix: 'EXPORT_CSV',
  });

  const {
    simulation: {
      days: { simulationDays },
    },
    temperatures: { indoor, outdoor },
    electricity: { pricekWh },
  } = useSimulation();

  const { wallCost } = useHouseCost();

  const handleClick = (): void => {
    const data = simulationDays.map((d) => ({
      'date (UTC)': d.date.toUTCString(),
      'indoor (°C)': indoor,
      'outdoor (°C)': outdoor.value,
      'heat loss (W)': d.heatLoss.global,
      'total heat loss (W)': d.totalHeatLoss,
      'price kWh (CHF)': pricekWh,
      'total electricity cost (CHF)': d.totalElectricityCost,
      'wall cost (CHF)': wallCost,
    }));

    const csv = Papa.unparse(data);
    const csvData = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const csvURL = URL.createObjectURL(csvData);

    const link = document.createElement('a');
    link.href = csvURL;
    link.download = `Insulation_Simulator_Data${new Date().getTime()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <Button
      startIcon={<FileSpreadsheet />}
      variant="contained"
      onClick={handleClick}
    >
      {t('DOWNLOAD_BTN_LABEL')}
    </Button>
  );
};
