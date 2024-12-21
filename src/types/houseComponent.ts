export enum HouseComponent {
  Wall = 'Wall',
  Window = 'Window',
  Door = 'Door',
}

export type HeatLossPerComponent = {
  [componentId: string]: number;
};

/**
 * Result of Object.entries(HeatLossPerComponent) used for performance.
 */
export type HeatLossPerComponentEntries = [string, number][];

export type Size = {
  width: number;
  height: number;
};
