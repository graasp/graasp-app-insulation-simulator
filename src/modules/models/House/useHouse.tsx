import { useEffect, useState } from 'react';

import { useGLTF } from '@react-three/drei';
import { Mesh, MeshStandardMaterial } from 'three';
import { GLTF } from 'three-stdlib';

import { MODELS_3D_ROOT_PATH } from '@/config/models';
import { fromRGB } from '@/utils/colors';

const GLB_FILE_PATH = `${MODELS_3D_ROOT_PATH}/House.glb`;

const COLORS = {
  aerogel: fromRGB({ r: 1, g: 0.815, b: 0.624 }),
  brick: fromRGB({ r: 0.644, g: 0.456, b: 0.262 }),
  wood: fromRGB({ r: 0.527, g: 0.527, b: 0.527 }),
};
const allColors = Object.keys(COLORS) as (keyof typeof COLORS)[];

/**
 * This type has been generated with the command `npx gltfjsx`.
 * See the dedicated chapter in the README to learn more.
 */
type GLTFResult = GLTF & {
  nodes: {
    Cube: Mesh;
    Door: Mesh;
    Window: Mesh;
    Spline: Mesh;
  };
  materials: {
    Wall: MeshStandardMaterial;
    Wood: MeshStandardMaterial;
    Window: MeshStandardMaterial;
    Roof: MeshStandardMaterial;
  };
};

type UseHouse = {
  nodes: GLTFResult['nodes'];
  materials: GLTFResult['materials'];
};

export const useHouse = (): UseHouse => {
  const { nodes, materials } = useGLTF(GLB_FILE_PATH) as GLTFResult;

  const material = new MeshStandardMaterial().copy(materials.Wall);
  material.color = COLORS.aerogel;

  const [wallMaterial, setWallMaterial] = useState({
    idx: 0,
    material,
  });

  // TODO: Demo only, will be removed
  useEffect(() => {
    const intervalId = setInterval(() => {
      setWallMaterial((prev) => {
        const nextIdx = (prev.idx + 1) % allColors.length;
        material.color = COLORS[allColors[nextIdx]];

        return {
          idx: nextIdx,
          material,
        };
      });
    }, 5_000);

    return () => {
      clearInterval(intervalId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    nodes,
    materials: {
      ...materials,
      Wall: wallMaterial.material,
    },
  };
};

useGLTF.preload(GLB_FILE_PATH);
