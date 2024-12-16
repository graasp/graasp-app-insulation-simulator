import { useMemo } from 'react';

import { Color, Material, MeshStandardMaterial } from 'three';

import { useSimulation } from '@/context/SimulationContext';
import { HouseComponent } from '@/types/houseComponent';

type Props = {
  houseMaterial: Material;
  houseComponent: HouseComponent;
  colors: { [name: string]: Color };
  defaultColor?: Color;
};

export const useHouseMaterial = ({
  houseMaterial,
  houseComponent,
  colors,
  defaultColor,
}: Props): Material => {
  const { houseComponentsConfigurator } = useSimulation();

  // Use memo to avoid too many renrenders and optimize performances
  const houseComponentMaterials = useMemo(
    () => houseComponentsConfigurator.getFirstOfType(houseComponent),
    [houseComponent, houseComponentsConfigurator],
  );

  const copiedMaterial = new MeshStandardMaterial().copy(houseMaterial);

  if (houseComponentMaterials) {
    const color = colors[houseComponentMaterials.insulationName];

    if (!color) {
      throw new Error(
        `No color was found for the ${houseComponent} insulation ${houseComponentMaterials.insulationName}!`,
      );
    }

    copiedMaterial.color = color;
  } else if (defaultColor) {
    copiedMaterial.color = defaultColor;
  }

  return copiedMaterial;
};
