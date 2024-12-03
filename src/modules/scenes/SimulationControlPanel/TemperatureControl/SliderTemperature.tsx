import { Slider, Stack, Typography } from '@mui/material';

type Props = {
  dataTestId: string;
  label: string;
  value: number;
  disabled?: boolean;
  minTemperature: number;
  maxTemperature: number;
  onChange: (newValue: number) => void;
};

export const SliderTemperature = ({
  dataTestId,
  label,
  value,
  disabled = false,
  minTemperature,
  maxTemperature,
  onChange,
}: Props): JSX.Element => {
  const formatTemperature = (temperature: number): string =>
    `${temperature} °C`;

  return (
    <Stack>
      <Typography variant="caption">{label}</Typography>

      <Stack direction="row" alignItems="flex-start" spacing={2}>
        <Stack flexGrow={1}>
          <Slider
            value={value}
            onChange={(_, v) => {
              if (typeof v === 'number') {
                onChange(v);
              }
            }}
            valueLabelDisplay="auto"
            min={minTemperature}
            max={maxTemperature}
            role="slider"
            aria-label={dataTestId}
            data-testid={`${dataTestId}-slider`}
            disabled={disabled}
          />
          <Stack justifyContent="space-between" direction="row">
            <Typography>{formatTemperature(minTemperature)}</Typography>
            <Typography>{formatTemperature(maxTemperature)}</Typography>
          </Stack>
        </Stack>
        {/* padding use to align with the slider */}
        <Typography
          data-testid={`${dataTestId}-label`}
          variant="caption"
          pt={0.5}
        >
          {formatTemperature(value)}
        </Typography>
      </Stack>
    </Stack>
  );
};
