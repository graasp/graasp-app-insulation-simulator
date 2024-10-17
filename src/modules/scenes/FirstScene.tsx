import { useEffect } from 'react';

import { OrbitControls } from '@react-three/drei';
import { Canvas } from '@react-three/fiber';

import { SeasonProvider, useSeason } from '@/context/SeasonContext';

import { Forest } from '../models/Forest';
import { Garden } from '../models/Garden';
import { House } from '../models/House/House';
import { Tree } from '../models/Tree/Tree';

const FirstSceneComponent = (): JSX.Element => {
  const { nextSeason } = useSeason();

  // TODO: Demo only, will be removed
  useEffect(() => {
    const intervalId = setInterval(() => {
      nextSeason();
    }, 3_000);

    return () => {
      clearInterval(intervalId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
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
  );
};

const FirstScene = (): JSX.Element => (
  <SeasonProvider>
    <FirstSceneComponent />
  </SeasonProvider>
);

export default FirstScene;
