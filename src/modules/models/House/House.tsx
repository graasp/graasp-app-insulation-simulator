/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.5.2 OriginalHouse.glb --transform --types 
Files: OriginalHouse.glb [250.7KB] > House.glb [16.05KB] (94%)
Model: "Residential Houses" from: https://www.sloyd.ai/ 
*/
import { GroupProps } from '@react-three/fiber';

import { useHouse } from './useHouse';

type Props = GroupProps;

export const House = (props: Props): JSX.Element => {
  const { nodes, materials } = useHouse();

  /**
   * This code has been generated with the command `npx gltfjsx`.
   * See the dedicated chapter in the README to learn more.
   */
  return (
    <group {...props} dispose={null}>
      <mesh
        geometry={nodes.Cube.geometry}
        material={materials.Wall}
        position={[0, 0.6, 0]}
        rotation={[-Math.PI, 0, -Math.PI]}
      />
      <mesh
        geometry={nodes.Door.geometry}
        material={materials.Wood}
        position={[0.55, 0.675, -4.445]}
      />
      <mesh
        geometry={nodes.Window.geometry}
        material={materials.Window}
        position={[4.075, 1.564, -2.635]}
      />
      <mesh
        geometry={nodes.Spline.geometry}
        material={materials.Roof}
        position={[0, 3.45, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      />
    </group>
  );
};
