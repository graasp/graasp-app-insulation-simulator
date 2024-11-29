import { useTranslation } from 'react-i18next';

import {
  FormControl,
  FormHelperText,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import { useHouseComponents } from '@/context/HouseComponentsContext';
import {
  WindowSizeType,
  WindowSizes,
  useWindowSize,
} from '@/context/WindowSizeContext';
import { HouseComponent } from '@/types/houseComponent';
import { formatComponentSize } from '@/utils/formatComponentSize';

type Props = {
  open: boolean;
  handleClose: () => void;
};

export const WindowControlDialog = ({
  open,
  handleClose,
}: Props): JSX.Element | null => {
  const { t } = useTranslation('SIMULATION_CONTROL_PANEL', {
    keyPrefix: 'HOUSE_CONTROL_PANEL.WINDOW_DIALOG',
  });
  const { t: tInsulations } = useTranslation('INSULATIONS');

  const { changeWindowSize, windowSize } = useWindowSize();
  const { houseComponentsConfigurator } = useHouseComponents();
  const windowComponent = houseComponentsConfigurator.getFirstOfType(
    HouseComponent.Window,
  );

  if (!windowComponent) {
    return null;
  }

  const windowInsulation = tInsulations(windowComponent.insulationName);

  const handleSizeChange = (newSize: string): void => {
    changeWindowSize(newSize as WindowSizeType);
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title-window"
      aria-describedby="alert-dialog-description-window"
    >
      <DialogTitle id="alert-dialog-title-window">
        {t('TITLE', { window_insulation: windowInsulation })}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description-window">
          <Stack spacing={2} pt={1}>
            <FormControl fullWidth>
              <InputLabel id="window-size-select-label">
                {t('SIZE_LABEL')}
              </InputLabel>
              <Select
                labelId="window-suze-select-label"
                id="window-size-select"
                label={t('SIZE_LABEL')}
                defaultValue={windowSize}
                onChange={(v) => handleSizeChange(v.target.value)}
              >
                {WindowSizes.map((s) => (
                  <MenuItem key={s} value={s}>
                    {t(s as WindowSizeType)}
                  </MenuItem>
                ))}
              </Select>
              <FormHelperText>
                {t('CURRENT_SIZE_LABEL')}{' '}
                {formatComponentSize({ componentSize: windowComponent.size })}
              </FormHelperText>
            </FormControl>

            <TableContainer component={Paper}>
              <Table>
                <caption>
                  {t('WINDOW_COPOSITION_TABLE.LABEL', {
                    window_insulation: windowInsulation,
                  })}
                </caption>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      {t('WINDOW_COPOSITION_TABLE.NAME_HEADER')}
                    </TableCell>
                    <TableCell>
                      {t('WINDOW_COPOSITION_TABLE.THICKNESS_HEADER')}
                    </TableCell>
                    <TableCell>
                      {t('WINDOW_COPOSITION_TABLE.THERMAL_CONDUCTIVITY_HEADER')}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {windowComponent.buildingMaterials.map((material, idx) => (
                    <TableRow key={`${material.name}-${idx}`}>
                      <TableCell component="th">{material.name}</TableCell>
                      <TableCell align="center">
                        {material.thickness * 100} cm
                      </TableCell>
                      <TableCell align="center">
                        {material.thermalConductivity} W/m·K
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Stack>
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{t('CLOSE_BUTTON')}</Button>
      </DialogActions>
    </Dialog>
  );
};
