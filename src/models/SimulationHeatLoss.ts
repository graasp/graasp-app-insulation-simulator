import { HeatLossPerComponent } from '@/types/houseComponent';
import { TimeUnit } from '@/types/time';
import {
  calculateHeatLossConstantFactor,
  sumHeatLossRate,
} from '@/utils/heatLoss';

import { HouseComponentsConfigurator } from './HouseComponentsConfigurator';

type Constructor = {
  indoorTemperature: number;
  outdoorTemperature: number;
  houseConfigurator: HouseComponentsConfigurator;
};

export class SimulationHeatLoss {
  readonly global: number;

  readonly perComponent: HeatLossPerComponent;

  constructor({
    indoorTemperature,
    outdoorTemperature,
    houseConfigurator,
  }: Constructor) {
    // TODO: improve this code?
    const heatLossConstantFactors = houseConfigurator
      .getAll()
      .reduce<HeatLossPerComponent>(
        (acc, c) => ({
          ...acc,
          [c.houseComponentId]: calculateHeatLossConstantFactor({
            area: c.actualArea,
            materials: c.buildingMaterials,
          }),
        }),
        {},
      );

    this.perComponent = Object.entries(
      heatLossConstantFactors,
    ).reduce<HeatLossPerComponent>(
      (acc, [componentId, heatLossConstantFactor]) => ({
        ...acc,
        [componentId]: sumHeatLossRate({
          temperatures: [outdoorTemperature],
          constantFactor: heatLossConstantFactor,
          indoorTemperature,
          timeUnit: TimeUnit.Days, // TODO: to adapt or always set per day?,
        }),
      }),
      {},
    );

    this.global = Object.values(this.perComponent).reduce(
      (acc, heatLoss) => acc + heatLoss,
      0,
    );
  }
}
