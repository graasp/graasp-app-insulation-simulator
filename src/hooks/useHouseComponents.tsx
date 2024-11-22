import { useCallback, useRef, useState } from 'react';

import { Vector2 } from 'three';

import { HouseComponentType, HouseComponents } from '@/types/houseComponent';
import { Material } from '@/types/material';

export type RegisterComponentParams = {
  id: string;
  size: Vector2;
  componentType: HouseComponentType;
};

type UseHouseComponentsReturnType = {
  houseComponents: HouseComponents;
  registerComponent: (params: RegisterComponentParams) => void;
};

type Props = {
  materials: Map<HouseComponentType, Material>;
};

export const useHouseComponents = ({
  materials,
}: Props): UseHouseComponentsReturnType => {
  const houseComponentsRegister = useRef<HouseComponents>(new Map());
  const [houseComponents, setHouseComponents] = useState<HouseComponents>(
    () => new Map(),
  );

  const registerComponent = useCallback(
    ({ id, size, componentType }: RegisterComponentParams): void => {
      const material = materials.get(componentType);

      if (!material) {
        throw new Error(
          `No material was found for the component ${componentType}`,
        );
      }

      // The ref is used here to avoid concurrency of updating the state.
      // Without the ref, if multiple components register at the same time,
      // only the last call to registerComponent will be set in the state.
      houseComponentsRegister.current.set(id, {
        area: size.x * size.y,
        material,
      });
      setHouseComponents(houseComponentsRegister.current);
    },
    [houseComponentsRegister, materials],
  );

  return {
    houseComponents,
    registerComponent,
  };
};
