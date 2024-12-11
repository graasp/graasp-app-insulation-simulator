import equal from 'deep-equal';

import {
  SIMULATION_INDOOR_TEMPERATURE_CELCIUS,
  SIMULATION_PRICE_KWH,
} from '@/config/simulation';
import { OutdoorTemperature } from '@/types/temperatures';
import { WindowSizeType } from '@/types/window';

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
  windowSize: WindowSizeType;
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

  readonly windowSize: WindowSizeType;

  constructor({
    indoorTemperature,
    outdoorTemperature,
    numberOfFloors,
    pricekWh,
    prevTotHeatLoss,
    prevTotPowerCost,
    houseConfigurator,
    windowSize,
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
    this.windowSize = windowSize;
  }

  public static createDefault(): SimulationCommand {
    return new SimulationCommand({
      indoorTemperature: SIMULATION_INDOOR_TEMPERATURE_CELCIUS.DEFAULT,
      outdoorTemperature: { userOverride: false, weatherValue: 0, value: 0 },
      numberOfFloors: 1,
      pricekWh: SIMULATION_PRICE_KWH,
      prevTotHeatLoss: 0,
      prevTotPowerCost: 0,
      houseConfigurator: HouseComponentsConfigurator.create(),
      windowSize: 'Medium',
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
      windowSize: params.windowSize ?? this.windowSize,
    });
  }

  public equalsTo(params: Partial<Constructor>): boolean {
    return Object.entries(params).every(([k, v]) =>
      equal(this[k as keyof typeof this], v),
    );
  }
}
