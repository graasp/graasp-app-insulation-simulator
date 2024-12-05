import { HouseComponentsConfigurator } from './HouseComponentsConfigurator';

type Constructor = {
  readonly indoorTemperature: number;
  readonly outdoorTemperature: number;
  readonly numberOfFloors: number;
  readonly powerCost: number;
  readonly heatLoss: number;
  readonly totalHeatLoss: number;
  readonly totalElectricityCost: number;
  readonly houseConfigurator: HouseComponentsConfigurator;
};

export class SimulationCommand {
  readonly indoorTemperature: number;

  readonly outdoorTemperature: number;

  readonly numberOfFloors: number;

  readonly powerCost: number;

  readonly heatLoss: number;

  readonly totalHeatLoss: number;

  readonly totalElectricityCost: number;

  readonly houseConfigurator: HouseComponentsConfigurator;

  //   TODO: also include window size and missing props?

  constructor({
    indoorTemperature,
    outdoorTemperature,
    numberOfFloors,
    powerCost,
    heatLoss,
    totalHeatLoss,
    totalElectricityCost,
    houseConfigurator,
  }: Constructor) {
    this.indoorTemperature = indoorTemperature;
    this.outdoorTemperature = outdoorTemperature;
    this.numberOfFloors = numberOfFloors;
    this.powerCost = powerCost;
    this.heatLoss = heatLoss;
    this.totalHeatLoss = totalHeatLoss;
    this.totalElectricityCost = totalElectricityCost;
    this.houseConfigurator = houseConfigurator;
  }
}
