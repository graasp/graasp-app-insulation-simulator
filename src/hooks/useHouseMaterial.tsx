import { useEffect, useMemo, useState } from 'react';

import { Color, Material, MeshStandardMaterial } from 'three';

import { useHouseComponents } from '@/context/HouseComponentsContext';
import { HouseComponent } from '@/types/houseComponent';

type Props = {
  houseMaterial: Material;
  houseComponent: HouseComponent;
  colors: { [name: string]: Color };
};

export const useHouseMaterial = ({
  houseMaterial,
  houseComponent,
  colors,
}: Props): Material => {
  const { houseComponentsConfigurator } = useHouseComponents();

  // Use memo to avoid too many renrenders
  const houseComponentMaterials = useMemo(
    () => houseComponentsConfigurator.getFirstOfType(houseComponent),
    [houseComponent, houseComponentsConfigurator],
  );

  const [newMaterial, setNewMaterial] = useState(() => houseMaterial);

  useEffect(() => {
    if (houseComponentMaterials) {
      setNewMaterial((curr) => {
        const copiedMaterial = new MeshStandardMaterial().copy(curr);
        const color = colors[houseComponentMaterials.insulationName];

        if (!color) {
          throw new Error(
            `No color was found for the ${houseComponent} insulation ${houseComponentMaterials.insulationName}!`,
          );
        }

        copiedMaterial.color = color;

        return copiedMaterial;
      });
    }
  }, [colors, houseComponent, houseComponentMaterials]);

  return newMaterial;
};
