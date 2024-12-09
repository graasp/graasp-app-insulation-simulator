import { useMediaQuery, useTheme } from '@mui/material';

import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';

import { useSimulation } from '@/context/SimulationContext';

import { Forest } from '../models/Forest';
import { Garden } from '../models/Garden';
import { ResidentialHouse } from '../models/House/ResidentialHouse/ResidentialHouse';
import { Tree } from '../models/Tree/Tree';

export const SimulationCanvas = (): JSX.Element => {
  const { numberOfFloors } = useSimulation();

  const theme = useTheme();
  const md = useMediaQuery(theme.breakpoints.up('sm'));

  return (
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
  );
};
