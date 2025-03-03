/*
Auto-generated by: https://github.com/pmndrs/gltfjsx
Command: npx gltfjsx@6.5.2 OriginalArrow.glb --transform --types 
Files: OriginalArrow.glb [21.84KB] > Arrow.glb [3.86KB] (82%)
Author: Alihan (https://sketchfab.com/Dare0)
License: CC-BY-4.0 (http://creativecommons.org/licenses/by/4.0/)
Source: https://sketchfab.com/3d-models/direction-arrow-6ef46718c7b242e39fcad7f27ee858a5
Title: Direction Arrow
*/
import { useRef } from 'react';

import GLB_FILE_PATH from '@models/HeatLossArrow.glb?url';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import { Color, Group, Mesh, MeshStandardMaterial, Vector3 } from 'three';
import { GLTF } from 'three-stdlib';

import { Position } from '@/types/wall';
import { formatHeatLossRate, powerConversionFactors } from '@/utils/heatLoss';

import { HeatLossTextArrow } from './HeatLossTextArrow';

type GLTFResult = GLTF & {
  nodes: {
    Arrow: Mesh;
  };
  materials: {
    Arrow: MeshStandardMaterial;
  };
};

type Props = JSX.IntrinsicElements['group'] & {
  heatLoss: number;
  position?: Position;
};

// These factors will affect the range of sizes of the arrows.
const MIN_HEATLOSS = 0;
const MAX_HEATLOSS = 5 * powerConversionFactors.KiloWatt;
const MIN_SCALE = 0.8;
const MAX_SCALE = 1.2;

const ARRAY_COLOR = new Color('red');
const TEXT_COLOR = 'white';

export const HeatLossArrow = ({
  heatLoss,
  position,
  ...props
}: Props): JSX.Element => {
  const { nodes, materials } = useGLTF(GLB_FILE_PATH) as GLTFResult;
  const material = materials.Arrow;

  const scale =
    MIN_SCALE +
    (MAX_SCALE - MIN_SCALE) *
      Math.min(
        1,
        Math.max(
          0.1,
          (heatLoss - MIN_HEATLOSS) / (MAX_HEATLOSS - MIN_HEATLOSS),
        ),
      );

  const scaleRef = useRef<Group>(null);

  useFrame((_, delta) => {
    if (scaleRef.current) {
      scaleRef.current.scale.lerp(
        new Vector3(1 * scale, 1 * scale, 1 * scale),
        delta * 3,
      ); // Smooth transition
    }
  });

  material.color = ARRAY_COLOR;

  return (
    <group ref={scaleRef} {...props} position={position} dispose={null}>
      <mesh geometry={nodes.Arrow.geometry} material={material} />
      <HeatLossTextArrow
        heatLoss={formatHeatLossRate(heatLoss)}
        color={TEXT_COLOR}
      />
    </group>
  );
};

useGLTF.preload(GLB_FILE_PATH);
