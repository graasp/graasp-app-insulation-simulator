import { UnionOfConst } from '@graasp/sdk';

import { BuildingMaterial } from '@/models/BuildingMaterial';
import { HouseComponent } from '@/types/houseComponent';
import { NonEmptyArray } from '@/types/utils';

import { BUILDING_MATERIALS } from './buildingMaterials';

export const HouseInsulationPerComponent = {
  [HouseComponent.Wall]: {
    Brick: 'Brick',
    Aerogel: 'Aerogel',
    Fiberglass: 'Fiberglass',
    XPSFoam: 'XPSFoam',
    MineralWool: 'MineralWool',
  },
  [HouseComponent.Door]: {
    Wood: 'Wood',
  },
  [HouseComponent.Window]: {
    SinglePane: 'SinglePane',
    DoublePane: 'DoublePane',
    TriplePane: 'TriplePane',
  },
} as const;

export type HouseInsulation =
  | UnionOfConst<(typeof HouseInsulationPerComponent)[HouseComponent.Wall]>
  | UnionOfConst<(typeof HouseInsulationPerComponent)[HouseComponent.Door]>
  | UnionOfConst<(typeof HouseInsulationPerComponent)[HouseComponent.Window]>;

export const HOUSE_INSULATIONS: {
  [houseComponent in HouseComponent]: {
    [componentInsulationName in keyof (typeof HouseInsulationPerComponent)[houseComponent]]: NonEmptyArray<BuildingMaterial>;
  };
} = {
  [HouseComponent.Wall]: {
    Brick: [BUILDING_MATERIALS.Brick],
    Aerogel: [BUILDING_MATERIALS.Brick, BUILDING_MATERIALS.Aerogel],
    Fiberglass: [BUILDING_MATERIALS.Brick, BUILDING_MATERIALS.FiberGlass],
    XPSFoam: [BUILDING_MATERIALS.Brick, BUILDING_MATERIALS.XPSFoam],
    MineralWool: [BUILDING_MATERIALS.Brick, BUILDING_MATERIALS.MineralWool],
  },

  [HouseComponent.Door]: {
    Wood: [BUILDING_MATERIALS.Wood.from({ thickness: 0.1 })],
  },

  [HouseComponent.Window]: {
    SinglePane: [BUILDING_MATERIALS.WindowGlass],
    DoublePane: [
      BUILDING_MATERIALS.WindowGlass,
      BUILDING_MATERIALS.Argon,
      BUILDING_MATERIALS.WindowGlass,
    ],
    TriplePane: [
      BUILDING_MATERIALS.WindowGlass,
      BUILDING_MATERIALS.Argon,
      BUILDING_MATERIALS.WindowGlass,
      BUILDING_MATERIALS.Argon,
      BUILDING_MATERIALS.WindowGlass,
    ],
  },
} as const;
