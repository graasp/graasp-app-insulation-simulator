import { UnionOfConst } from '@graasp/sdk';

export const HeatLossUnit = {
  Watt: 'W',
  KiloWatt: 'kW',
  MegaWatt: 'MW',
} as const;

export type HeatLossUnitType = UnionOfConst<typeof HeatLossUnit>;

export type FormattedHeatLoss = {
  value: number;
  unit: HeatLossUnitType;
};
