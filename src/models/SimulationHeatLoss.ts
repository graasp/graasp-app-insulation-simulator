import {
  HeatLossPerComponent,
  HeatLossPerComponentEntries,
} from '@/types/houseComponent';
import { sumHeatLossRateForDay } from '@/utils/heatLoss';

type Constructor = {
  indoorTemperature: number;
  outdoorTemperature: number;
  heatLossConstantFactors: HeatLossPerComponentEntries;
};

export class SimulationHeatLoss {
  readonly global: number;

  readonly perComponent: HeatLossPerComponent;

  constructor({
    indoorTemperature,
    outdoorTemperature,
    heatLossConstantFactors,
  }: Constructor) {
    const perComponent: HeatLossPerComponent = {};
    let global = 0;

    // Have to use for-loop for performances issues with reduce.
    for (let i = 0; i < heatLossConstantFactors.length; i += 1) {
      const [componentId, heatLossConstantFactor] = heatLossConstantFactors[i];
      const heatLoss = sumHeatLossRateForDay({
        temperature: outdoorTemperature,
        constantFactor: heatLossConstantFactor,
        indoorTemperature,
      });
      perComponent[componentId] = heatLoss;
      global += heatLoss;
    }

    this.perComponent = perComponent;
    this.global = global;
  }
}
