export enum HouseComponent {
  Wall = 'Wall',
  Window = 'Window',
  Door = 'Door',
}

export type HeatLossPerComponent = {
  [componentId: string]: number;
};

export type Size = {
  width: number;
  height: number;
};
