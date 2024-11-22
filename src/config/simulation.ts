import { TimeUnit } from '@/types/time';

export const SIMULATION_FRAME_MS = 150;
export const SIMULATION_SLIDING_WINDOW = { window: 2, unit: TimeUnit.Days };
export const SIMULATION_CSV_FILE = {
  path: 'temperatures/predictions_1_year.csv',
  measurementFrequency: TimeUnit.Days,
};

export const SIMULATION_INDOOR_TEMPERATURE_CELCIUS = 22;
export const SIMULATION_PRICE_KWH = 0.22;
export const SIMULATION_DEFAULT_MATERIAL = {
  price: 0,
  thermalConductivity: 0.021,
  thickness: 0.25,
};
