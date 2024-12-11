import { Slider, Stack, SxProps, Typography } from '@mui/material';

type Props = {
  dataTestId?: string;
  label?: string;
  hideValue?: boolean;
  value: number;
  disabled?: boolean;
  min: number;
  max: number;
  sx?: SxProps;
  formatValue?: (value: number) => string;
  onChange: (newValue: number) => void;
};

export const LabelledSlider = ({
  dataTestId,
  label,
  value,
  disabled = false,
  hideValue = false,
  min,
  max,
  sx,
  formatValue = (v) => `${v}`,
  onChange,
}: Props): JSX.Element => (
  <Stack>
    {label && <Typography variant="caption">{label}</Typography>}

    <Stack direction="row" alignItems="flex-start" spacing={2}>
      <Stack flexGrow={1}>
        <Slider
          sx={sx}
          value={value}
          onChange={(_, v) => {
            if (typeof v === 'number') {
              onChange(v);
            }
          }}
          valueLabelDisplay="auto"
          valueLabelFormat={(v) => formatValue(v)}
          min={min}
          max={max}
          role="slider"
          aria-label={dataTestId}
          data-testid={`${dataTestId}-slider`}
          disabled={disabled}
        />
        <Stack justifyContent="space-between" direction="row">
          <Typography>{formatValue(min)}</Typography>
          <Typography>{formatValue(max)}</Typography>
        </Stack>
      </Stack>
      {/* padding use to align with the slider */}
      {!hideValue && (
        <Typography
          data-testid={`${dataTestId}-label`}
          variant="caption"
          pt={0.5}
        >
          {formatValue(value)}
        </Typography>
      )}
    </Stack>
  </Stack>
);
