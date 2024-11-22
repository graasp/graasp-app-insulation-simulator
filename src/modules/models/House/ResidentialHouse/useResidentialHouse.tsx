import GLB_FILE_PATH from '@models/ResidentialHouse.glb?url';
import { useGLTF } from '@react-three/drei';
import { BufferGeometry, Mesh, MeshStandardMaterial, Vector3 } from 'three';
import { GLTF } from 'three-stdlib';

import { Size } from '@/types/houseComponent';
import { fromRGB } from '@/utils/colors';

const COLORS = {
  aerogel: fromRGB({ r: 1, g: 0.815, b: 0.624 }),
  brick: fromRGB({ r: 0.644, g: 0.456, b: 0.262 }),
  wood: fromRGB({ r: 0.527, g: 0.527, b: 0.527 }),
};

/**
 * This type has been generated with the command `npx gltfjsx`.
 * See the dedicated chapter in the README to learn more.
 */
export type GLTFResult = GLTF & {
  nodes: {
    Door: Mesh;
    WallBack: Mesh;
    WallFront: Mesh;
    WallLeft: Mesh;
    WallRight: Mesh;
    WindowFrame_1: Mesh;
    WindowFrame_2: Mesh;
    Base: Mesh;
    RoofGroup: Mesh;
    Roof_1: Mesh;
    Roof_2: Mesh;
    RoofWindowBack_1: Mesh;
    RoofWindowBack_2: Mesh;
    RoofWindowBack_3: Mesh;
    RoofWindowFront_1: Mesh;
    RoofWindowFront_2: Mesh;
    RoofWindowFront_3: Mesh;
  };
  materials: {
    Wood: MeshStandardMaterial;
    Wall: MeshStandardMaterial;
    Window: MeshStandardMaterial;
    Roof: MeshStandardMaterial;
  };
};

type UseResidentialHouse = {
  nodes: GLTFResult['nodes'];
  materials: GLTFResult['materials'];
};

export const getComponentSize = (geometry: BufferGeometry): Size => {
  const size = new Vector3();
  geometry.boundingBox?.getSize(size);

  const { x, y: height, z } = size;

  // We only want the height and width of the component, not the thickness.
  // Because it depends on the axes, the thickness can be x or z.
  // As the width is always greater than the thickness, we always take the larger size.
  const width = Math.max(x, z);

  return { width, height };
};

export const useResidentialHouse = (): UseResidentialHouse => {
  const { nodes, materials } = useGLTF(GLB_FILE_PATH) as GLTFResult;

  materials.Wall.color = COLORS.aerogel;

  return {
    nodes,
    materials,
  };
};

useGLTF.preload(GLB_FILE_PATH);
