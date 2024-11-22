import {
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import {
  SIMULATION_DEFAULT_WALL_MATERIALS,
  SIMULATION_DEFAULT_WINDOW_MATERIALS,
} from '@/config/simulation';
import { HouseComponents } from '@/models/HouseComponents';
import { HouseComponentType, Size } from '@/types/houseComponent';
import { Material } from '@/types/material';
import { NonEmptyArray } from '@/types/utils';
import { undefinedContextErrorFactory } from '@/utils/context';

export type RegisterComponentParams = {
  componentId: string;
  parentId?: string;
  size: Size;
  componentType: HouseComponentType;
};

type HouseComponentsContextType = {
  houseComponents: HouseComponents;
  registerComponent: (params: RegisterComponentParams) => void;
};

const HouseComponentsContext = createContext<HouseComponentsContextType | null>(
  null,
);

type Props = {
  children: ReactNode;
};

export const HouseComponentsProvider = ({ children }: Props): ReactNode => {
  // TODO: will be updated by users
  // An house component can be composed with multiple materials
  // For example, a double-glazed window is made up of two panes of glass and air.
  const componentMaterials: Map<
    HouseComponentType,
    NonEmptyArray<Material>
  > = useMemo(
    () =>
      new Map([
        // TODO: load form a CSV
        [HouseComponentType.Wall, SIMULATION_DEFAULT_WALL_MATERIALS],
        [HouseComponentType.Window, SIMULATION_DEFAULT_WINDOW_MATERIALS],
      ]),
    [],
  );
  const [houseComponents, setHouseComponents] = useState<HouseComponents>(() =>
    HouseComponents.create(),
  );

  const registerComponent = useCallback(
    ({
      componentId,
      parentId,
      size,
      componentType,
    }: RegisterComponentParams): void => {
      const materials = componentMaterials.get(componentType);

      if (!materials?.length) {
        throw new Error(
          `No material was found for the component ${componentType}`,
        );
      }

      setHouseComponents((curr) =>
        curr.cloneWith({
          componentId,
          parentId,
          component: {
            size,
            materials,
            componentType,
            actualArea: size.height * size.width,
          },
        }),
      );
    },
    [componentMaterials],
  );

  const contextValue = useMemo(
    () => ({
      houseComponents,
      registerComponent,
    }),
    [houseComponents, registerComponent],
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
