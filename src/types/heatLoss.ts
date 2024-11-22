import { UnionOfConst } from '@graasp/sdk';

export const HeatLossUnit = {
  Watt: 'Watt',
  KiloWatt: 'KiloWatt',
  MegaWatt: 'MegaWatt',
} as const;

export const HeatLossSymbol: { [unit in keyof typeof HeatLossUnit]: string } = {
  [HeatLossUnit.Watt]: 'W',
  [HeatLossUnit.KiloWatt]: 'kW',
  [HeatLossUnit.MegaWatt]: 'MW',
} as const;

export type HeatLossUnitType = UnionOfConst<typeof HeatLossUnit>;

export type FormattedHeatLoss = {
  value: number;
  unit: HeatLossUnitType;
};
