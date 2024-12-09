import { useTranslation } from 'react-i18next';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { styled, useMediaQuery, useTheme } from '@mui/material';
import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';

import { ElectricityCostSettings } from './ElectricityCostSettings';
import { HouseSettings } from './HouseSettings';
import { SimulationDurationSettings } from './SimulationDurationSettings';
import { TemperatureSettings } from './TemperatureSettings';

const AccordionContainer = styled(Accordion, {
  shouldForwardProp: (prop) => prop !== 'md',
})<{ md: boolean }>(({ md }) => ({
  maxHeight: md ? '95vh' : undefined,
  overflowY: md ? 'auto' : undefined,
  padding: md ? 2 : undefined,
  paddingRight: md ? 4 : undefined,
  backgroundColor: '#f5f5f8',
}));

export const SimulationSettingsPanel = (): JSX.Element => {
  const { t } = useTranslation('SIMULATION_SETTINGS_PANEL');
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
            {t('DURATION_SETTINGS_PANEL.TITLE')}
          </AccordionSummary>
          <AccordionDetails>
            <SimulationDurationSettings />
          </AccordionDetails>
        </Accordion>

        <Accordion defaultExpanded>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel-house-content"
            id="panel-house-header"
          >
            {t('HOUSE_SETTINGS_PANEL.TITLE')}
          </AccordionSummary>
          <AccordionDetails>
            <HouseSettings />
          </AccordionDetails>
        </Accordion>

        <Accordion defaultExpanded>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel-electricity-content"
            id="panel-electricity-header"
          >
            {t('ELECTRICITY_SETTINGS_PANEL.TITLE')}
          </AccordionSummary>
          <AccordionDetails>
            <ElectricityCostSettings />
          </AccordionDetails>
        </Accordion>

        <Accordion defaultExpanded>
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            aria-controls="panel-temperature-content"
            id="panel-temperature-header"
          >
            {t('TEMPERATURES_SETTINGS_PANEL.TITLE')}
          </AccordionSummary>
          <AccordionDetails>
            <TemperatureSettings />
          </AccordionDetails>
        </Accordion>
      </AccordionDetails>
    </AccordionContainer>
  );
};
