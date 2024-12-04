import { useTranslation } from 'react-i18next';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { useMediaQuery, useTheme } from '@mui/material';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';

import { ElectricityCostControl } from './ElectricityCostControl';
import { HouseControl } from './HouseControl';
import { SimulationDurationControl } from './SimulationDurationControl';
import { TemperatureControl } from './TemperatureControl/TemperatureControl';

export const SimulationControlPanel = (): JSX.Element => {
  const { t } = useTranslation('SIMULATION_CONTROL_PANEL');
  const theme = useTheme();
  const sm = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <div
      style={
        sm
          ? {}
          : {
              maxHeight: '95vh',
              overflowY: 'auto',
              padding: 3,
            }
      }
    >
      <Accordion defaultExpanded>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          aria-controls="panel-duration-content"
          id="panel-duration-header"
        >
          {t('DURATION_CONTROL_PANEL.TITLE')}
        </AccordionSummary>
        <AccordionDetails>
          <SimulationDurationControl />
        </AccordionDetails>
      </Accordion>

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
    </div>
  );
};
