import { useTranslation } from 'react-i18next';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';

import { HouseControl } from './HouseControl';

export const SimulationControlPanel = (): JSX.Element => {
  const { t } = useTranslation('SIMULATION_CONTROL_PANEL');
  return (
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
  );
};
