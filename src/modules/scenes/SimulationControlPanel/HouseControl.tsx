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
  const { changeComponentInsulation } = useHouseComponents();

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
            <InputLabel id="wall-material-select-label">Material</InputLabel>
            <Select
              labelId="wall-material-select-label"
              id="wall-material-select"
              label="Material"
              defaultValue={
                SIMULATION_DEFAULT_WALL_COMPONENT_INSULATION.insulationName
              }
              onChange={(v) => handleInsulationChange(v.target.value)}
            >
              {Object.keys(HOUSE_INSULATIONS.Wall).map((k) => (
                <MenuItem key={k} value={k}>
                  {k}
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
              Window Insulation
            </InputLabel>
            <Select
              labelId="window-insulation-select-label"
              id="window-insulation-select"
              label="Window Insulation"
              defaultValue={
                SIMULATION_DEFAULT_WINDOW_COMPONENT_INSULATION.insulationName
              }
              onChange={(v) => handleWindowChange(v.target.value)}
            >
              {Object.keys(HOUSE_INSULATIONS.Window).map((k) => (
                <MenuItem key={k} value={k}>
                  {k}
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
      </Stack>
    </>
  );
};
