import { TimeUnitType } from './time';

export type TemperatureRow = {
  time: string;
  temperature: number;
};

export type SlidingWindowOptions = {
  window: number;
  unit: TimeUnitType;
};

export type SlidingWindow = {
  idx: number;
  mean: number;
  temperatures: number[];
  period: { from: Date; to: Date; durationInHours: number };
  size: number;
  totalCount: number;
};
