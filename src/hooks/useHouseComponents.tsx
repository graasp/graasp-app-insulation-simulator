import { useCallback, useMemo } from 'react';

import { useImmer } from 'use-immer';

import {
  HOUSE_INSULATIONS,
  HouseInsulation,
  HouseInsulationPerComponent,
} from '@/config/houseInsulations';
import {
  SIMULATION_DEFAULT_WALL_COMPONENT_INSULATION,
  SIMULATION_DEFAULT_WINDOW_COMPONENT_INSULATION,
} from '@/config/simulation';
import {
  BuildingMaterial,
  FromBuildingMaterial,
} from '@/models/BuildingMaterial';
import { HouseComponent, Size } from '@/types/houseComponent';
import { HouseComponentInsulation } from '@/types/houseComponentInsulation';
import { CreateNonEmptyArray, NonEmptyArray } from '@/types/utils';

export type RegisterComponentParams = {
  componentId: string;
  parentId?: string;
  size: Size;
  componentType: HouseComponent.Wall | HouseComponent.Window;
};

type HouseComponentInsulationResult = HouseComponentInsulation & {
  houseComponentId: string;
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

  all: HouseComponentInsulationResult[];
  getByType: (
    componentType: HouseComponent,
  ) => HouseComponentInsulationResult[];
  getFirstOfType: (
    componentType: HouseComponent,
  ) => HouseComponentInsulationResult | undefined;
};

// An house component can be composed with multiple materials
// For example, a double-glazed window is made up of two panes of glass and air.
const DEFAULT_COMPONENTS_INSULATION = {
  [HouseComponent.Wall]: SIMULATION_DEFAULT_WALL_COMPONENT_INSULATION,
  [HouseComponent.Window]: SIMULATION_DEFAULT_WINDOW_COMPONENT_INSULATION,
};

// Helpful aliases
type ComponentId = string;
type ChildrenId = string;
type ParentId = string;

/**
 * Manages a tree-like structure of house component insulations.
 */
