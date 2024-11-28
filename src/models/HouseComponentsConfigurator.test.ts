import { describe, expect, it } from 'vitest';

import { BuildingMaterial } from '@/models/BuildingMaterial';
import { HouseComponent } from '@/types/houseComponent';
import { HouseComponentInsulation } from '@/types/houseComponentInsulation';

import { HouseComponentsConfigurator } from './HouseComponentsConfigurator';

const WALL_MATERIAL_1 = BuildingMaterial.create({
  thermalConductivity: 0.25,
  thickness: 0.02,
  price: 10,
  name: 'random wall brick',
});

const WALL_COMPONENT_INSULATION: HouseComponentInsulation = {
  insulationName: 'Brick',
  buildingMaterials: [WALL_MATERIAL_1],
  actualArea: 10,
  componentType: HouseComponent.Wall,
  size: { width: 5, height: 2 },
};

const WINDOW_MATERIAL = BuildingMaterial.create({
  thermalConductivity: 0.25,
  thickness: 0.02,
  price: 10,
  name: 'glass',
});

const WINDOW_COMPONENT_INSULATION: HouseComponentInsulation = {
  insulationName: 'SinglePane',
  buildingMaterials: [WINDOW_MATERIAL],
  actualArea: 2,
  componentType: HouseComponent.Window,
  size: { width: 1, height: 2 },
};

