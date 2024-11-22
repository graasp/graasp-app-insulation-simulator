import { Material } from './material';
import { NonEmptyArray } from './utils';

export enum HouseComponentType {
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

export type HouseComponent = {
  materials: NonEmptyArray<Material>;
  size: Size;
  componentType: HouseComponentType;
  /**
   *  The actual surface area, taking into account other elements.
   * For example, for a wall, potential windows or doors must be taken into account,
   * which means that the effective surface area is the surface area of the wall - the surface area of the windows.
   * */
  actualArea: number;
};
