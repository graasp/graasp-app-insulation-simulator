import { HouseInsulation } from '@/config/houseInsulations';
import { BuildingMaterial } from '@/models/BuildingMaterial';

import { HouseComponent, Size } from './houseComponent';
import { NonEmptyArray } from './utils';

export type HouseComponentInsulation = {
  insulationName: HouseInsulation;
  componentType: HouseComponent;
  buildingMaterials: NonEmptyArray<BuildingMaterial>;
  size: Size;
  /**
   *  The actual surface area, taking into account other elements.
   * For example, for a wall, potential windows or doors must be taken into account,
   * which means that the effective surface area is the surface area of the wall - the surface area of the windows.
   * */
  actualArea: number;
};
