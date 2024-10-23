import { Button, Stack, Typography } from '@mui/material';

import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';

import { SeasonProvider, useSeason } from '@/context/SeasonContext';
import {
  SimulationProvider,
  SimulationStatus,
  useSimulation,
} from '@/context/SimulationContext';
import {
  TemperatureProvider,
  useTemperature,
} from '@/context/TemperatureContext';

import { Forest } from '../models/Forest';
import { Garden } from '../models/Garden';
import { House } from '../models/House/House';
import { Tree } from '../models/Tree/Tree';

const FirstSceneComponent = (): JSX.Element => {
  const { season } = useSeason();
  // TODO: is progression should come from temperature?
  const {
    meanTemperature: outdoorTemperature,
    period,
    progression,
  } = useTemperature();
  const {
    indoorTemperature,
    heatLoss,
    start,
    status,
    totalHeatLoss,
    electricityCost,
  } = useSimulation();

  return (
    <>
      <Stack position="absolute" zIndex={1} spacing={1} p={2}>
        <Button
          variant="contained"
          onClick={start}
          disabled={status === SimulationStatus.RUNNING}
        >
          {status === SimulationStatus.RUNNING ? 'Running...' : 'Start'}
        </Button>
        <Stack spacing={1}>
          <Stack>
            <Typography variant="h6">Simulation duration: 25 years</Typography>
            <Stack pl={2}>
              <Typography>Progression: {progression.progress}%</Typography>
              <Typography>Time left: {progression.timeLeft}s</Typography>
            </Stack>
          </Stack>
          <Stack>
            <Typography>Current period: {period.duration}</Typography>
            <Stack pl={2}>
              <Typography>From: {period.from.toLocaleDateString()}</Typography>
              <Typography>To: {period.to.toLocaleDateString()}</Typography>
              <Typography>Season: {season}</Typography>
              <Typography>
                Outdoor Temperature (mean): {outdoorTemperature} °C
              </Typography>
              <Typography>
                Indoor Temperature: {indoorTemperature} °C
              </Typography>
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
        camera={{ position: [10, 1, -15], fov: 75 }}
      >
        <color attach="background" args={[0x87ceeb]} />
        {/* Ambient Light for overall illumination */}
        <ambientLight intensity={1.2} />
        {/* Main Sunlight Simulation */}
        <directionalLight
          position={[6, 30, -10]}
          intensity={2}
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
  <TemperatureProvider>
    <SimulationProvider>
      <SeasonProvider>
        <FirstSceneComponent />
      </SeasonProvider>
    </SimulationProvider>
  </TemperatureProvider>
);

export default FirstScene;
