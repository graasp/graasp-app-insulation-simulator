import { HeatLossPerComponent } from '@/types/houseComponent';
import {
  calculateHeatLossConstantFactor,
  sumHeatLossRateForDay,
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
        [componentId]: sumHeatLossRateForDay({
          temperature: outdoorTemperature,
          constantFactor: heatLossConstantFactor,
          indoorTemperature,
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
