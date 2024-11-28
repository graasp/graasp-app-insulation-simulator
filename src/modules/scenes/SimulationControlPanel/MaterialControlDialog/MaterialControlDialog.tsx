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
  const {
    currTab,
    updateTab,
    wallMaterials,
    handleThicknessChange,
    handlePriceChange,
  } = useMaterialControlDialog();

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title-material"
      aria-describedby="alert-dialog-description-material"
    >
      <DialogTitle id="alert-dialog-title-material">
        House Wall Materials
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description-material">
          <TabContext value={currTab}>
            <Stack sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <TabList onChange={(_, v) => updateTab(v)}>
                {wallMaterials?.map((w) => (
                  <Tab key={w.name} label={w.name} value={w.name} />
                ))}
              </TabList>
            </Stack>

            {wallMaterials?.map((w) => (
              <TabPanel key={w.name} value={w.name}>
                <Stack spacing={2}>
                  <FormControlValidator
                    label="Price"
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
                    label="Thickness"
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
                      Thermal Conductivity
                    </InputLabel>
                    <OutlinedInput
                      id="outlined-adornment-thermal-conductivity"
                      disabled
                      value={w.thermalConductivity}
                      label="Thermal Conductivity"
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
        <Button onClick={handleClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};
