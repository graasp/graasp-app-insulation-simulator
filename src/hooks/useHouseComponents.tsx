import { useCallback, useMemo } from 'react';

import {
  HOUSE_INSULATIONS,
  HouseInsulationPerComponent,
} from '@/config/houseInsulations';
import {
  SIMULATION_DEFAULT_WALL_COMPONENT_INSULATION,
  SIMULATION_DEFAULT_WINDOW_COMPONENT_INSULATION,
} from '@/config/simulation';
import { FromBuildingMaterial } from '@/models/BuildingMaterial';
import { HouseComponentsConfigurator } from '@/models/HouseComponentsConfigurator';
import { HouseComponent, Size } from '@/types/houseComponent';
import { CreateNonEmptyArray } from '@/types/utils';

export type RegisterComponentParams = {
  componentId: string;
  parentId?: string;
  size: Size;
  componentType: HouseComponent.Wall | HouseComponent.Window;
};

export type UseHouseComponentsReturnType = {
  registerComponent: (params: RegisterComponentParams) => void;
  unregisterComponent: ({
    componentId,
  }: Pick<RegisterComponentParams, 'componentId'>) => void;
  changeComponentInsulation: <
    T extends HouseComponent,
    K extends keyof (typeof HouseInsulationPerComponent)[T],
  >({
    componentType,
    newInsulation,
  }: {
    componentType: T;
    newInsulation: K;
  }) => void;
  updateCompositionOfInsulation: <T extends HouseComponent>({
    componentType,
    materialProps,
  }: {
    componentType: T;
    materialProps: { name: string } & FromBuildingMaterial;
  }) => void;
};

// An house component can be composed with multiple materials
// For example, a double-glazed window is made up of two panes of glass and air.
const DEFAULT_COMPONENTS_INSULATION = {
  [HouseComponent.Wall]: SIMULATION_DEFAULT_WALL_COMPONENT_INSULATION,
  [HouseComponent.Window]: SIMULATION_DEFAULT_WINDOW_COMPONENT_INSULATION,
};

type Props = {
  houseConfigurator: HouseComponentsConfigurator;
  onChange: (newHouseComponents: HouseComponentsConfigurator) => void;
};

export const useHouseComponents = ({
  houseConfigurator,
  onChange,
}: Props): UseHouseComponentsReturnType => {
  // Not working now...
  const houseComponentsConfigurator = houseConfigurator;

  const registerComponent = useCallback(
    ({
      componentId,
      parentId,
      size,
      componentType,
    }: RegisterComponentParams): void => {
      const { buildingMaterials, insulationName } =
        houseComponentsConfigurator.getFirstOfType(componentType) ??
        DEFAULT_COMPONENTS_INSULATION[componentType];

      if (!buildingMaterials?.length) {
        throw new Error(
          `No material was found for the component ${componentType}`,
        );
      }

      onChange(
        houseComponentsConfigurator.add({
          componentId,
          parentId,
          component: {
            size,
            insulationName,
            buildingMaterials,
            componentType,
            actualArea: size.height * size.width,
          },
        }),
      );
    },
    [houseComponentsConfigurator, onChange],
  );

  const unregisterComponent = useCallback(
    ({ componentId }: Pick<RegisterComponentParams, 'componentId'>): void => {
      onChange(houseComponentsConfigurator.remove({ componentId }));
    },
    [houseComponentsConfigurator, onChange],
  );

  const changeComponentInsulation = useCallback(
    <
      T extends HouseComponent,
      K extends keyof (typeof HouseInsulationPerComponent)[T],
    >({
      componentType,
      newInsulation,
    }: {
      componentType: T;
      newInsulation: K;
    }): void => {
      if (!(newInsulation in HOUSE_INSULATIONS[componentType])) {
        throw new Error(
          `Invalid material "${newInsulation.toString()}" for component type "${componentType.toString()}". Valid materials are: ${Object.keys(
            HOUSE_INSULATIONS[componentType],
          ).join(', ')}.`,
        );
      }

      const buildingMaterials = HOUSE_INSULATIONS[componentType][newInsulation];

      onChange(
        houseComponentsConfigurator.updateInsulation({
          componentType,
          insulation: { name: newInsulation, buildingMaterials },
        }),
      );
    },
    [houseComponentsConfigurator, onChange],
  );

  const updateCompositionOfInsulation = useCallback(
    <T extends HouseComponent>({
      componentType,
      materialProps,
    }: {
      componentType: T;
      materialProps: { name: string } & FromBuildingMaterial;
    }): void => {
      const component =
        houseComponentsConfigurator.getFirstOfType(componentType);

      if (!component) {
        throw new Error(`No ${componentType} component was found!`);
      }

      const insulationName =
        component.insulationName as keyof (typeof HouseInsulationPerComponent)[T];
      const currMaterials = component.buildingMaterials;

      if (!currMaterials?.length) {
        throw new Error(
          `No material was found for insulation "${insulationName.toString()}"!`,
        );
      }

      const newMaterials = currMaterials.map((m) => {
        if (m.name === materialProps.name) {
          return m.from(materialProps);
        }

        return m;
      });

      onChange(
        houseComponentsConfigurator.updateInsulation({
          componentType,
          insulation: {
            name: insulationName,
            buildingMaterials: CreateNonEmptyArray(newMaterials),
          },
        }),
      );
    },
    [houseComponentsConfigurator, onChange],
  );

  return useMemo(
    () => ({
      registerComponent,
      unregisterComponent,
      changeComponentInsulation,
      updateCompositionOfInsulation,
    }),
    [
      registerComponent,
      unregisterComponent,
      changeComponentInsulation,
      updateCompositionOfInsulation,
    ],
  );
};
