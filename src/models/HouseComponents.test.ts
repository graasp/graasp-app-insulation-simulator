import { describe, expect, it } from 'vitest';

import { HouseComponent, HouseComponentType } from '@/types/houseComponent';
import { Material } from '@/types/material';

import { HouseComponents } from './HouseComponents';

const WALL_MATERIAL_1: Material = {
  thermalConductivity: 0.25,
  thickness: 0.02,
  price: 10,
};

const WALL_COMPONENT: HouseComponent = {
  materials: [WALL_MATERIAL_1],
  actualArea: 10,
  componentType: HouseComponentType.Wall,
  size: { width: 5, height: 2 },
};

const WINDOW_MATERIAL: Material = {
  thermalConductivity: 0.25,
  thickness: 0.02,
  price: 10,
};

const WINDOW_COMPONENT: HouseComponent = {
  materials: [WINDOW_MATERIAL],
  actualArea: 2,
  componentType: HouseComponentType.Wall,
  size: { width: 1, height: 2 },
};

describe('HouseComponents', () => {
  it('should create an empty instance using the static create method', () => {
    const houseComponents = HouseComponents.create();
    expect(houseComponents.getAll().length).eq(0);
  });

  it('should add a new component and returns a new instance', () => {
    const houseComponents = HouseComponents.create();
    const newHouseComponents = houseComponents.cloneWith({
      componentId: 'wall1',
      component: WALL_COMPONENT,
    });

    expect(newHouseComponents.getAll().length).eq(1);
    expect(newHouseComponents.get('wall1')).toEqual(WALL_COMPONENT);

    // Original instance should remain unchanged
    expect(houseComponents.getAll().length).eq(0);
  });

  it('should add a child component', () => {
    const houseComponents = HouseComponents.create().cloneWith({
      componentId: 'wall1',
      component: WALL_COMPONENT,
    });
    const newHouseComponents = houseComponents.cloneWith({
      parentId: 'wall1',
      componentId: 'window1',
      component: WINDOW_COMPONENT,
    });

    expect(newHouseComponents.getAll().length).eq(2);
    expect(newHouseComponents.get('window1')).toEqual(WINDOW_COMPONENT);
    expect(newHouseComponents.get('wall1').actualArea).eq(
      WALL_COMPONENT.actualArea - WINDOW_COMPONENT.actualArea,
    );
  });

  it('should get a component', () => {
    const houseComponents = HouseComponents.create()
      .cloneWith({ componentId: 'wall1', component: WALL_COMPONENT })
      .cloneWith({
        parentId: 'wall1',
        componentId: 'window1',
        component: WINDOW_COMPONENT,
      });

    const wall = houseComponents.get('wall1');
    expect(wall.actualArea).eq(
      WALL_COMPONENT.actualArea - WINDOW_COMPONENT.actualArea,
    );
  });

  it('should get all components', () => {
    const houseComponents = HouseComponents.create()
      .cloneWith({ componentId: 'wall1', component: WALL_COMPONENT })
      .cloneWith({
        parentId: 'wall1',
        componentId: 'window1',
        component: WINDOW_COMPONENT,
      });

    const allComponents = houseComponents.getAll();
    expect(allComponents).toEqual([
      {
        id: 'wall1',
        ...WALL_COMPONENT,
        actualArea: WALL_COMPONENT.actualArea - WINDOW_COMPONENT.actualArea,
      },
      { id: 'window1', ...WINDOW_COMPONENT },
    ]);
  });

  it('should throw an error if a component is its own parent', () => {
    const houseComponents = HouseComponents.create();
    expect(() =>
      houseComponents.cloneWith({
        parentId: 'comp1',
        componentId: 'comp1',
        component: WALL_COMPONENT,
      }),
    ).throw('A component cannot be its own parent!');
  });

  it('should throw an error if a component is already assigned to a different parent', () => {
    const houseComponents = HouseComponents.create()
      .cloneWith({
        parentId: 'wall1',
        componentId: 'window1',
        component: WINDOW_COMPONENT,
      })
      .cloneWith({ componentId: 'wall2', component: WINDOW_COMPONENT });

    expect(() =>
      houseComponents.cloneWith({
        parentId: 'wall2',
        componentId: 'window1',
        component: WALL_COMPONENT,
      }),
    ).throw("The component 'window1' is already assigned to a parent.");
  });

  it('should throw an error if a component does not exist', () => {
    expect(() => HouseComponents.create().get('nonExistent')).throw(
      "The house component 'nonExistent' was not found!",
    );
  });

  it('should throw an error if actual area is incorrect after accounting for children', () => {
    const houseComponents = HouseComponents.create()
      .cloneWith({
        componentId: 'wall1',
        component: { ...WALL_COMPONENT, actualArea: 2 },
      })
      .cloneWith({
        parentId: 'wall1',
        componentId: 'window1',
        component: { ...WINDOW_COMPONENT, actualArea: 3 },
      });

    expect(() => houseComponents.get('wall1')).throw(
      "The actual area of house component 'wall1' is incorrect!",
    );
  });
});
