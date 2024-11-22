import { Material } from './material';

export enum HouseComponentType {
  Wall = 'Wall',
  Window = 'Window',
  Door = 'Door',
}

export type HeatLossPerComponent = {
  [componentId: string]: number;
};

type HouseComponent = {
  material: Material;
  area: number;
};

export type HouseComponents = Map<string, HouseComponent>;
