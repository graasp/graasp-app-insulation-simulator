import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

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
import { undefinedContextErrorFactory } from '@/utils/context';

export type RegisterComponentParams = {
  componentId: string;
  parentId?: string;
  size: Size;
  componentType: HouseComponent.Wall | HouseComponent.Window;
};

type HouseComponentsContextType = {
  houseComponentsConfigurator: HouseComponentsConfigurator;
  registerComponent: (params: RegisterComponentParams) => void;

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

const HouseComponentsContext = createContext<HouseComponentsContextType | null>(
  null,
);

type Props = {
  children: ReactNode;
};

// An house component can be composed with multiple materials
// For example, a double-glazed window is made up of two panes of glass and air.
const DEFAULT_COMPONENTS_INSULATION = {
  [HouseComponent.Wall]: SIMULATION_DEFAULT_WALL_COMPONENT_INSULATION,
  [HouseComponent.Window]: SIMULATION_DEFAULT_WINDOW_COMPONENT_INSULATION,
};

export const HouseComponentsProvider = ({ children }: Props): ReactNode => {
  const [houseComponentsConfigurator, setHouseComponentsConfigurator] =
    useState<HouseComponentsConfigurator>(() =>
      HouseComponentsConfigurator.create(),
    );

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

      setHouseComponentsConfigurator((curr) =>
        curr.cloneWith({
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
    [houseComponentsConfigurator],
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

      // TODO: use state on home insulations to not reset updated insulations?
      const buildingMaterials = HOUSE_INSULATIONS[componentType][newInsulation];

      setHouseComponentsConfigurator((curr) =>
        curr.cloneWithNewInsulation({
          componentType,
          insulation: { name: newInsulation, buildingMaterials },
        }),
      );
    },
    [],
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
      const currMaterials = HOUSE_INSULATIONS[componentType][insulationName];

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

      setHouseComponentsConfigurator((curr) =>
        curr.cloneWithNewInsulation({
          componentType,
          insulation: {
            name: insulationName,
            buildingMaterials: CreateNonEmptyArray(newMaterials),
          },
        }),
      );
    },
    [houseComponentsConfigurator],
  );

  const contextValue = useMemo(
    () => ({
      houseComponentsConfigurator,
      registerComponent,

      changeComponentInsulation,
      updateCompositionOfInsulation,
    }),
    [
      houseComponentsConfigurator,
      registerComponent,
      changeComponentInsulation,
      updateCompositionOfInsulation,
    ],
  );

  return (
    <HouseComponentsContext.Provider value={contextValue}>
      {children}
    </HouseComponentsContext.Provider>
  );
};

export const useHouseComponents = (): HouseComponentsContextType => {
  const context = useContext(HouseComponentsContext);

  if (!context) {
    throw undefinedContextErrorFactory('HouseComponents');
  }

  return context;
};
