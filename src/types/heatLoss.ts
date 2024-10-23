export const HeatLossUnit = {
  Watt: 'W',
  KiloWatt: 'kW',
  MegaWatt: 'MW',
} as const;

export type HeatLossUnitType = (typeof HeatLossUnit)[keyof typeof HeatLossUnit];

type HeatLossUnitByValue = {
  [v in HeatLossUnitType]: keyof typeof HeatLossUnit;
};
export const heatLossUnitByValue = Object.entries(
  HeatLossUnit,
).reduce<HeatLossUnitByValue>(
  (acc, [k, v]) => ({
    ...acc,
    [v]: k,
  }),
  {} as HeatLossUnitByValue,
);

export type FormattedHeatLoss = {
  value: number;
  unit: HeatLossUnitType;
};
