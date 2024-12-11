import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import { Fab, Stack, useMediaQuery, useTheme } from '@mui/material';

import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';

import { SIMULATION_FRAME_MS } from '@/config/simulation';
import { SeasonProvider } from '@/context/SeasonContext';
import { SimulationProvider, useSimulation } from '@/context/SimulationContext';
import { SimulationStatus } from '@/types/simulation';

import { LabelledSlider } from '../common/LabelledSlider';
import { Forest } from '../models/Forest';
import { Garden } from '../models/Garden';
import { ResidentialHouse } from '../models/House/ResidentialHouse/ResidentialHouse';
import { Tree } from '../models/Tree/Tree';
import { SimulationControlPanel } from './SimulationControlPanel/SimulationControlPanel';
import { SimulationInformations } from './SimulationInformations/SimulationInformations';

const FirstSceneComponent = (): JSX.Element => {
  const {
    startSimulation,
    pauseSimulation,
    gotToDay,
    currDayIdx,
    numberOfDays,
    numberOfFloors,
    status,
    getDateOf,
  } = useSimulation();

  const theme = useTheme();
  const md = useMediaQuery(theme.breakpoints.up('sm'));

  const handleGoToDay = (idx: number | number[]): void => {
    if (typeof idx === 'number') {
      gotToDay(idx);
    }
  };

  return (
    <Stack
      sx={{ background: '#fafaff' }}
      height="100%"
      direction={{ xs: 'column-reverse', md: 'row' }}
      justifyContent="center"
    >
      <Stack justifyContent="space-between" alignItems="center" flexGrow={4}>
        <SimulationInformations />

        <Canvas
          style={{
            height: md ? '500px' : '375px',
            width: md ? '500px' : '375px',
          }}
          camera={{ position: [0, 0, -35.5], fov: 30 }}
        >
          <group position={[0, -2, 0]}>
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
            <ResidentialHouse position={[0, 0, 0]} nFloors={numberOfFloors} />
            <Garden position={[0, -0.5, 0]} />
            <Tree position={[6, 0, -4]} />
            <Forest position={[6.5, 0, 3]} />
          </group>
        </Canvas>

        <Stack mt={2} alignItems="center" spacing={2}>
          <LabelledSlider
            value={currDayIdx}
            sx={{ minWidth: '350px', maxWidth: '500px' }}
            onChange={(v) => handleGoToDay(v)}
            min={0}
            max={numberOfDays - 1}
            hideValue
            formatValue={(v) => getDateOf(v).toLocaleDateString()}
          />
          <Fab
            data-testid={`simulation-control-button-${status === SimulationStatus.RUNNING ? 'pause' : 'start'}`}
            color="primary"
            onClick={
              status === SimulationStatus.RUNNING
                ? pauseSimulation
                : startSimulation
            }
          >
            {status === SimulationStatus.RUNNING ? (
              <PauseIcon />
            ) : (
              <PlayArrowIcon />
            )}
          </Fab>
        </Stack>
      </Stack>

      <Stack m={2} flexGrow={1}>
        <SimulationControlPanel />
      </Stack>
    </Stack>
  );
};

const FirstScene = (): JSX.Element => (
  <SimulationProvider simulationFrameMS={SIMULATION_FRAME_MS}>
    <SeasonProvider>
      <FirstSceneComponent />
    </SeasonProvider>
  </SimulationProvider>
);

export default FirstScene;
