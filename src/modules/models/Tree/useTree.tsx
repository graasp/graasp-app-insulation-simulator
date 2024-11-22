import GLB_FILE_PATH from '@models/Tree.glb?url';
import { useGLTF } from '@react-three/drei';
import { Mesh, MeshStandardMaterial } from 'three';
import { GLTF } from 'three-stdlib';

import { useSeason } from '@/context/SeasonContext';
import { useSmoothTransitionColor } from '@/hooks/useSmoothTransitionColor';
import { Season, Seasons } from '@/types/seasons';
import { fromRGB } from '@/utils/colors';

const COLORS_BY_SEASON = {
  [Seasons.Summer]: fromRGB({ r: 0.174, g: 0.187, b: 0.097 }),
  [Seasons.Autumn]: fromRGB({ r: 0.249, g: 0.141, b: 0 }),
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
  const leafMaterial = useSmoothTransitionColor({
    color: COLORS_BY_SEASON[season],
    initialMaterial: materials.Leaf,
  });

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
