import { useEffect, useMemo, useState } from 'react';

import { HouseComponents } from '@/models/HouseComponents';
import { HeatLossPerComponent } from '@/types/houseComponent';
import { TimeUnitType } from '@/types/time';
import {
  calculateHeatLossConstantFactor,
  sumHeatLossRate,
} from '@/utils/heatLoss';

type Props = {
  houseComponents: HouseComponents;
  indoorTemperature: number;
  measurementFrequency: TimeUnitType;
  temperatures: number[];
};

type UseHeatLossReturnType = {
  heatLosses: HeatLossPerComponent;
  totalHeatLoss: number;
};

export const useHeatLoss = ({
  houseComponents,
  indoorTemperature,
  measurementFrequency,
  temperatures,
}: Props): UseHeatLossReturnType => {
  const [heatLossPerComponent, setHeatLossPerComponent] =
    useState<HeatLossPerComponent>({});
  const [totalHeatLoss, setTotalHeatLoss] = useState(0);

  // Compute the constant factors per house's components
  const heatLossConstantFactors = useMemo(
    () =>
      houseComponents.getAll().reduce<HeatLossPerComponent>(
        (acc, c) => ({
          ...acc,
          [c.id]: calculateHeatLossConstantFactor({
            area: c.actualArea,
            materials: c.materials,
          }),
        }),
        {},
      ),
    [houseComponents],
  );

  useEffect(() => {
    if (!temperatures) {
      setHeatLossPerComponent({});
      setTotalHeatLoss(0);
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
    setTotalHeatLoss(
      (prevT) =>
        prevT +
        Object.values(newHeatLossPerComponent).reduce(
          (acc, heatLoss) => acc + heatLoss,
          0,
        ),
    );
  }, [
    measurementFrequency,
    temperatures,
    indoorTemperature,
    heatLossConstantFactors,
  ]);

  return {
    heatLosses: heatLossPerComponent,
    totalHeatLoss,
  };
};
