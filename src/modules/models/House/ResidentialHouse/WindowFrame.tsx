import { GLTFResult } from './useResidentialHouse';

type Props = JSX.IntrinsicElements['group'] & {
  nodes: GLTFResult['nodes'];
  materials: GLTFResult['materials'];
};

export const WindowFrame = ({
  nodes,
  materials,
  ...props
}: Props): JSX.Element => (
  <group {...props}>
    <mesh geometry={nodes.WindowFrame_1.geometry} material={materials.Wood} />
    <mesh geometry={nodes.WindowFrame_2.geometry} material={materials.Window} />
  </group>
);
