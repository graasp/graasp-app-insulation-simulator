import { act, renderHook } from '@testing-library/react';
import { enableMapSet } from 'immer';
import { describe, expect, it } from 'vitest';

import { HOUSE_INSULATIONS } from '@/config/houseInsulations';
import {
  SIMULATION_DEFAULT_WALL_COMPONENT_INSULATION,
  SIMULATION_DEFAULT_WINDOW_COMPONENT_INSULATION,
} from '@/config/simulation';
import { HouseComponent } from '@/types/houseComponent';

import { useHouseComponents } from './useHouseComponents';

// allow to manipulate Map state as a mutable state
enableMapSet();

describe('useHouseComponents', () => {
  it('should register and unregister a component', () => {
    const { result } = renderHook(() => useHouseComponents());

    act(() => {
      result.current.registerComponent({
        componentId: 'wall1',
        size: { height: 5, width: 2 },
        componentType: HouseComponent.Wall,
      });

      result.current.registerComponent({
        componentId: 'wall2',
        size: { height: 5, width: 2 },
        componentType: HouseComponent.Wall,
      });
    });

    let allComponents = result.current.all;
    expect(allComponents).toHaveLength(2);
    expect(allComponents[0].houseComponentId).toBe('wall1');
    expect(allComponents[1].houseComponentId).toBe('wall2');

    act(() => {
      result.current.unregisterComponent({ componentId: 'wall1' });
    });

    allComponents = result.current.all;
    expect(allComponents).toHaveLength(1);
    expect(allComponents[0].houseComponentId).toBe('wall2');
  });

  it('should unregister a child component when removing parent', () => {
    const { result } = renderHook(() => useHouseComponents());

    act(() => {
      result.current.registerComponent({
        componentId: 'wall1',
        size: { height: 5, width: 2 },
        componentType: HouseComponent.Wall,
      });

      result.current.registerComponent({
        componentId: 'wall2',
        size: { height: 5, width: 2 },
        componentType: HouseComponent.Wall,
      });

      result.current.registerComponent({
        parentId: 'wall1',
        componentId: 'window1',
        size: { height: 1, width: 1 },
        componentType: HouseComponent.Window,
      });
    });

    let allComponents = result.current.all;
    expect(allComponents).toHaveLength(3);
    expect(allComponents[0].houseComponentId).toBe('wall1');
    expect(allComponents[1].houseComponentId).toBe('wall2');
    expect(allComponents[2].houseComponentId).toBe('window1');

    act(() => {
      result.current.unregisterComponent({ componentId: 'wall1' });
    });

    allComponents = result.current.all;
    expect(allComponents).toHaveLength(1);
    expect(allComponents[0].houseComponentId).toBe('wall2');
  });

  it('should get all component with correct area', () => {
    const { result } = renderHook(() => useHouseComponents());

    act(() => {
      result.current.registerComponent({
        componentId: 'wall1',
        size: { height: 5, width: 2 },
        componentType: HouseComponent.Wall,
      });

      result.current.registerComponent({
        parentId: 'wall1',
        componentId: 'window1',
        size: { height: 2, width: 1 },
        componentType: HouseComponent.Window,
      });
    });

    const allComponents = result.current.all;
    expect(allComponents).toHaveLength(2);
    expect(allComponents).toEqual([
      {
        houseComponentId: 'wall1',
        ...SIMULATION_DEFAULT_WALL_COMPONENT_INSULATION,
        componentType: HouseComponent.Wall,
        size: { height: 5, width: 2 },
        actualArea: 5 * 2 - 2 * 1,
      },
      {
        houseComponentId: 'window1',
        ...SIMULATION_DEFAULT_WINDOW_COMPONENT_INSULATION,
        componentType: HouseComponent.Window,
        size: { height: 2, width: 1 },
        actualArea: 2 * 1,
      },
    ]);
  });

  it('should get component by type', () => {
    const { result } = renderHook(() => useHouseComponents());

    act(() => {
      result.current.registerComponent({
        componentId: 'wall1',
        size: { height: 5, width: 2 },
        componentType: HouseComponent.Wall,
      });

      result.current.registerComponent({
        componentId: 'wall2',
        size: { height: 5, width: 2 },
        componentType: HouseComponent.Wall,
      });

      result.current.registerComponent({
        parentId: 'wall1',
        componentId: 'window1',
        size: { height: 2, width: 1 },
        componentType: HouseComponent.Window,
      });
    });

    const allComponents = result.current.all;
    expect(allComponents).toHaveLength(3);
    expect(
      result.current.getFirstOfType(HouseComponent.Wall)?.houseComponentId,
    ).toEqual('wall1');
    expect(
      result.current.getFirstOfType(HouseComponent.Wall)?.actualArea,
    ).toEqual(5 * 2 - 2 * 1);
    expect(
      result.current.getFirstOfType(HouseComponent.Window)?.houseComponentId,
    ).toEqual('window1');
  });

  it('should change the wall insulations but not the windows', () => {
    const { result } = renderHook(() => useHouseComponents());

    act(() => {
      result.current.registerComponent({
        componentId: 'wall1',
        size: { height: 5, width: 2 },
        componentType: HouseComponent.Wall,
      });

      result.current.registerComponent({
        parentId: 'wall1',
        componentId: 'window1',
        size: { height: 2, width: 1 },
        componentType: HouseComponent.Window,
      });
    });

    let allComponents = result.current.all;
    expect(allComponents).toHaveLength(2);
    expect(result.current.getFirstOfType(HouseComponent.Wall)).toEqual({
      houseComponentId: 'wall1',
      ...SIMULATION_DEFAULT_WALL_COMPONENT_INSULATION,
      componentType: HouseComponent.Wall,
      size: { height: 5, width: 2 },
      actualArea: 5 * 2 - 2 * 1,
    });
    expect(result.current.getFirstOfType(HouseComponent.Window)).toEqual({
      houseComponentId: 'window1',
      ...SIMULATION_DEFAULT_WINDOW_COMPONENT_INSULATION,
      componentType: HouseComponent.Window,
      size: { height: 2, width: 1 },
      actualArea: 2 * 1,
    });

    act(() => {
      result.current.changeComponentInsulation({
        componentType: HouseComponent.Wall,
        newInsulation: 'Brick',
      });
    });

    allComponents = result.current.all;
    expect(allComponents).toHaveLength(2);
    expect(result.current.getFirstOfType(HouseComponent.Wall)).toEqual({
      houseComponentId: 'wall1',
      insulationName: 'Brick',
      buildingMaterials: HOUSE_INSULATIONS.Wall.Brick,
      componentType: HouseComponent.Wall,
      size: { height: 5, width: 2 },
      actualArea: 5 * 2 - 2 * 1,
    });
    expect(result.current.getFirstOfType(HouseComponent.Window)).toEqual({
      houseComponentId: 'window1',
      ...SIMULATION_DEFAULT_WINDOW_COMPONENT_INSULATION,
      componentType: HouseComponent.Window,
      size: { height: 2, width: 1 },
      actualArea: 2 * 1,
    });
  });

  it('should change the window insulations but not the walls', () => {
    const { result } = renderHook(() => useHouseComponents());

    act(() => {
      result.current.registerComponent({
        componentId: 'wall1',
        size: { height: 5, width: 2 },
        componentType: HouseComponent.Wall,
      });

      result.current.registerComponent({
        parentId: 'wall1',
        componentId: 'window1',
        size: { height: 2, width: 1 },
        componentType: HouseComponent.Window,
      });
    });

    let allComponents = result.current.all;
    expect(allComponents).toHaveLength(2);
    expect(result.current.getFirstOfType(HouseComponent.Wall)).toEqual({
      houseComponentId: 'wall1',
      ...SIMULATION_DEFAULT_WALL_COMPONENT_INSULATION,
      componentType: HouseComponent.Wall,
      size: { height: 5, width: 2 },
      actualArea: 5 * 2 - 2 * 1,
    });
    expect(result.current.getFirstOfType(HouseComponent.Window)).toEqual({
      houseComponentId: 'window1',
      ...SIMULATION_DEFAULT_WINDOW_COMPONENT_INSULATION,
      componentType: HouseComponent.Window,
      size: { height: 2, width: 1 },
      actualArea: 2 * 1,
    });

    act(() => {
      result.current.changeComponentInsulation({
        componentType: HouseComponent.Window,
        newInsulation: 'SinglePane',
      });
    });

    allComponents = result.current.all;
    expect(allComponents).toHaveLength(2);
    expect(result.current.getFirstOfType(HouseComponent.Wall)).toEqual({
      houseComponentId: 'wall1',
      ...SIMULATION_DEFAULT_WALL_COMPONENT_INSULATION,
      componentType: HouseComponent.Wall,
      size: { height: 5, width: 2 },
      actualArea: 5 * 2 - 2 * 1,
    });
    expect(result.current.getFirstOfType(HouseComponent.Window)).toEqual({
      houseComponentId: 'window1',
      insulationName: 'SinglePane',
      buildingMaterials: HOUSE_INSULATIONS.Window.SinglePane,
      componentType: HouseComponent.Window,
      size: { height: 2, width: 1 },
      actualArea: 2 * 1,
    });
  });

  it('should update the wall components but not the windows', () => {
    const { result } = renderHook(() => useHouseComponents());

    act(() => {
      result.current.registerComponent({
        componentId: 'wall1',
        size: { height: 5, width: 2 },
        componentType: HouseComponent.Wall,
      });

      result.current.registerComponent({
        parentId: 'wall1',
        componentId: 'window1',
        size: { height: 2, width: 1 },
        componentType: HouseComponent.Window,
      });
    });

    let allComponents = result.current.all;
    expect(allComponents).toHaveLength(2);
    expect(result.current.getFirstOfType(HouseComponent.Wall)).toEqual({
      houseComponentId: 'wall1',
      ...SIMULATION_DEFAULT_WALL_COMPONENT_INSULATION,
      componentType: HouseComponent.Wall,
      size: { height: 5, width: 2 },
      actualArea: 5 * 2 - 2 * 1,
    });
    expect(result.current.getFirstOfType(HouseComponent.Window)).toEqual({
      houseComponentId: 'window1',
      ...SIMULATION_DEFAULT_WINDOW_COMPONENT_INSULATION,
      componentType: HouseComponent.Window,
      size: { height: 2, width: 1 },
      actualArea: 2 * 1,
    });

    // update the house component
    act(() => {
      result.current.updateCompositionOfInsulation({
        componentType: HouseComponent.Wall,
        materialProps: {
          name: 'Aerogel',
          price: 15,
          thickness: 2,
        },
      });
    });

    allComponents = result.current.all;
    expect(allComponents).toHaveLength(2);
    expect(result.current.getFirstOfType(HouseComponent.Wall)).toEqual({
      houseComponentId: 'wall1',
      insulationName: 'Aerogel',
      buildingMaterials: HOUSE_INSULATIONS.Wall.Aerogel.map((d) =>
        d.name === 'Aerogel' ? d.from({ price: 15, thickness: 2 }) : d,
      ),
      componentType: HouseComponent.Wall,
      size: { height: 5, width: 2 },
      actualArea: 5 * 2 - 2 * 1,
    });
    expect(result.current.getFirstOfType(HouseComponent.Window)).toEqual({
      houseComponentId: 'window1',
      ...SIMULATION_DEFAULT_WINDOW_COMPONENT_INSULATION,
      componentType: HouseComponent.Window,
      size: { height: 2, width: 1 },
      actualArea: 2 * 1,
    });
  });

  it('should update the wall components but not the walls', () => {
    const { result } = renderHook(() => useHouseComponents());

    act(() => {
      result.current.registerComponent({
        componentId: 'wall1',
        size: { height: 5, width: 2 },
        componentType: HouseComponent.Wall,
      });

      result.current.registerComponent({
        parentId: 'wall1',
        componentId: 'window1',
        size: { height: 2, width: 1 },
        componentType: HouseComponent.Window,
      });
    });

    let allComponents = result.current.all;
    expect(allComponents).toHaveLength(2);
    expect(result.current.getFirstOfType(HouseComponent.Wall)).toEqual({
      houseComponentId: 'wall1',
      ...SIMULATION_DEFAULT_WALL_COMPONENT_INSULATION,
      componentType: HouseComponent.Wall,
      size: { height: 5, width: 2 },
      actualArea: 5 * 2 - 2 * 1,
    });
    expect(result.current.getFirstOfType(HouseComponent.Window)).toEqual({
      houseComponentId: 'window1',
      ...SIMULATION_DEFAULT_WINDOW_COMPONENT_INSULATION,
      componentType: HouseComponent.Window,
      size: { height: 2, width: 1 },
      actualArea: 2 * 1,
    });

    // update the house component
    act(() => {
      result.current.updateCompositionOfInsulation({
        componentType: HouseComponent.Window,
        materialProps: {
          name: 'DoublePane',
          price: 15,
          thickness: 2,
        },
      });
    });

    allComponents = result.current.all;
    expect(allComponents).toHaveLength(2);
    expect(result.current.getFirstOfType(HouseComponent.Wall)).toEqual({
      houseComponentId: 'wall1',
      ...SIMULATION_DEFAULT_WALL_COMPONENT_INSULATION,
      componentType: HouseComponent.Wall,
      size: { height: 5, width: 2 },
      actualArea: 5 * 2 - 2 * 1,
    });
    expect(result.current.getFirstOfType(HouseComponent.Window)).toEqual({
      houseComponentId: 'window1',
      insulationName: 'DoublePane',
      buildingMaterials: HOUSE_INSULATIONS.Window.DoublePane.map((d) =>
        d.name === 'DoublePane' ? d.from({ price: 15, thickness: 2 }) : d,
      ),
      componentType: HouseComponent.Window,
      size: { height: 2, width: 1 },
      actualArea: 2 * 1,
    });
  });

  it('should throw an error if a component is its own parent', () => {
    const { result } = renderHook(() => useHouseComponents());

    act(() => {
      expect(() => {
        result.current.registerComponent({
          parentId: 'comp1',
          componentId: 'comp1',
          size: { height: 5, width: 2 },
          componentType: HouseComponent.Wall,
        });
      }).toThrowError('A component cannot be its own parent!');
    });
  });

  it('should throw an error if actual area is incorrect after accounting for children', () => {
    const { result } = renderHook(() => useHouseComponents());

    expect(() => {
      act(() => {
        result.current.registerComponent({
          componentId: 'wall1',
          size: { width: 1, height: 1 },
          componentType: HouseComponent.Wall,
        });
        result.current.registerComponent({
          parentId: 'wall1',
          componentId: 'window1',
          size: { width: 2, height: 2 },
          componentType: HouseComponent.Window,
        });
      });
    }).toThrow("The actual area of house component 'wall1' is incorrect!");
  });
});
