import { useEffect } from 'react';

import { useHouseComponents } from '@/context/HouseComponentsContext';
import { useSimulation } from '@/context/SimulationContext';
import { HouseComponentType } from '@/types/houseComponent';

import { HeatLossArrow } from '../../HeatLossArrow/HeatLossArrow';
import { GLTFResult, getComponentSize } from './useResidentialHouse';

type Props = JSX.IntrinsicElements['group'] & {
  nodes: GLTFResult['nodes'];
  materials: GLTFResult['materials'];
  windowIdx: number;
  wallId: string;
};

export const WindowFrame = ({
  nodes,
  materials,
  windowIdx,
  wallId,
  ...props
}: Props): JSX.Element => {
  const id = `${wallId}-Window-${windowIdx}`;
  const { heatLosses } = useSimulation();
  const { registerComponent } = useHouseComponents();

  const heatLoss = heatLosses[id] ?? 0;

  useEffect(() => {
    registerComponent({
      parentId: wallId,
      componentId: id,
      size: getComponentSize(nodes.WindowFrame_2.geometry),
      componentType: HouseComponentType.Window,
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <group {...props}>
      {/* Window Frame  */}
      <mesh geometry={nodes.WindowFrame_1.geometry} material={materials.Wood} />
      {/* Windows Glasses  */}
      <mesh
        geometry={nodes.WindowFrame_2.geometry}
        material={materials.Window}
      />
      <HeatLossArrow
        rotation={[0, Math.PI / 2, 0]}
        heatLoss={heatLoss}
        position={[0, 0, -1.2]}
      />
    </group>
  );
};
