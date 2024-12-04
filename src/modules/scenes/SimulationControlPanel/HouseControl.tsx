import { useTranslation } from 'react-i18next';

import {
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
} from '@mui/material';

import { SlidersHorizontal } from 'lucide-react';

import {
  HOUSE_INSULATIONS,
  HouseInsulationPerComponent,
} from '@/config/houseInsulations';
import {
  SIMULATION_DEFAULT_WALL_COMPONENT_INSULATION,
  SIMULATION_DEFAULT_WINDOW_COMPONENT_INSULATION,
} from '@/config/simulation';
import { useHouseComponents } from '@/context/HouseComponentsContext';
import { useDialogControl } from '@/hooks/useDialogControl';
import { HouseComponent } from '@/types/houseComponent';

import { MaterialControlDialog } from './MaterialControlDialog/MaterialControlDialog';
import { WindowControlDialog } from './WindowControlDialog/WindowControlDialog';

export const HouseControl = (): JSX.Element => {
  const { t } = useTranslation('SIMULATION_CONTROL_PANEL');
  const { t: tInsulations } = useTranslation('INSULATIONS');
  const { changeComponentInsulation, numberOfFloors, updateNumberOfFloors } =
    useHouseComponents();

  const wallInsulations = Object.keys(
    HOUSE_INSULATIONS.Wall,
  ) as (keyof typeof HOUSE_INSULATIONS.Wall)[];

  const windowInsulations = Object.keys(
    HOUSE_INSULATIONS.Window,
  ) as (keyof typeof HOUSE_INSULATIONS.Window)[];

  const {
    open: openMaterials,
    handleOpen: handleOpenMaterials,
    handleClose: handleCloseMaterials,
  } = useDialogControl();

  const {
    open: openWindows,
    handleOpen: handleOpenWindows,
    handleClose: handleCloseWindows,
  } = useDialogControl();

  const handleInsulationChange = (newValue: string): void => {
    changeComponentInsulation({
      componentType: HouseComponent.Wall,
      newInsulation: newValue as keyof typeof HouseInsulationPerComponent.Wall,
    });
  };

  const handleWindowChange = (newValue: string): void => {
    changeComponentInsulation({
      componentType: HouseComponent.Window,
      newInsulation:
        newValue as keyof typeof HouseInsulationPerComponent.Window,
    });
  };

  const handleNumberOfFloorsChange = (floors: number | string): void => {
    updateNumberOfFloors(
      typeof floors === 'number' ? floors : Number.parseInt(floors, 10),
    );
  };

  return (
    <>
      <MaterialControlDialog
        open={openMaterials}
        handleClose={handleCloseMaterials}
      />
      <WindowControlDialog
        open={openWindows}
        handleClose={handleCloseWindows}
      />
      <Stack spacing={2}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <FormControl fullWidth>
            <InputLabel id="wall-material-select-label">
              {t('HOUSE_CONTROL_PANEL.WALL_INSULATION_SELECT_LABEL')}
            </InputLabel>
            <Select
              labelId="wall-material-select-label"
              id="wall-material-select"
              label={t('HOUSE_CONTROL_PANEL.WALL_INSULATION_SELECT_LABEL')}
              defaultValue={
                SIMULATION_DEFAULT_WALL_COMPONENT_INSULATION.insulationName
              }
              onChange={(v) => handleInsulationChange(v.target.value)}
            >
              {wallInsulations.map((k) => (
                <MenuItem key={k} value={k}>
                  {tInsulations(k)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Avoid to deform the icon button  */}
          <IconButton
            sx={{ maxHeight: 'min-content' }}
            onClick={handleOpenMaterials}
          >
            <SlidersHorizontal />
          </IconButton>
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1}>
          <FormControl fullWidth>
            <InputLabel id="window-insulation-select-label">
              {t('HOUSE_CONTROL_PANEL.WINDOW_INSULATION_SELECT_LABEL')}
            </InputLabel>
            <Select
              labelId="window-insulation-select-label"
              id="window-insulation-select"
              label={t('HOUSE_CONTROL_PANEL.WINDOW_INSULATION_SELECT_LABEL')}
              defaultValue={
                SIMULATION_DEFAULT_WINDOW_COMPONENT_INSULATION.insulationName
              }
              onChange={(v) => handleWindowChange(v.target.value)}
            >
              {windowInsulations.map((k) => (
                <MenuItem key={k} value={k}>
                  {tInsulations(k)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Avoid to deform the icon button  */}
          <IconButton
            sx={{ maxHeight: 'min-content' }}
            onClick={handleOpenWindows}
          >
            <SlidersHorizontal />
          </IconButton>
        </Stack>

        <FormControl fullWidth>
          <InputLabel id="house-floors-select-label">
            {t('HOUSE_CONTROL_PANEL.HOUSE_SIZE.LABEL')}
          </InputLabel>
          <Select
            labelId="house-floors-select-label"
            id="house-floors-select"
            label={t('HOUSE_CONTROL_PANEL.HOUSE_SIZE.LABEL')}
            value={numberOfFloors}
            onChange={(e) => handleNumberOfFloorsChange(e.target.value)}
            type="number"
          >
            {Array.from(Array(2)).map((_, idx) => (
              <MenuItem key={idx} value={idx + 1}>
                {t('HOUSE_CONTROL_PANEL.HOUSE_SIZE.N_FLOORS', {
                  count: idx + 1,
                })}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>
    </>
  );
};
