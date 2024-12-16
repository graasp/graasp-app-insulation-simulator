import { Color, Material } from 'three';

import { HouseInsulationPerComponent } from '@/config/houseInsulations';
import { SIMULATION_DEFAULT_WINDOW_COMPONENT_INSULATION } from '@/config/simulation';
import { HouseComponent } from '@/types/houseComponent';
import { fromRGB } from '@/utils/colors';

import { useHouseMaterial } from './useHouseMaterial';

const COLORS: {
  [insulation in keyof typeof HouseInsulationPerComponent.Window]: Color;
} = {
  [HouseInsulationPerComponent.Window.SinglePane]: fromRGB({
    r: 0.57,
    g: 0.28,
    b: 0.114,
  }),
  [HouseInsulationPerComponent.Window.DoublePane]: fromRGB({
    r: 0.47,
    g: 0.18,
    b: 0.064,
  }),
  [HouseInsulationPerComponent.Window.TriplePane]: fromRGB({
    r: 0.37,
    g: 0.08,
    b: 0.014,
  }),
};

type UseWindowMaterialReturnType = {
  frameMaterial: Material;
};

type WindowColor = keyof typeof HouseInsulationPerComponent.Window;

export const useWindowMaterial = ({
  windowMaterial,
}: {
  windowMaterial: Material;
}): UseWindowMaterialReturnType => ({
  frameMaterial: useHouseMaterial({
    houseMaterial: windowMaterial,
    houseComponent: HouseComponent.Window,
    colors: COLORS,
    defaultColor:
      COLORS[
        SIMULATION_DEFAULT_WINDOW_COMPONENT_INSULATION.insulationName as WindowColor
      ],
  }),
});
