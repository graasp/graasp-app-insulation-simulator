import {
  HouseInsulation,
  HouseInsulationPerComponent,
} from '@/config/houseInsulations';
import { HouseComponent } from '@/types/houseComponent';
import { HouseComponentInsulation } from '@/types/houseComponentInsulation';
import { NonEmptyArray } from '@/types/utils';

import { BuildingMaterial } from './BuildingMaterial';

type HouseComponentInsulationResult = HouseComponentInsulation & {
  houseComponentId: string;
};

// Helpful aliases
type ComponentId = string;
type ChildrenId = string;
type ParentId = string;

/**
 * Manages a tree-like structure of house component insulations.
 *
 * **WARNING**: As React use memory adress to detect changes, we have to clone the HouseComponentsConfigurator.
 * This is to ensure that React can detect internal changes and re-render.
 */
export class HouseComponentsConfigurator {
  /**
   * A map storing all house component insulations, keyed by their unique ID.
   */
  private readonly components: Map<ComponentId, HouseComponentInsulation> =
    new Map();

  /**
   * A map storing the parent ID of each component.
   * It is useful to know which wall the window is associated with.
   */
  private readonly componentParents: Map<ChildrenId, ParentId> = new Map();

  /**
   * Private constructor; instances should be created using the `create()` factory method.
   * This allows to abstract the internal structure of the Class and to faciliate the instantiation of immutable object.
   * @param initialComponents  An optional initial set of components.
   * @param initialComponentParents An optional initial set of child-parent relationships.
   */
  private constructor(
    initialComponents?: Map<string, HouseComponentInsulation>,
    initialComponentParents?: Map<string, string>,
  ) {
    this.components = new Map(initialComponents);
    this.componentParents = new Map(initialComponentParents);
  }

  public static create(): HouseComponentsConfigurator {
    return new HouseComponentsConfigurator();
  }

  /**
   * Copy the current `HouseComponentsConfigurator` to ensure that React detect internal changes.
   * @returns a copy of the current `HouseComponentsConfigurator`.
   */
  public clone(): HouseComponentsConfigurator {
    return new HouseComponentsConfigurator(
      this.components,
      this.componentParents,
    );
  }

  /**
   * Adds or updates the given component.
   * @param parentId The ID of the parent component, or `undefined` if it's a root component (like a wall).
   * @param componentId The unique ID of the component.
   * @param component The component object itself.
   * @throws {Error} If `parentId` is the same as `componentId` (a component cannot be its own parent), or if the component is already assigned to a different parent.
   * @returns The `HouseComponentsConfigurator` instance with the component added or updated.
   */
  public add({
    parentId,
    componentId,
    component,
  }: {
    parentId?: string;
    componentId: string;
    component: HouseComponentInsulation;
  }): HouseComponentsConfigurator {
    if (parentId === componentId) {
      throw new Error('A component cannot be its own parent!');
    }

    this.components.set(componentId, component);
    const currentParentId = this.componentParents.get(componentId);

    if (currentParentId && currentParentId !== parentId) {
      throw new Error(
        `The component '${componentId}' is already assigned to a parent.`,
      );
    }

    if (parentId) {
      this.componentParents.set(componentId, parentId);
    } else {
      this.componentParents.delete(componentId);
    }

    return this;
  }

  /**
   * Removes the specific component and its children removed.
   * @param componentId The unique ID of the component.
   * @returns The `HouseComponentsConfigurator` instance with the component added or updated.
   */
  public remove({
    componentId,
  }: {
    componentId: string;
  }): HouseComponentsConfigurator {
    this.components.delete(componentId);
    this.componentParents.delete(componentId);
    this.removeComponent(componentId);

    return this;
  }

  /**
   * Recursively removes a component and its children.
   *
   * @param componentId - The ID of the component to remove.
   */
  private removeComponent(componentId: string): void {
    Array.from(this.componentParents.entries()).forEach(
      ([childId, parentId]) => {
        if (parentId === componentId) {
          this.componentParents.delete(childId);
          this.components.delete(childId);

          this.removeComponent(childId);
        }
      },
    );
  }

  /**
   * Updates the given component's insulation.
   * @param componentType The component type to udpate with the new insulation.
   * @param insulation The new insulation to use to update the components of the given type.
   * @returns The `HouseComponentsConfigurator` instance with the components' insulation of the given type updated.
   */
  public updateInsulation<
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
  }): HouseComponentsConfigurator {
    if (!insulation.name) {
      throw new Error(
        `The insulation should be defined for component ${componentType}!`,
      );
    }

    this.components.forEach((component, key) => {
      if (component.componentType === componentType) {
        const updatedComponent = {
          ...component,
          insulationName: insulation.name as HouseInsulation,
          buildingMaterials: insulation.buildingMaterials,
        };
        this.components.set(key, updatedComponent);
      }
    });

    return this;
  }

  /**
   * Retrieves all children components of a given parent component.
   * @param parentId The ID of the parent component.
   * @returns An array of child components.  Returns an empty array if no children are found or the parent doesn't exist.
   */
  private getChildren(parentId: string): HouseComponentInsulation[] {
    return Array.from(this.componentParents.entries())
      .filter(([_, v]) => v === parentId)
      .map(([k, _]) => this.components.get(k))
      .filter((c): c is HouseComponentInsulation => Boolean(c));
  }

  /**
   * Retrieves a component and calculates its actual area by subtracting the area of its children like the windows for a wall.
   * @param componentId The ID of the component to retrieve.
   * @returns The component object with its actual area calculated.
   * @throws Error if the component is not found or if its actual area is incorrect (less than or equal to zero after accounting for children).
   */
  public get(componentId: string): HouseComponentInsulation {
    const component = this.components.get(componentId);

    if (!component) {
      throw new Error(`The house component '${componentId}' was not found!`);
    }

    const children = this.getChildren(componentId);

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
  }

  /**
   * Retrieves all components along with their IDs.
   * @returns An array of all components, each with its ID.
   */
  public getAll(): HouseComponentInsulationResult[] {
    return Array.from(this.components.keys()).map((k) => ({
      houseComponentId: k,
      // Use the get method to return with the correct actual area.
      ...this.get(k),
    }));
  }

  /**
   * Retrieves all the components of the given type.
   * @param componentType The type of the searched components.
   * @returns An array of components, each with its ID.
   */
  public getByType(
    componentType: HouseComponent,
  ): HouseComponentInsulationResult[] {
    return Array.from(this.components.entries())
      .filter(([_, v]) => v.componentType === componentType)
      .map(([k, _]) => ({
        houseComponentId: k,
        // Use the get method to return with the correct actual area.
        ...this.get(k),
      }));
  }

  /**
   * Retrieves the first component of the given type or undefined.
   * @param componentType The type of the searched components.
   * @returns The first component with its ID or undefined.
   */
  public getFirstOfType(
    componentType: HouseComponent,
  ): HouseComponentInsulationResult | undefined {
    const first = Array.from(this.components.entries()).find(
      ([_, v]) => v.componentType === componentType,
    );

    if (!first) {
      return undefined;
    }

    return {
      houseComponentId: first[0],
      // Use the get method to return with the correct actual area.
      ...this.get(first[0]),
    };
  }
}
