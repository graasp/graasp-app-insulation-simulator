import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';

import { HouseControl } from './HouseControl';

export const SimulationControlPanel = (): JSX.Element => (
  <Accordion defaultExpanded>
    <AccordionSummary
      expandIcon={<ExpandMoreIcon />}
      aria-controls="panel-house-content"
      id="panel-house-header"
    >
      House
    </AccordionSummary>
    <AccordionDetails>
      <HouseControl />
    </AccordionDetails>
  </Accordion>
);
