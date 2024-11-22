import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { Fab, Stack } from '@mui/material';

import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';

import { SIMULATION_CSV_FILE, SIMULATION_FRAME_MS } from '@/config/simulation';
import { HouseComponentsProvider } from '@/context/HouseComponentsContext';
import { SeasonProvider } from '@/context/SeasonContext';
import { SimulationProvider, useSimulation } from '@/context/SimulationContext';
import { SimulationStatus } from '@/types/simulation';

import { Forest } from '../models/Forest';
import { Garden } from '../models/Garden';
import { ResidentialHouse } from '../models/House/ResidentialHouse/ResidentialHouse';
import { Tree } from '../models/Tree/Tree';
import { SimulationInformations } from './SimulationInformations/SimulationInformations';

const FirstSceneComponent = (): JSX.Element => {
  const { startSimulation, status } = useSimulation();

  return (
    <Stack sx={{ background: '#fafaff' }} height="100vh" alignItems="center">
      <SimulationInformations />

      <Canvas
        style={{ height: '400px' }}
        camera={{ position: [10, 1, -15], fov: 60 }}
      >
        <color attach="background" args={[0xfafaff]} />
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
          minPolarAngle={Math.PI / 2.5} // Minimum angle
          maxPolarAngle={Math.PI / 2.5} // Maximum angle
          enableZoom={false}
          maxDistance={150}
          enablePan={false}
        />
        <ResidentialHouse position={[0, 0, 0]} />
        <Garden position={[0, -0.5, 0]} />
        <Tree position={[6, 0, -4]} />
        <Forest position={[6.5, 0, 3]} />
      </Canvas>

      <Stack mt={2}>
        <Fab
          color="primary"
          onClick={startSimulation}
          disabled={status === SimulationStatus.RUNNING}
        >
          {status === SimulationStatus.RUNNING ? (
            <PauseIcon />
          ) : (
            <PlayArrowIcon />
          )}
        </Fab>
      </Stack>
    </Stack>
  );
};

const FirstScene = (): JSX.Element => (
  <HouseComponentsProvider>
    <SimulationProvider
      csv={SIMULATION_CSV_FILE}
      simulationFrameMS={SIMULATION_FRAME_MS}
    >
      <SeasonProvider>
        <FirstSceneComponent />
      </SeasonProvider>
    </SimulationProvider>
  </HouseComponentsProvider>
);

export default FirstScene;
