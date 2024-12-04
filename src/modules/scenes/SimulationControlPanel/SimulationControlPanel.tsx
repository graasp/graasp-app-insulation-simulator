import { useTranslation } from 'react-i18next';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';

import { ElectricityCostControl } from './ElectricityCostControl';
import { HouseControl } from './HouseControl';
import { TemperatureControl } from './TemperatureControl';

export const SimulationControlPanel = (): JSX.Element => {
  const { t } = useTranslation('SIMULATION_CONTROL_PANEL');

  return (
    <>
      <Accordion defaultExpanded>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel-house-content"
          id="panel-house-header"
        >
          {t('HOUSE_CONTROL_PANEL.TITLE')}
        </AccordionSummary>
        <AccordionDetails>
          <HouseControl />
        </AccordionDetails>
      </Accordion>

      <Accordion defaultExpanded>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel-electricity-content"
          id="panel-electricity-header"
        >
          {t('ELECTRICITY_CONTROL_PANEL.TITLE')}
        </AccordionSummary>
        <AccordionDetails>
          <ElectricityCostControl />
        </AccordionDetails>
      </Accordion>

      <Accordion defaultExpanded>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel-temperature-content"
          id="panel-temperature-header"
        >
          {t('TEMPERATURES_CONTROL_PANEL.TITLE')}
        </AccordionSummary>
        <AccordionDetails>
          <TemperatureControl />
        </AccordionDetails>
      </Accordion>
    </>
  );
};
