import { GLTFResult } from './useResidentialHouse';

export const BaseHome = ({
  nodes,
  materials,
}: {
  nodes: GLTFResult['nodes'];
  materials: GLTFResult['materials'];
}): JSX.Element => (
  <mesh
    geometry={nodes.Base.geometry}
    material={materials.Wood}
    rotation={[-Math.PI, 0, -Math.PI]}
  />
);
