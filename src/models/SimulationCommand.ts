import {
  SIMULATION_INDOOR_TEMPERATURE_CELCIUS,
  SIMULATION_PRICE_KWH,
} from '@/config/simulation';
import { OutdoorTemperature } from '@/types/temperatures';

import { HouseComponentsConfigurator } from './HouseComponentsConfigurator';
import { SimulationHeatLoss } from './SimulationHeatLoss';

type Constructor = {
  indoorTemperature: number;
  outdoorTemperature: OutdoorTemperature;
  numberOfFloors: number;
  pricekWh: number;
  prevTotHeatLoss: number;
  prevTotPowerCost: number;
  houseConfigurator: HouseComponentsConfigurator;
};

export class SimulationCommand {
  readonly indoorTemperature: number;

  readonly outdoorTemperature: OutdoorTemperature;

  readonly numberOfFloors: number;

  readonly pricekWh: number;

  readonly heatLoss: SimulationHeatLoss;

  readonly prevTotHeatLoss: number;

  readonly prevTotPowerCost: number;

  readonly houseConfigurator: HouseComponentsConfigurator;

  //   TODO: also include window size and missing props?

  constructor({
    indoorTemperature,
    outdoorTemperature,
    numberOfFloors,
    pricekWh,
    prevTotHeatLoss,
    prevTotPowerCost,
    houseConfigurator,
  }: Constructor) {
    this.indoorTemperature = indoorTemperature;
    this.outdoorTemperature = outdoorTemperature;
    this.numberOfFloors = numberOfFloors;
    this.pricekWh = pricekWh;
    this.prevTotHeatLoss = prevTotHeatLoss;
    this.prevTotPowerCost = prevTotPowerCost;
    this.houseConfigurator = houseConfigurator;
    this.heatLoss = new SimulationHeatLoss({
      indoorTemperature,
      outdoorTemperature: outdoorTemperature.value,
      houseConfigurator,
    });
  }

  public static createDefault({
    numberOfFloors,
    houseConfigurator,
  }: Pick<
    Constructor,
    'numberOfFloors' | 'houseConfigurator'
  >): SimulationCommand {
    return new SimulationCommand({
      indoorTemperature: SIMULATION_INDOOR_TEMPERATURE_CELCIUS.DEFAULT,
      outdoorTemperature: { userOverride: false, weatherValue: 0, value: 0 },
      numberOfFloors,
      pricekWh: SIMULATION_PRICE_KWH,
      prevTotHeatLoss: 0,
      prevTotPowerCost: 0,
      houseConfigurator,
    });
  }

  public from(params: Partial<Constructor>): SimulationCommand {
    return new SimulationCommand({
      indoorTemperature: params.indoorTemperature ?? this.indoorTemperature,
      outdoorTemperature: params.outdoorTemperature ?? this.outdoorTemperature,
      numberOfFloors: params.numberOfFloors ?? this.numberOfFloors,
      pricekWh: params.pricekWh ?? this.pricekWh,
      prevTotHeatLoss: params.prevTotHeatLoss ?? this.prevTotHeatLoss,
      prevTotPowerCost: params.prevTotPowerCost ?? this.prevTotPowerCost,
      houseConfigurator: params.houseConfigurator ?? this.houseConfigurator,
    });
  }
}
