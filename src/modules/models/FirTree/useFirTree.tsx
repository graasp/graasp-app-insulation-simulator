import { useGLTF } from '@react-three/drei';
import { Mesh, MeshStandardMaterial } from 'three';
import { GLTF } from 'three-stdlib';

import { MODELS_3D_ROOT_PATH } from '@/config/models';
import { useSeason } from '@/context/SeasonContext';
import { useSmoothTransitionColor } from '@/hooks/useSmoothTransitionColor';
import { Seasons } from '@/types/seasons';
import { fromRGB } from '@/utils/colors';

const GLB_FILE_PATH = `${MODELS_3D_ROOT_PATH}/FirTree.glb`;

const COLORS_BY_SEASON = {
  [Seasons.Summer]: fromRGB({ r: 0.174, g: 0.187, b: 0.097 }),
  [Seasons.Autumn]: fromRGB({ r: 0.174, g: 0.187, b: 0.097 }),
  [Seasons.Winter]: fromRGB({ r: 0.255, g: 0.255, b: 0.255 }),
  [Seasons.Spring]: fromRGB({ r: 0.174, g: 0.187, b: 0.097 }),
};

/**
 * This type has been generated with the command `npx gltfjsx`.
 * See the dedicated chapter in the README to learn more.
 */
type GLTFResult = GLTF & {
  nodes: {
    Extrusion_Spline: Mesh;
    Trunk_Extrusion_Spline: Mesh;
  };
  materials: {
    Spine: MeshStandardMaterial;
    Trunk: MeshStandardMaterial;
  };
};

type UseFirTree = {
  nodes: GLTFResult['nodes'];
  materials: GLTFResult['materials'];
};

export const useFirTree = (): UseFirTree => {
  const { season } = useSeason();
  const { nodes, materials } = useGLTF(GLB_FILE_PATH) as GLTFResult;
  const spineMaterial = useSmoothTransitionColor({
    color: COLORS_BY_SEASON[season],
    initialMaterial: materials.Spine,
  });

  return {
    nodes,
    materials: {
      Spine: spineMaterial,
      Trunk: materials.Trunk,
    },
  };
};

useGLTF.preload(GLB_FILE_PATH);
