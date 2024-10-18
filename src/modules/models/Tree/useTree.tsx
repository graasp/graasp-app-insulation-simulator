import { useGLTF } from '@react-three/drei';
import { Mesh, MeshStandardMaterial } from 'three';
import { GLTF } from 'three-stdlib';

import { MODELS_3D_ROOT_PATH } from '@/config/models';
import { useSeason } from '@/context/SeasonContext';
import { Season, Seasons } from '@/types/seasons';
import { fromRGB } from '@/utils/colors';

const GLB_FILE_PATH = `${MODELS_3D_ROOT_PATH}/Tree.glb`;

const COLORS_BY_SEASON = {
  [Seasons.Summer]: fromRGB({ r: 0.174, g: 0.187, b: 0.097 }),
  [Seasons.Fall]: fromRGB({ r: 0.249, g: 0.141, b: 0 }),
  [Seasons.Winter]: fromRGB({ r: 0.23, g: 0.23, b: 0.25 }),
  [Seasons.Spring]: fromRGB({ r: 0.255, g: 0.184, b: 0.238 }),
};

/**
 * This type has been generated with the command `npx gltfjsx`.
 * See the dedicated chapter in the README to learn more.
 */
type GLTFResult = GLTF & {
  nodes: {
    Lofted_Patch: Mesh;
    Extrusion_Spline: Mesh;
  };
  materials: {
    Leaf: MeshStandardMaterial;
    Trunk: MeshStandardMaterial;
  };
};

type UseTree = {
  season: Season;
  nodes: GLTFResult['nodes'];
  materials: GLTFResult['materials'];
};

export const useTree = (): UseTree => {
  const { season } = useSeason();
  const { nodes, materials } = useGLTF(GLB_FILE_PATH) as GLTFResult;
  const leafMaterial = new MeshStandardMaterial().copy(materials.Leaf);
  leafMaterial.color = COLORS_BY_SEASON[season];

  return {
    season,
    nodes,
    materials: {
      Leaf: leafMaterial,
      Trunk: materials.Trunk,
    },
  };
};

useGLTF.preload(GLB_FILE_PATH);