describe('HouseComponentsConfigurator', () => {
  it('should create an empty instance using the static create method', () => {
    const houseComponents = HouseComponentsConfigurator.create();
    expect(houseComponents.getAll().length).eq(0);
  });

  it('should add a new component and returns a new instance', () => {
    const houseComponents = HouseComponentsConfigurator.create();
    const newHouseComponents = houseComponents.cloneWith({
      componentId: 'wall1',
      component: WALL_COMPONENT_INSULATION,
    });

    expect(newHouseComponents.getAll().length).eq(1);
    expect(newHouseComponents.get('wall1')).toEqual(WALL_COMPONENT_INSULATION);

    // Original instance should remain unchanged
    expect(houseComponents.getAll().length).eq(0);
  });

  it('should add a child component', () => {
    const houseComponents = HouseComponentsConfigurator.create().cloneWith({
      componentId: 'wall1',
      component: WALL_COMPONENT_INSULATION,
    });
    const newHouseComponents = houseComponents.cloneWith({
      parentId: 'wall1',
      componentId: 'window1',
      component: WINDOW_COMPONENT_INSULATION,
    });

    expect(newHouseComponents.getAll().length).eq(2);
    expect(newHouseComponents.get('window1')).toEqual(
      WINDOW_COMPONENT_INSULATION,
    );
    expect(newHouseComponents.get('wall1').actualArea).eq(
      WALL_COMPONENT_INSULATION.actualArea -
        WINDOW_COMPONENT_INSULATION.actualArea,
    );
  });

  it('should get a component', () => {
    const houseComponents = HouseComponentsConfigurator.create()
      .cloneWith({ componentId: 'wall1', component: WALL_COMPONENT_INSULATION })
      .cloneWith({
        parentId: 'wall1',
        componentId: 'window1',
        component: WINDOW_COMPONENT_INSULATION,
      });

    const wall = houseComponents.get('wall1');
    expect(wall.actualArea).eq(
      WALL_COMPONENT_INSULATION.actualArea -
        WINDOW_COMPONENT_INSULATION.actualArea,
    );
  });

  it('should get all components', () => {
    const houseComponents = HouseComponentsConfigurator.create()
      .cloneWith({ componentId: 'wall1', component: WALL_COMPONENT_INSULATION })
      .cloneWith({
        parentId: 'wall1',
        componentId: 'window1',
        component: WINDOW_COMPONENT_INSULATION,
      });

    const allComponents = houseComponents.getAll();
    expect(allComponents).toEqual([
      {
        houseComponentId: 'wall1',
        ...WALL_COMPONENT_INSULATION,
        actualArea:
          WALL_COMPONENT_INSULATION.actualArea -
          WINDOW_COMPONENT_INSULATION.actualArea,
      },
      { houseComponentId: 'window1', ...WINDOW_COMPONENT_INSULATION },
    ]);
  });

  it('should get the good component by type', () => {
    const houseConfigurator = HouseComponentsConfigurator.create()
      .cloneWith({
        componentId: 'wall1',
        component: WALL_COMPONENT_INSULATION,
      })
      .cloneWith({
        parentId: 'wall1',
        componentId: 'window1',
        component: WINDOW_COMPONENT_INSULATION,
      });

    expect(houseConfigurator.getAll().length).eq(2);
    expect(
      houseConfigurator.getFirstOfType(HouseComponent.Wall)?.houseComponentId,
    ).toEqual('wall1');
    expect(
      houseConfigurator.getFirstOfType(HouseComponent.Wall)?.actualArea,
    ).toEqual(
      WALL_COMPONENT_INSULATION.actualArea -
        WINDOW_COMPONENT_INSULATION.actualArea,
    );
    expect(
      houseConfigurator.getFirstOfType(HouseComponent.Window)?.houseComponentId,
    ).toEqual('window1');
  });

  it('should update the wall components but not the windows', () => {
    const houseComponents = HouseComponentsConfigurator.create().cloneWith({
      componentId: 'wall1',
      component: WALL_COMPONENT_INSULATION,
    });
    const newHouseComponents = houseComponents.cloneWith({
      parentId: 'wall1',
      componentId: 'window1',
      component: WINDOW_COMPONENT_INSULATION,
    });

    expect(newHouseComponents.getAll().length).eq(2);
    expect(newHouseComponents.get('window1')).toEqual(
      WINDOW_COMPONENT_INSULATION,
    );
    expect(newHouseComponents.get('wall1').actualArea).eq(
      WALL_COMPONENT_INSULATION.actualArea -
        WINDOW_COMPONENT_INSULATION.actualArea,
    );

    // update the house component
    const newMaterial = WALL_MATERIAL_1.from({ price: 15, thickness: 2 });
    const updatedHouseComponents = newHouseComponents.cloneWithNewInsulation({
      componentType: HouseComponent.Wall,
      insulation: {
        name: 'Aerogel',
        buildingMaterials: [newMaterial],
      },
    });

    // check that the walls have been updated
    const allWalls = updatedHouseComponents.getByType(HouseComponent.Wall);

    expect(allWalls.length).toBe(1);
    expect(allWalls[0].buildingMaterials.length).toBe(1);
    expect(allWalls[0].buildingMaterials[0]).toBe(newMaterial);

    // check that the windows have not been updated
    const allWindows = updatedHouseComponents.getByType(HouseComponent.Window);

    expect(allWindows.length).toBe(1);
    expect(allWindows[0].buildingMaterials.length).toBe(1);
    expect(allWindows[0].buildingMaterials[0]).not.toBe(newMaterial);
    expect(allWindows[0].buildingMaterials[0]).toBe(WINDOW_MATERIAL);
  });

  it('should update the windows components but not the walls', () => {
    const houseComponents = HouseComponentsConfigurator.create().cloneWith({
      componentId: 'wall1',
      component: WALL_COMPONENT_INSULATION,
    });
    const newHouseComponents = houseComponents.cloneWith({
      parentId: 'wall1',
      componentId: 'window1',
      component: WINDOW_COMPONENT_INSULATION,
    });

    expect(newHouseComponents.getAll().length).eq(2);
    expect(newHouseComponents.get('window1')).toEqual(
      WINDOW_COMPONENT_INSULATION,
    );
    expect(newHouseComponents.get('wall1').actualArea).eq(
      WALL_COMPONENT_INSULATION.actualArea -
        WINDOW_COMPONENT_INSULATION.actualArea,
    );

    // update the house component
    const newMaterial = WINDOW_MATERIAL.from({ price: 15, thickness: 2 });
    const updatedHouseComponents = newHouseComponents.cloneWithNewInsulation({
      componentType: HouseComponent.Window,
      insulation: {
        name: 'DoublePane',
        buildingMaterials: [newMaterial],
      },
    });

    // check that the walls have not been updated
    const allWalls = updatedHouseComponents.getByType(HouseComponent.Wall);

    expect(allWalls.length).toBe(1);
    expect(allWalls[0].buildingMaterials.length).toBe(1);
    expect(allWalls[0].buildingMaterials[0]).not.toBe(newMaterial);
    expect(allWalls[0].buildingMaterials[0]).toBe(WALL_MATERIAL_1);

    // check that the windows have been updated
    const allWindows = updatedHouseComponents.getByType(HouseComponent.Window);

    expect(allWindows.length).toBe(1);
    expect(allWindows[0].buildingMaterials.length).toBe(1);
    expect(allWindows[0].buildingMaterials[0]).toBe(newMaterial);
  });

  it('should throw an error if a component is its own parent', () => {
    const houseComponents = HouseComponentsConfigurator.create();
    expect(() =>
      houseComponents.cloneWith({
        parentId: 'comp1',
        componentId: 'comp1',
        component: WALL_COMPONENT_INSULATION,
      }),
    ).throw('A component cannot be its own parent!');
  });

  it('should throw an error if a component is already assigned to a different parent', () => {
    const houseComponents = HouseComponentsConfigurator.create()
      .cloneWith({
        parentId: 'wall1',
        componentId: 'window1',
        component: WINDOW_COMPONENT_INSULATION,
      })
      .cloneWith({
        componentId: 'wall2',
        component: WINDOW_COMPONENT_INSULATION,
      });

    expect(() =>
      houseComponents.cloneWith({
        parentId: 'wall2',
        componentId: 'window1',
        component: WALL_COMPONENT_INSULATION,
      }),
    ).throw("The component 'window1' is already assigned to a parent.");
  });

  it('should throw an error if a component does not exist', () => {
    expect(() => HouseComponentsConfigurator.create().get('nonExistent')).throw(
      "The house component 'nonExistent' was not found!",
    );
  });

  it('should throw an error if actual area is incorrect after accounting for children', () => {
    const houseComponents = HouseComponentsConfigurator.create()
      .cloneWith({
        componentId: 'wall1',
        component: { ...WALL_COMPONENT_INSULATION, actualArea: 2 },
      })
      .cloneWith({
        parentId: 'wall1',
        componentId: 'window1',
        component: { ...WINDOW_COMPONENT_INSULATION, actualArea: 3 },
      });

    expect(() => houseComponents.get('wall1')).throw(
      "The actual area of house component 'wall1' is incorrect!",
    );
  });
});
