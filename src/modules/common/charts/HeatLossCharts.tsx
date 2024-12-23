import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import {
  Button,
  Tooltip as MUITooltip,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';

import { saveAs } from 'file-saver';
import { FileChartLine } from 'lucide-react';
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useCurrentPng } from 'recharts-to-png';

import { PERIODS, useChart } from '@/context/ChartContext';
import { useSimulation } from '@/context/SimulationContext';

import { ExportCSVButton } from '../ExportCSVButton';

type Props = { width: number };
export const HeatLossCharts = ({ width }: Props): JSX.Element => {
  const { t } = useTranslation('SIMULATION_GRAPHICS', {
    keyPrefix: 'HEAT_LOSS',
  });
  const { t: tExport } = useTranslation('SIMULATION_GRAPHICS', {
    keyPrefix: 'EXPORT_CHART',
  });
  const {
    days: { simulationDays, currentIdx },
  } = useSimulation('simulation');
  const { period, updatePeriod } = useChart();

  const [getPng, { ref, isLoading }] = useCurrentPng();

  const chartData = useMemo(
    () =>
      simulationDays.map((d) => ({
        name: d.date.toLocaleDateString(),
        hl: Number.parseFloat((d.heatLoss.global / 1000).toFixed(1)),
        outdoor: Math.round(d.weatherTemperature),
      })),
    [simulationDays],
  );

  const data = chartData.slice(
    Math.max(currentIdx - period.numberOfDays, 0),
    currentIdx + 1,
  );

  const handleDownload = useCallback(async () => {
    const png = await getPng();

    if (png) {
      saveAs(png, 'simulation_heatloss_chart.png');
    }
  }, [getPng]);

  return (
    <Stack spacing={2} alignItems="center">
      <ToggleButtonGroup
        value={period.numberOfDays}
        exclusive
        onChange={(_, v) => updatePeriod(v)}
        aria-label={t('PERIOD_LABEL')}
      >
        {PERIODS.map((p) => (
          <MUITooltip
            key={p.labelKey}
            title={t('PERIOD_TOOLTIP', { period: t(p.labelKey) })}
          >
            <ToggleButton value={p.numberOfDays} aria-label={t(p.labelKey)}>
              <Typography>{t(p.labelKey)}</Typography>
            </ToggleButton>
          </MUITooltip>
        ))}
      </ToggleButtonGroup>
      <LineChart
        ref={ref}
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
          name={t('HEAT_LOSS_LABEL')}
          unit=" kilowatt"
          dot={false}
          animationDuration={0}
        />

        <Line
          dataKey="outdoor"
          unit=" °C"
          name={t('OUTDOOR_LABEL')}
          dot={false}
          animationDuration={0}
        />
      </LineChart>

      <Stack direction="row" spacing={1}>
        <Button
          variant="outlined"
          startIcon={<FileChartLine />}
          onClick={handleDownload}
        >
          {isLoading
            ? tExport('DOWNLOADING_BTN_LABEL')
            : tExport('DOWNLOAD_BTN_LABEL')}
        </Button>
        <ExportCSVButton />
      </Stack>
    </Stack>
  );
};
