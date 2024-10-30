import { useTranslation } from 'react-i18next';

import { Button, Stack, Typography } from '@mui/material';

import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';

import { SIMULATION_CSV_FILE, SIMULATION_FRAME_MS } from '@/config/simulation';
import { SeasonProvider, useSeason } from '@/context/SeasonContext';
import { SimulationProvider, useSimulation } from '@/context/SimulationContext';
import { TRANSLATIONS } from '@/langs/constants';
import { SimulationStatus } from '@/types/simulation';
import { formatHoursToDays } from '@/utils/time';

import { Forest } from '../models/Forest';
import { Garden } from '../models/Garden';
import { House } from '../models/House/House';
import { Tree } from '../models/Tree/Tree';

const FirstSceneComponent = (): JSX.Element => {
  const { t } = useTranslation();
  const { season } = useSeason();

  const {
    indoorTemperature,
    outdoorTemperature,
    period,
    progression,
    heatLoss,
    startSimulation,
    status,
    totalHeatLoss,
    electricityCost,
    duration,
  } = useSimulation();

  const formattedHours = formatHoursToDays(period.durationInHours);

  return (
    <>
      {/* TODO: for debug, will be removed in new release */}
      <Stack position="absolute" zIndex={1} spacing={1} p={2}>
        <Button
          variant="contained"
          onClick={startSimulation}
          disabled={status === SimulationStatus.RUNNING}
        >
          {status === SimulationStatus.RUNNING ? 'Running...' : 'Start'}
        </Button>
        <Stack spacing={1}>
          <Stack>
            <Typography variant="h6">
              Simulation duration:{' '}
              {t(TRANSLATIONS[duration.unit], { count: duration.value })}
            </Typography>
            <Stack pl={2}>
              <Typography>Progression: {progression.progress}%</Typography>
              <Typography>Time left: {progression.timeLeft}s</Typography>
            </Stack>
          </Stack>
          <Stack>
            <Typography>
              Current period:{' '}
              {t(TRANSLATIONS[formattedHours.unit], {
                count: formattedHours.value,
              })}
            </Typography>
            <Stack pl={2}>
              <Typography>From: {period.from.toLocaleDateString()}</Typography>
              <Typography>To: {period.to.toLocaleDateString()}</Typography>
              <Typography>Season: {season}</Typography>
              <Typography>Outdoor (mean): {outdoorTemperature} °C</Typography>
              <Typography>Indoor: {indoorTemperature} °C</Typography>
              <Typography>
                Heat Loss: {heatLoss.value} {heatLoss.unit}
              </Typography>
            </Stack>
          </Stack>
          <Typography>
            Total Heat Loss: {totalHeatLoss.value} {totalHeatLoss.unit}
          </Typography>
          <Typography>Total Electricity cost: {electricityCost}.-</Typography>
        </Stack>
      </Stack>
      <Canvas
        style={{ height: '100vh', width: '100vw' }}
        camera={{ position: [10, 1, -20], fov: 75 }}
      >
        {/* Ambient Light for overall illumination */}
        <ambientLight intensity={1.5} />
        {/* Main Sunlight Simulation */}
        <directionalLight
          position={[6, 30, -10]}
          intensity={2.5}
          color={0xffffff}
        />
        <OrbitControls
          enableDamping
          dampingFactor={0.05}
          minPolarAngle={Math.PI / 6} // Minimum angle
          maxPolarAngle={Math.PI / 2.5} // Maximum angle
          enableZoom={false}
          maxDistance={150}
        />
        <House position={[0, 0, 0]} />
        <Garden position={[0, -0.5, 0]} />
        <Tree position={[6, 0, -2]} />
        <Forest position={[6, 0, 1]} />
      </Canvas>
    </>
  );
};

const FirstScene = (): JSX.Element => (
  <SimulationProvider
    csv={SIMULATION_CSV_FILE}
    simulationFrameMS={SIMULATION_FRAME_MS}
  >
    <SeasonProvider>
      <FirstSceneComponent />
    </SeasonProvider>
  </SimulationProvider>
);

export default FirstScene;
