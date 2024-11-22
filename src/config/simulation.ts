import { Material } from '@/types/material';
import { TimeUnit } from '@/types/time';
import { NonEmptyArray } from '@/types/utils';

export const SIMULATION_FRAME_MS = 150;
export const SIMULATION_SLIDING_WINDOW = { window: 2, unit: TimeUnit.Days };
export const SIMULATION_CSV_FILE = {
  path: 'temperatures/predictions_1_year.csv',
  measurementFrequency: TimeUnit.Days,
};

export const SIMULATION_INDOOR_TEMPERATURE_CELCIUS = 22;
export const SIMULATION_PRICE_KWH = 0.22;
export const AEROGEL_MATERIAL: Material = {
  price: 0,
  thermalConductivity: 0.021,
  thickness: 0.25,
};
export const SINGLE_WINDOW_PANE_MATERIAL: Material = {
  price: 0,
  thermalConductivity: 0.8,
  thickness: 0.005,
};
export const DOUBLE_WINDOW_PANE_MATERIAL: NonEmptyArray<Material> = [
  SINGLE_WINDOW_PANE_MATERIAL,
  // Air
  {
    price: 0,
    thermalConductivity: 0.024,
    thickness: 0.005,
  },
  SINGLE_WINDOW_PANE_MATERIAL,
];

export const SIMULATION_DEFAULT_WALL_MATERIALS: NonEmptyArray<Material> = [
  AEROGEL_MATERIAL,
];
export const SIMULATION_DEFAULT_WINDOW_MATERIALS: NonEmptyArray<Material> =
  DOUBLE_WINDOW_PANE_MATERIAL;
