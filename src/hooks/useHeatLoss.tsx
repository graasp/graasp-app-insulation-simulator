import { useEffect, useMemo, useState } from 'react';

import { HouseComponentsConfigurator } from '@/models/HouseComponentsConfigurator';
import { HeatLossPerComponent } from '@/types/houseComponent';
import { TimeUnitType } from '@/types/time';
import {
  calculateHeatLossConstantFactor,
  sumHeatLossRate,
} from '@/utils/heatLoss';

type Props = {
  houseComponentsConfigurator: HouseComponentsConfigurator;
  indoorTemperature: number;
  measurementFrequency: TimeUnitType;
  temperatures: number[];
};

type UseHeatLossReturnType = {
  heatLossPerComponent: HeatLossPerComponent;
  heatLoss: number;
};

export const useHeatLoss = ({
  houseComponentsConfigurator,
  indoorTemperature,
  measurementFrequency,
  temperatures,
}: Props): UseHeatLossReturnType => {
  const [heatLossPerComponent, setHeatLossPerComponent] =
    useState<HeatLossPerComponent>({});

  // Compute the constant factors per house's components
  const heatLossConstantFactors = useMemo(
    () =>
      houseComponentsConfigurator.getAll().reduce<HeatLossPerComponent>(
        (acc, c) => ({
          ...acc,
          [c.houseComponentId]: calculateHeatLossConstantFactor({
            area: c.actualArea,
            materials: c.buildingMaterials,
          }),
        }),
        {},
      ),
    [houseComponentsConfigurator],
  );

  useEffect(() => {
    if (!temperatures) {
      setHeatLossPerComponent({});
      return;
    }

    const newHeatLossPerComponent = Object.entries(
      heatLossConstantFactors,
    ).reduce<HeatLossPerComponent>(
      (acc, [componentId, heatLossConstantFactor]) => ({
        ...acc,
        [componentId]: sumHeatLossRate({
          temperatures,
          constantFactor: heatLossConstantFactor,
          indoorTemperature,
          timeUnit: measurementFrequency,
        }),
      }),
      {},
    );

    setHeatLossPerComponent(newHeatLossPerComponent);
  }, [
    measurementFrequency,
    temperatures,
    indoorTemperature,
    heatLossConstantFactors,
  ]);

  return {
    heatLossPerComponent,
    heatLoss: Object.values(heatLossPerComponent).reduce(
      (acc, heatLoss) => acc + heatLoss,
      0,
    ),
  };
};
