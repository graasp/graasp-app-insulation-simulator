import { useMemo } from 'react';

import { useSimulation } from '@/context/SimulationContext';
import { HouseComponent } from '@/types/houseComponent';

import { Wall } from './Wall';
import { GLTFResult } from './useResidentialHouse';
import { useWallGeometries } from './useWallGeometries';

export const Floor = ({
  nodes,
  materials,
  floor,
}: {
  nodes: GLTFResult['nodes'];
  materials: GLTFResult['materials'];
  floor: number;
}): JSX.Element => {
  const { wallGeometries } = useWallGeometries();
  const { getFirstOfType } = useSimulation('house');

  if (floor < 0) {
    throw new Error('The floor number can be < 0!');
  }

  const wallHeight = useMemo(
    () => getFirstOfType(HouseComponent.Wall)?.size.height ?? 0,
    [getFirstOfType],
  );

  const offSetY = wallHeight * floor;

  return (
    <group position={[0, 0.6 + offSetY, 0]}>
      <Wall
        id={`FrontWall-${floor}`}
        nodes={nodes}
        materials={materials}
        wallProps={wallGeometries.Front}
        hasDoor={floor === 0}
        hasWindows={floor !== 0}
      />
      <Wall
        id={`BackWall-${floor}`}
        nodes={nodes}
        materials={materials}
        wallProps={wallGeometries.Back}
      />
      <Wall
        id={`LeftWall-${floor}`}
        nodes={nodes}
        materials={materials}
        wallProps={wallGeometries.Left}
        hasWindows
      />
      <Wall
        id={`RightWall-${floor}`}
        nodes={nodes}
        materials={materials}
        wallProps={wallGeometries.Right}
        hasWindows
      />
    </group>
  );
};
