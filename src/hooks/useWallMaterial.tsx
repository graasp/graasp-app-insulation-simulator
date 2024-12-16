import { Color, Material } from 'three';

import { HouseInsulationPerComponent } from '@/config/houseInsulations';
import { SIMULATION_DEFAULT_WALL_COMPONENT_INSULATION } from '@/config/simulation';
import { HouseComponent } from '@/types/houseComponent';
import { fromHSL } from '@/utils/colors';

import { useHouseMaterial } from './useHouseMaterial';

const COLORS: {
  [insulation in keyof typeof HouseInsulationPerComponent.Wall]: Color;
} = {
  [HouseInsulationPerComponent.Wall.Aerogel]: fromHSL({
    h: 30,
    s: 0.8,
    l: 0.7,
  }),
  [HouseInsulationPerComponent.Wall.Fiberglass]: fromHSL({
    h: 100,
    s: 0.7,
    l: 0.6,
  }),
  [HouseInsulationPerComponent.Wall.MineralWool]: fromHSL({
    h: 200,
    s: 0.6,
    l: 0.7,
  }),
  [HouseInsulationPerComponent.Wall.XPSFoam]: fromHSL({
    h: 240,
    s: 0.5,
    l: 0.8,
  }),
  [HouseInsulationPerComponent.Wall.Brick]: fromHSL({ h: 20, s: 0.6, l: 0.4 }),
};

type WallColor = keyof typeof HouseInsulationPerComponent.Wall;

export const useWallMaterial = ({
  wallMaterial,
}: {
  wallMaterial: Material;
}): Material =>
  useHouseMaterial({
    houseMaterial: wallMaterial,
    houseComponent: HouseComponent.Wall,
    colors: COLORS,
    defaultColor:
      COLORS[
        SIMULATION_DEFAULT_WALL_COMPONENT_INSULATION.insulationName as WallColor
      ],
  });
