import { HeatLossPerComponent } from '@/types/houseComponent';
import { sumHeatLossRateForDay } from '@/utils/heatLoss';

type Constructor = {
  indoorTemperature: number;
  outdoorTemperature: number;
  heatLossConstantFactors: HeatLossPerComponent;
};

export class SimulationHeatLoss {
  readonly global: number;

  readonly perComponent: HeatLossPerComponent;

  constructor({
    indoorTemperature,
    outdoorTemperature,
    heatLossConstantFactors,
  }: Constructor) {
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
