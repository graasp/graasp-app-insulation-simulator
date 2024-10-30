/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.5.2 OriginalTree.glb --transform --types 
Files: OriginalTree.glb [121.14KB] > Tree.glb [16.13KB] (87%)
Model: "Trees" from: https://www.sloyd.ai/ 
*/
import { GroupProps } from '@react-three/fiber';

import { useTree } from './useTree';

type Props = GroupProps;

export const Tree = (props: Props): JSX.Element => {
  const { nodes, materials } = useTree();

  /**
   * This code has been generated with the command `npx gltfjsx`.
   * See the dedicated chapter in the README to learn more.
   */
  return (
    <group {...props} dispose={null}>
      <mesh
        geometry={nodes.Lofted_Patch.geometry}
        material={materials.Leaf}
        position={[0, 1.227, 0]}
      />
      <mesh
        geometry={nodes.Extrusion_Spline.geometry}
        material={materials.Trunk}
        position={[0, 1.636, 0.06]}
        rotation={[-1.187, 0, 0]}
      />
    </group>
  );
};
