import { useTranslation } from 'react-i18next';

import { TabContext, TabList, TabPanel } from '@mui/lab';
import {
  FormControl,
  InputAdornment,
  InputLabel,
  OutlinedInput,
  Stack,
  Tab,
} from '@mui/material';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';

import { BuildingMaterialKeys } from '@/config/buildingMaterials';

import { FormControlValidator } from './FormControlValidator';
import { useMaterialControlDialog } from './useMaterialControlDialog';

type Props = {
  open: boolean;
  handleClose: () => void;
};

export const MaterialControlDialog = ({
  open,
  handleClose,
}: Props): JSX.Element => {
  const { t } = useTranslation('SIMULATION_CONTROL_PANEL', {
    keyPrefix: 'HOUSE_CONTROL_PANEL.MATERIAL_DIALOG',
  });
  const { t: tMaterials } = useTranslation('MATERIALS');
  const { t: tInsulations } = useTranslation('INSULATIONS');

  const {
    currTab,
    updateTab,
    wallMaterials,
    wallInsulation,
    handleThicknessChange,
    handlePriceChange,
  } = useMaterialControlDialog();

  const insulationName = wallInsulation ? tInsulations(wallInsulation) : '';

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title-material"
      aria-describedby="alert-dialog-description-material"
    >
      <DialogTitle id="alert-dialog-title-material">
        {t('TITLE', { insulation: insulationName })}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description-material">
          <TabContext value={currTab}>
            <Stack sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <TabList onChange={(_, v) => updateTab(v)}>
                {wallMaterials?.map((w) => (
                  <Tab
                    key={w.name}
                    label={tMaterials(w.name as BuildingMaterialKeys)}
                    value={w.name}
                  />
                ))}
              </TabList>
            </Stack>

            {wallMaterials?.map((w) => (
              <TabPanel key={w.name} value={w.name}>
                <Stack spacing={2}>
                  <FormControlValidator
                    label={t('PRICE_LABEL')}
                    value={String(w.price)}
                    onChange={(newValue) =>
                      handlePriceChange(w.name, Number.parseFloat(newValue))
                    }
                    validationRules={{
                      required: true,
                      isNumber: true,
                      min: 0,
                      max: 100_000,
                    }}
                    inputType="number"
                    unit={
                      <>
                        CHF/m<sup>3</sup>
                      </>
                    }
                  />

                  <FormControlValidator
                    label={t('THICKNESS_LABEL')}
                    value={String(w.thickness * 100)}
                    onChange={(newValue) =>
                      handleThicknessChange(
                        w.name,
                        Number.parseFloat(newValue) / 100,
                      )
                    }
                    validationRules={{
                      required: true,
                      isNumber: true,
                      min: 1e-5,
                      max: 100,
                      customRules: [
                        // Should not equals to 0 because of the equation:
                        // We divide by the thickness, so we should not divide by 0!
                        {
                          test: (v) => Number.parseFloat(v) !== 0,
                          message: 'Cannot equals to 0.',
                        },
                      ],
                    }}
                    inputType="number"
                    unit="cm"
                  />

                  <FormControl fullWidth>
                    <InputLabel htmlFor="outlined-adornment-thermal-conductivity">
                      {t('THERMAL_CONDUCTIVITY_LABEL')}
                    </InputLabel>
                    <OutlinedInput
                      id="outlined-adornment-thermal-conductivity"
                      disabled
                      value={w.thermalConductivity}
                      label={t('THERMAL_CONDUCTIVITY_LABEL')}
                      endAdornment={
                        <InputAdornment position="end">W/m·K</InputAdornment>
                      }
                    />
                  </FormControl>
                </Stack>
              </TabPanel>
            ))}
          </TabContext>
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>{t('CLOSE_BUTTON')}</Button>
      </DialogActions>
    </Dialog>
  );
};
