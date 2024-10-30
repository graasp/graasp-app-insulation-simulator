import { useEffect, useMemo, useState } from 'react';

import { Material } from '@/types/material';
import { TimeUnitType } from '@/types/time';
import {
  calculateHeatLossConstantFactor,
  sumHeatLossRate,
} from '@/utils/heatLoss';

type Props = {
  material: Material;
  area: number;
  indoorTemperature: number;
  measurementFrequency: TimeUnitType;
  temperatures: number[];
};

type UseHeatLossReturnType = {
  heatLoss: number;
  totalHeatLoss: number;
};

export const useHeatLoss = ({
  material,
  area,
  indoorTemperature,
  measurementFrequency,
  temperatures,
}: Props): UseHeatLossReturnType => {
  const [heatLoss, setHeatLoss] = useState(0);
  const [totalHeatLoss, setTotalHeatLoss] = useState(0);

  const heatLossConstantFactor = useMemo(
    () =>
      calculateHeatLossConstantFactor({
        area,
        thermalConductivity: material.thermalConductivity,
        materialThickness: material.thickness,
      }),
    [area, material.thermalConductivity, material.thickness],
  );

  useEffect(() => {
    if (!temperatures) {
      setHeatLoss(0);
      setTotalHeatLoss(0);
      return;
    }

    const newHeatLoss = sumHeatLossRate({
      temperatures,
      constantFactor: heatLossConstantFactor,
      indoorTemperature,
      timeUnit: measurementFrequency,
    });

    setHeatLoss(newHeatLoss);
    setTotalHeatLoss((prevT) => prevT + newHeatLoss);
  }, [
    measurementFrequency,
    heatLossConstantFactor,
    temperatures,
    indoorTemperature,
  ]);

  return {
    heatLoss,
    totalHeatLoss,
  };
};
