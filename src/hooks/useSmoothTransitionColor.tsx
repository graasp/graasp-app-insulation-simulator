import { useRef } from 'react';

import { useFrame } from '@react-three/fiber';
import { Color, MeshStandardMaterial } from 'three';

const TRANSITION_SPEED = 5;

export const useSmoothTransitionColor = ({
  color,
  initialMaterial = new MeshStandardMaterial(),
}: {
  color: string | Color;
  initialMaterial?: MeshStandardMaterial;
}): MeshStandardMaterial => {
  const materialRef = useRef<MeshStandardMaterial>(initialMaterial);

  useFrame((_, delta) => {
    if (materialRef.current) {
      const targetColor = new Color(color);
      materialRef.current.color.lerp(targetColor, delta * TRANSITION_SPEED); // Smooth transition
    }
  });

  return materialRef.current ?? initialMaterial;
};
