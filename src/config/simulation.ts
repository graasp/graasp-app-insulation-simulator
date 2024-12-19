import { HouseComponentInsulation } from '@/types/houseComponentInsulation';

import {
  HOUSE_INSULATIONS,
  HouseInsulationPerComponent,
} from './houseInsulations';

export const SIMULATION_FRAME_MS = 150;
export const SIMULATION_CSV_FILES = {
  1: 'temperatures/predictions_1_year.csv',
  25: 'temperatures/predictions_25_year.csv',
} as const;

export const SIMULATION_INDOOR_TEMPERATURE_CELCIUS = {
  DEFAULT: 22,
  MIN: 5,
  MAX: 35,
};
export const SIMULATION_OUTDOOR_TEMPERATURE_CELCIUS = {
  DEFAULT: 15,
  MIN: -10,
  MAX: 35,
};
export const SIMULATION_PRICE_KWH = 0.22;

export const SIMULATION_DEFAULT_WALL_COMPONENT_INSULATION: Pick<
  HouseComponentInsulation,
  'insulationName' | 'buildingMaterials'
> = {
  insulationName: HouseInsulationPerComponent.Wall.Aerogel,
  buildingMaterials: HOUSE_INSULATIONS.Wall.Aerogel,
};

export const SIMULATION_DEFAULT_WINDOW_COMPONENT_INSULATION: Pick<
  HouseComponentInsulation,
  'insulationName' | 'buildingMaterials'
> = {
  insulationName: HouseInsulationPerComponent.Window.DoublePane,
  buildingMaterials: HOUSE_INSULATIONS.Window.DoublePane,
};
