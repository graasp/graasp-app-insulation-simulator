import { memo, useEffect } from 'react';

import { useHouseComponents } from '@/context/HouseComponentsContext';
import { useSimulation } from '@/context/SimulationContext';
import { useWallMaterial } from '@/hooks/useWallMaterial';
import { HouseComponent } from '@/types/houseComponent';
import { WallProps } from '@/types/wall';

import { HeatLossArrow } from '../../HeatLossArrow/HeatLossArrow';
import { WindowFrame } from './WindowFrame';
import { GLTFResult, getComponentSize } from './useResidentialHouse';

const WallComponent = ({
  id,
  nodes,
  materials,
  hasDoor = false,
  hasWindows = false,
  wallProps,
}: {
  id: string;
  nodes: GLTFResult['nodes'];
  materials: GLTFResult['materials'];
  hasDoor?: boolean;
  hasWindows?: boolean;
  wallProps: WallProps;
}): JSX.Element => {
  const { heatLossPerComponent } = useSimulation();
  const { registerComponent, unregisterComponent } = useHouseComponents();
  const heatLoss = heatLossPerComponent[id] ?? 0;

  const material = useWallMaterial({ wallMaterial: materials.Wall });

  useEffect(() => {
    registerComponent({
      componentId: id,
      size: getComponentSize(nodes[wallProps.geometryKey].geometry),
      componentType: HouseComponent.Wall,
    });

    return () => unregisterComponent({ componentId: id });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <group position={wallProps.position}>
      {/* The wall Mesh */}
      <mesh
        geometry={nodes[wallProps.geometryKey].geometry}
        material={material}
      />
      <HeatLossArrow
        rotation={wallProps.arrow.rotation}
        heatLoss={heatLoss}
        position={wallProps.arrow.position}
      />
      {/* The door Mesh */}
      {hasDoor && (
        <mesh
          geometry={nodes.Door.geometry}
          material={materials.Wood}
          rotation={wallProps.rotation}
          position={wallProps.doorPosition}
        />
      )}
      {hasWindows &&
        wallProps.windows.positions.map((pos, idx) => (
          <WindowFrame
            wallId={id}
            windowIdx={idx}
            key={pos.toString()}
            nodes={nodes}
            materials={materials}
            position={pos}
            rotation={wallProps.rotation}
          />
        ))}
    </group>
  );
};

export const Wall = memo(WallComponent);