export const useHouseComponents = (): UseHouseComponentsReturnType => {
  const [state, setState] = useImmer<{
    /**
     * A map storing all house component insulations, keyed by their unique ID.
     */
    components: Map<ComponentId, HouseComponentInsulation>;
    /**
     * A map storing the parent ID of each component.
     * It is useful to know which wall the window is associated with.
     */
    componentParents: Map<ChildrenId, ParentId>;
  }>({ components: new Map(), componentParents: new Map() });

  const componentParentsEntries = useMemo(
    () => Array.from(state.componentParents.entries()),
    [state.componentParents],
  );

  const componentKeys = useMemo(
    () => Array.from(state.components.keys()),
    [state.components],
  );

  const componentEntries = useMemo(
    () => Array.from(state.components.entries()),
    [state.components],
  );

  /**
   * Retrieves all children components of a given parent component.
   * @param parentId The ID of the parent component.
   * @returns An array of child components.  Returns an empty array if no children are found or the parent doesn't exist.
   */
  const getChildren = useCallback(
    (parentId: string): HouseComponentInsulation[] =>
      componentParentsEntries
        .filter(([_, v]) => v === parentId)
        .map(([k, _]) => state.components.get(k))
        .filter((c): c is HouseComponentInsulation => Boolean(c)),
    [componentParentsEntries, state.components],
  );

  /**
   * Retrieves a component and calculates its actual area by subtracting the area of its children like the windows for a wall.
   * @param componentId The ID of the component to retrieve.
   * @returns The component object with its actual area calculated.
   * @throws Error if the component is not found or if its actual area is incorrect (less than or equal to zero after accounting for children).
   */
  const get = useCallback(
    (componentId: string): HouseComponentInsulation => {
      const component = state.components.get(componentId);

      if (!component) {
        throw new Error(`The house component '${componentId}' was not found!`);
      }

      const children = getChildren(componentId);

      const totalChildrenArea = children.reduce(
        (acc, comp) => acc + comp.actualArea,
        0,
      );
      const actualArea = component.actualArea - totalChildrenArea;

      if (actualArea <= 0) {
        throw new Error(
          `The actual area of house component '${componentId}' is incorrect!`,
        );
      }

      return {
        ...component,
        actualArea,
      };
    },
    [getChildren, state.components],
  );

  /**
   * Retrieves all components along with their IDs.
   * @returns An array of all components, each with its ID.
   */
  const all = useMemo(
    (): HouseComponentInsulationResult[] =>
      componentKeys.map((k) => ({
        houseComponentId: k,
        // Use the get method to return with the correct actual area.
        ...get(k),
      })),
    [componentKeys, get],
  );

  /**
   * Retrieves all the components of the given type.
   * @param componentType The type of the searched components.
   * @returns An array of components, each with its ID.
   */
  const getByType = useCallback(
    (componentType: HouseComponent): HouseComponentInsulationResult[] =>
      componentEntries
        .filter(([_, v]) => v.componentType === componentType)
        .map(([k, _]) => ({
          houseComponentId: k,
          // Use the get method to return with the correct actual area.
          ...get(k),
        })),
    [componentEntries, get],
  );

  /**
   * Retrieves the first component of the given type or undefined.
   * @param componentType The type of the searched components.
   * @returns The first component with its ID or undefined.
   */
  const getFirstOfType = useCallback(
    (
      componentType: HouseComponent,
    ): HouseComponentInsulationResult | undefined => {
      const first = componentEntries.find(
        ([_, v]) => v.componentType === componentType,
      );

      if (!first) {
        return undefined;
      }

      return {
        houseComponentId: first[0],
        // Use the get method to return with the correct actual area.
        ...get(first[0]),
      };
    },
    [componentEntries, get],
  );

  const registerComponent = useCallback(
    ({
      componentId,
      parentId,
      size,
      componentType,
    }: RegisterComponentParams): void => {
      if (parentId === componentId) {
        throw new Error('A component cannot be its own parent!');
      }

      const { buildingMaterials, insulationName } =
        getFirstOfType(componentType) ??
        DEFAULT_COMPONENTS_INSULATION[componentType];

      if (!buildingMaterials?.length) {
        throw new Error(
          `No material was found for the component ${componentType}`,
        );
      }

      const component = {
        size,
        insulationName,
        buildingMaterials,
        componentType,
        actualArea: size.height * size.width,
      };

      // Adds or updates the given component.
      setState((curr) => {
        curr.components.set(componentId, component);

        if (parentId) {
          curr.componentParents.set(componentId, parentId);
        } else {
          curr.componentParents.delete(componentId);
        }

        return curr;
      });
    },
    [getFirstOfType, setState],
  );

  const unregisterComponent = useCallback(
    ({ componentId }: Pick<RegisterComponentParams, 'componentId'>): void => {
      // Removes the given component and all its descendants.
      setState((curr) => {
        curr.components.delete(componentId);
        curr.componentParents.delete(componentId);

        // Start with the initial component
        const componentsToRemove: string[] = [componentId];

        while (componentsToRemove.length > 0) {
          const currentComponentId = componentsToRemove.pop();

          if (!currentComponentId) {
            break;
          }

          const parents = Array.from(curr.componentParents.entries());

          for (let i = 0; i < parents.length; i += 1) {
            const [childId, parentId] = parents[i];

            if (parentId === currentComponentId) {
              curr.componentParents.delete(childId);
              curr.components.delete(childId);
              // Add to the main stack for processing children's children
              componentsToRemove.push(childId);
            }
          }
        }

        return curr;
      });
    },
    [setState],
  );

  /**
   * Updates the given component's insulation.
   * @param componentType The component type to udpate with the new insulation.
   * @param insulation The new insulation to use to update the components of the given type.
   */
  const updateInsulation = useCallback(
    <
      T extends HouseComponent,
      K extends keyof (typeof HouseInsulationPerComponent)[T],
    >({
      componentType,
      insulation,
    }: {
      componentType: T;
      insulation: {
        name: K;
        buildingMaterials: NonEmptyArray<BuildingMaterial>;
      };
    }): void => {
      if (!insulation.name) {
        throw new Error(
          `The insulation should be defined for component ${componentType}!`,
        );
      }

      setState((curr) => {
        curr.components.forEach((component, key) => {
          if (component.componentType === componentType) {
            const updatedComponent = {
              ...component,
              insulationName: insulation.name as HouseInsulation,
              buildingMaterials: insulation.buildingMaterials,
            };
            curr.components.set(key, updatedComponent);
          }
        });

        return curr;
      });
    },
    [setState],
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
      const insulation = { name: newInsulation, buildingMaterials };
      updateInsulation({ componentType, insulation });
    },
    [updateInsulation],
  );

  const updateCompositionOfInsulation = useCallback(
    <T extends HouseComponent>({
      componentType,
      materialProps,
    }: {
      componentType: T;
      materialProps: { name: string } & FromBuildingMaterial;
    }): void => {
      const component = getFirstOfType(componentType);

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

      const insulation = {
        name: insulationName,
        buildingMaterials: CreateNonEmptyArray(newMaterials),
      };

      updateInsulation({ componentType, insulation });
    },
    [getFirstOfType, updateInsulation],
  );

  return useMemo(
    () => ({
      registerComponent,
      unregisterComponent,
      changeComponentInsulation,
      updateCompositionOfInsulation,

      all,
      getByType,
      getFirstOfType,
    }),
    [
      registerComponent,
      unregisterComponent,
      changeComponentInsulation,
      updateCompositionOfInsulation,
      all,
      getByType,
      getFirstOfType,
    ],
  );
};
