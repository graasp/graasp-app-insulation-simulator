import { useSimulation } from '@/context/SimulationContext';
import { useWallMaterial } from '@/hooks/useWallMaterial';
import { useWindowMaterial } from '@/hooks/useWindowMaterial';
import { HouseComponent } from '@/types/houseComponent';

import { GLTFResult } from './useResidentialHouse';

const RoofWindows = ({
  nodes,
  materials,
}: {
  nodes: GLTFResult['nodes'];
  materials: GLTFResult['materials'];
}): JSX.Element => {
  const { frameMaterial } = useWindowMaterial({
    windowMaterial: materials.Roof,
  });

  return (
    <>
      <group position={[0.4, 0.952, -4.05]} rotation={[-Math.PI, 0, -Math.PI]}>
        <mesh
          geometry={nodes.RoofWindowBack_1.geometry}
          material={frameMaterial}
        />
        <mesh
          geometry={nodes.RoofWindowBack_2.geometry}
          material={materials.Window}
        />
        <mesh
          geometry={nodes.RoofWindowBack_3.geometry}
          material={frameMaterial}
        />
      </group>
      <group position={[-0.4, 0.952, 4.05]}>
        <mesh
          geometry={nodes.RoofWindowFront_1.geometry}
          material={frameMaterial}
        />
        <mesh
          geometry={nodes.RoofWindowFront_2.geometry}
          material={materials.Window}
        />
        <mesh
          geometry={nodes.RoofWindowFront_3.geometry}
          material={frameMaterial}
        />
      </group>
    </>
  );
};

export const Roof = ({
  nodes,
  materials,
  nFloors,
}: {
  nodes: GLTFResult['nodes'];
  materials: GLTFResult['materials'];
  nFloors: number;
}): JSX.Element => {
  const wallMaterial = useWallMaterial({ wallMaterial: materials.Wall });
  const { houseComponentsConfigurator } = useSimulation();

  if (nFloors <= 0) {
    throw new Error('The house must at least have one floor!');
  }

  const wallHeight =
    houseComponentsConfigurator.getFirstOfType(HouseComponent.Wall)?.size
      .height ?? 0;

  const offsetY = wallHeight * (nFloors - 1);

  return (
    <mesh
      geometry={nodes.RoofGroup.geometry}
      material={wallMaterial}
      position={[0, 3.45 + offsetY, 0]}
      rotation={[-Math.PI, 0, -Math.PI]}
    >
      <group rotation={[-Math.PI / 2, 0, Math.PI]}>
        <mesh geometry={nodes.Roof_1.geometry} material={materials.Roof} />
        <mesh geometry={nodes.Roof_2.geometry} material={materials.Wood} />
      </group>

      <RoofWindows nodes={nodes} materials={materials} />
    </mesh>
  );
};
