import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import { useSimulation } from '@/context/SimulationContext';

type Period = {
  numberOfDays: number;
  labelKey:
    | 'ONE_MONTH'
    | 'THREE_MONTHS'
    | 'SIX_MONTHS'
    | 'ONE_YEAR'
    | 'THREE_YEARS';
};

const PERIODS: Period[] = [
  { numberOfDays: 30, labelKey: 'ONE_MONTH' },
  { numberOfDays: 90, labelKey: 'THREE_MONTHS' },
  { numberOfDays: 180, labelKey: 'SIX_MONTHS' },
  { numberOfDays: 365, labelKey: 'ONE_YEAR' },
  { numberOfDays: 1_095, labelKey: 'THREE_YEARS' },
] as const;

type Props = { width: number };
export const HeatLossCharts = ({ width }: Props): JSX.Element => {
  const { t } = useTranslation('SIMULATION_GRAPHICS', {
    keyPrefix: 'HEAT_LOSS',
  });
  const {
    days: { simulationDays, currentIdx },
  } = useSimulation('simulation');

  const [period, setPeriod] = useState(PERIODS[0]);

  const data = simulationDays
    .slice(Math.max(currentIdx - period.numberOfDays, 0), currentIdx + 1)
    .map((d) => ({
      name: d.date.toLocaleDateString(),
      hl: Number.parseFloat((d.heatLoss.global / 1000).toFixed(1)),
      outdoor: Math.round(d.weatherTemperature),
    }));

  const handlePeriodChange = (value: number): void => {
    setPeriod(PERIODS.find((p) => value === p.numberOfDays) ?? PERIODS[0]);
  };

  return (
    <Stack spacing={2} alignItems="center">
      <ToggleButtonGroup
        value={period.numberOfDays}
        exclusive
        onChange={(_, v) => handlePeriodChange(v)}
        aria-label="graphic period"
      >
        {PERIODS.map((p) => (
          <ToggleButton
            key={p.labelKey}
            value={p.numberOfDays}
            aria-label={t(p.labelKey)}
          >
            <Typography>{t(p.labelKey)}</Typography>
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      <LineChart
        width={width}
        height={300}
        data={data}
        margin={{
          top: 10,
          right: 5,
          left: 10,
          bottom: 10,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis domain={[0.5, 30]} />
        <Tooltip />
        <Legend />
        <Line
          type="monotone"
          dataKey="hl"
          stroke="#8884d8"
          activeDot={{ r: 8 }}
          name="Heat Loss"
          unit=" kilowatt"
          dot={false}
          animationDuration={0}
        />

        <Line
          dataKey="outdoor"
          unit=" °C"
          name="Outdoor"
          dot={false}
          animationDuration={0}
        />
      </LineChart>
    </Stack>
  );
};
