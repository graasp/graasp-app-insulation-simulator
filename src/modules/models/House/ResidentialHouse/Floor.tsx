import { Wall } from './Wall';
import { GLTFResult } from './useResidentialHouse';
import { useWallGeometries } from './useWallGeometries';

export const Floor = ({
  nodes,
  materials,
}: {
  nodes: GLTFResult['nodes'];
  materials: GLTFResult['materials'];
}): JSX.Element => {
  const { wallGeometries } = useWallGeometries();
  return (
    <group position={[0, 0.6, 0]}>
      <Wall
        id="FrontWall"
        nodes={nodes}
        materials={materials}
        wallProps={wallGeometries.Front}
        hasDoor
      />
      <Wall
        id="BackWall"
        nodes={nodes}
        materials={materials}
        wallProps={wallGeometries.Back}
      />
      <Wall
        id="LeftWall"
        nodes={nodes}
        materials={materials}
        wallProps={wallGeometries.Left}
        hasWindows
      />
      <Wall
        id="RightWall"
        nodes={nodes}
        materials={materials}
        wallProps={wallGeometries.Right}
        hasWindows
      />
    </group>
  );
};
