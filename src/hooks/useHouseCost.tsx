import { useMemo } from 'react';

import { useSimulation } from '@/context/SimulationContext';
import { HouseComponent } from '@/types/houseComponent';

export const useHouseCost = (): { wallCost: number } => {
  const {
    house: { getByType },
  } = useSimulation();

  const wallCost = useMemo(
    () =>
      getByType(HouseComponent.Wall).reduce(
        (totCost, houseComponent) =>
          totCost +
          houseComponent.actualArea *
            houseComponent.buildingMaterials.reduce(
              (componentCost, material) =>
                componentCost + material.price * material.thickness,
              0,
            ),
        0,
      ),
    [getByType],
  );

  return { wallCost };
};
