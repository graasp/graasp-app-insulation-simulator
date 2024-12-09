import { useTranslation } from 'react-i18next';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { styled, useMediaQuery, useTheme } from '@mui/material';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';

import { ElectricityCostControl } from './ElectricityCostControl';
import { HouseControl } from './HouseControl';
import { SimulationDurationControl } from './SimulationDurationControl';
import { TemperatureControl } from './TemperatureControl/TemperatureControl';

const AccordionContainer = styled(Accordion, {
  shouldForwardProp: (prop) => prop !== 'md',
})<{ md: boolean }>(({ md }) => ({
  maxHeight: md ? '95vh' : undefined,
  overflowY: md ? 'auto' : undefined,
  padding: md ? 2 : undefined,
  paddingRight: md ? 4 : undefined,
  backgroundColor: '#f5f5f8',
}));

export const SimulationControlPanel = (): JSX.Element => {
  const { t } = useTranslation('SIMULATION_CONTROL_PANEL');
  const theme = useTheme();
  const md = useMediaQuery(theme.breakpoints.up('sm'));

  return (
    <AccordionContainer defaultExpanded={md} md={md}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel-simulation-content"
        id="panel-simulation-header"
      >
        {t('TITLE')}
      </AccordionSummary>
      <AccordionDetails>
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
      </AccordionDetails>
    </AccordionContainer>
  );
};
