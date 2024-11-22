import { useMemo } from 'react';

import { Position, WallKeys, WallProps } from '@/types/wall';

/**
 * Common properties shared by wall configurations.
 */
type CommonProps = {
  wallPosition: Position;
  windowPosition: Position;
  doorPosition: Position;
  arrowPosition: Position;
};

const invertAxesXZ = (pos: Position): Position => {
  const [x, y, z] = pos;
  return [z, y, x];
};

const BACK_WALL_PROPS: CommonProps = {
  wallPosition: [0, 0, 4.05] as const,
  windowPosition: [2.188, 1.8, 0.06] as const,
  doorPosition: [0, 1.295, 0.1] as const,
  arrowPosition: [0, 1.425, 1.1] as const,
};

const LEFT_WALL_PROPS: CommonProps = {
  wallPosition: [4.05, 0, 0] as const,
  windowPosition: [
    BACK_WALL_PROPS.windowPosition[2],
    1.4,
    BACK_WALL_PROPS.windowPosition[0],
  ] as const,
  doorPosition: invertAxesXZ(BACK_WALL_PROPS.doorPosition),
  arrowPosition: invertAxesXZ(BACK_WALL_PROPS.arrowPosition),
};

/**
 * Transforms a position based on the given wall key.
 * Applies necessary mirroring for front/right walls.
 * @param position - The original 3D position.
 * @param wall - The wall key indicating the transformation to apply.
 * @returns The transformed 3D position.
 * @throws {Error} If the provided wall key is invalid.
 */
const transformPosition = ({
  position,
  wall,
}: {
  position: Position;
  wall: WallKeys;
}): Position => {
  const [x, y, z] = position;

  switch (wall) {
    case WallKeys.Front:
      return [x, y, -z]; // Mirror along the z-axis
    case WallKeys.Back:
      return [x, y, z];
    case WallKeys.Left:
      return [x, y, z];
    case WallKeys.Right:
      return [-x, y, z]; // Mirror along the x-axis
    default:
      throw new Error(`The given wall ${wall} doesn't exist!`);
  }
};

/**
 * Creates the rotation Euler for the given wall.
 * @param wall - The wall key.
 * @returns The rotation Euler.
 * @throws {Error} If the provided wall key is invalid.
 */
const createRotation = (wall: WallKeys): Position => {
  switch (wall) {
    case WallKeys.Front:
      return [0, 0, 0];
    case WallKeys.Back:
      return [0, Math.PI, 0]; // Rotate 180 degrees around y-axis
    case WallKeys.Left:
      return [0, -Math.PI / 2, 0]; // Rotate -90 degrees around y-axis
    case WallKeys.Right:
      return [0, Math.PI / 2, 0]; // Rotate 90 degrees around y-axis
    default:
      throw new Error(`The given wall ${wall} doesn't exist!`);
  }
};

/**
 * Creates window positions based on the given wall and base position.
 * @param wall - The wall key.
 * @param position - The base window position.
 * @returns An array of two window positions.
 * @throws {Error} If the provided wall key is invalid.
 */
const createWindowPositions = ({
  wall,
  position,
}: {
  wall: WallKeys;
  position: Position;
}): [Position, Position] => {
  // Transform the base position to obtain the position of the window according to the wall.
  const [x, y, z] = transformPosition({ position, wall });
  switch (wall) {
    case WallKeys.Front:
    case WallKeys.Back:
      return [
        [x, y, z],
        [-x, y, z],
      ];
    case WallKeys.Left:
    case WallKeys.Right:
      return [
        [x, y, z],
        [x, y, -z],
      ];
    default:
      throw new Error(`The given wall ${wall} doesn't exist!`);
  }
};

/**
 * Factory function to create wall geometries based on the wall key and geometry key.
 * @param wall - The wall key.
 * @param geometryKey - The key for the geometry.
 * @returns The wall properties.
 */
const wallGeometriesFactory = (
  wall: WallKeys,
  geometryKey: WallProps['geometryKey'],
): WallProps => {
  const isFrontOrBack = wall === WallKeys.Front || wall === WallKeys.Back;

  // Use the appropriate common properties based on wall type
  const { wallPosition, windowPosition, doorPosition, arrowPosition } =
    isFrontOrBack ? BACK_WALL_PROPS : LEFT_WALL_PROPS;

  const rotation = createRotation(wall);

  return {
    geometryKey,
    position: transformPosition({ position: wallPosition, wall }),
    windows: {
      positions: createWindowPositions({ position: windowPosition, wall }),
    },
    doorPosition: transformPosition({ position: doorPosition, wall }),
    rotation,
    arrow: {
      rotation: [0, rotation[1] + Math.PI / 2, 0], // set the arrow perpendicular to the wall
      position: transformPosition({ position: arrowPosition, wall }),
    },
  };
};

type UseWallGeometriesReturnType = {
  wallGeometries: {
    [key in keyof typeof WallKeys]: WallProps;
  };
};

/**
 * Custom hook to generate and memoize wall geometries.
 * @returns An object containing the wall geometries.
 */
export const useWallGeometries = (): UseWallGeometriesReturnType => {
  // Memoize the wall geometries to prevent unnecessary recalculations
  const wallGeometries = useMemo(
    () => ({
      [WallKeys.Front]: wallGeometriesFactory(WallKeys.Front, 'WallFront'),
      [WallKeys.Back]: wallGeometriesFactory(WallKeys.Back, 'WallFront'),
      [WallKeys.Left]: wallGeometriesFactory(WallKeys.Left, 'WallLeft'),
      [WallKeys.Right]: wallGeometriesFactory(WallKeys.Right, 'WallLeft'),
    }),
    [],
  );

  return { wallGeometries };
};
