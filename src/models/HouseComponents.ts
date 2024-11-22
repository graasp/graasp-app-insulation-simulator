import { HouseComponent } from '@/types/houseComponent';

type HouseComponentResult = HouseComponent & { id: string };

/**
 * Manages a tree-like structure of house components, ensuring immutability for efficient React updates.
 */
export class HouseComponents {
  /**
   * A map storing all house components, keyed by their unique ID.
   */
  private readonly components: Map<string, HouseComponent> = new Map();

  /**
   * A map storing the parent ID of each component.
   * It is useful to know which wall the window is associated with.
   */
  private readonly parentComponentIds: Map<string, string> = new Map();

  /**
   * Private constructor; instances should be created using the `create()` factory method.
   * This allows to abstract the internal structure of the Class and to faciliate the instantiation of immutable object.
   * @param initialComponents  An optional initial set of components.
   * @param initialParentComponentIds An optional initial set of parent-child relationships.
   */
  private constructor(
    initialComponents?: Map<string, HouseComponent>,
    initialParentComponentIds?: Map<string, string>,
  ) {
    this.components = initialComponents || new Map();
    this.parentComponentIds = initialParentComponentIds || new Map();
  }

  public static create(): HouseComponents {
    return new HouseComponents();
  }

  /**
   * Creates a new `HouseComponents` instance with the given component added or updated. The original instance remains unchanged.  This method is designed to support immutable updates in React applications.
   * @param parentId The ID of the parent component, or `undefined` if it's a root component (like a wall).
   * @param componentId The unique ID of the component.
   * @param component The component object itself.
   * @throws {Error} If `parentId` is the same as `componentId` (a component cannot be its own parent), or if the component is already assigned to a different parent.
   * @returns A new `HouseComponents` instance with the component added or updated.
   */
  public cloneWith({
    parentId,
    componentId,
    component,
  }: {
    parentId?: string;
    componentId: string;
    component: HouseComponent;
  }): HouseComponents {
    if (parentId === componentId) {
      throw new Error('A component cannot be its own parent!');
    }

    const newComponents = new Map(this.components);
    newComponents.set(componentId, component);

    const newParentComponentIds = new Map(this.parentComponentIds);

    const currentParentId = newParentComponentIds.get(componentId);

    if (currentParentId && currentParentId !== parentId) {
      throw new Error(
        `The component '${componentId}' is already assigned to a parent.`,
      );
    }

    if (parentId) {
      newParentComponentIds.set(componentId, parentId);
    } else {
      newParentComponentIds.delete(componentId);
    }

    return new HouseComponents(newComponents, newParentComponentIds);
  }

  /**
   * Retrieves all child components of a given parent component.
   * @param parentId The ID of the parent component.
   * @returns An array of child components.  Returns an empty array if no children are found or the parent doesn't exist.
   */
  private getChildren(parentId: string): HouseComponent[] {
    return Array.from(this.parentComponentIds.entries())
      .filter(([_, v]) => v === parentId)
      .map(([k, _]) => this.components.get(k))
      .filter((c): c is HouseComponent => Boolean(c));
  }

  /**
   * Retrieves a component and calculates its actual area by subtracting the area of its children like the windows for a wall.
   * @param componentId The ID of the component to retrieve.
   * @returns The component object with its actual area calculated.
   * @throws Error if the component is not found or if its actual area is incorrect (less than or equal to zero after accounting for children).
   */
  public get(componentId: string): HouseComponent {
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
  public getAll(): HouseComponentResult[] {
    return Array.from(this.components.keys()).map((k) => ({
      id: k,
      ...this.get(k),
    }));
  }
}
