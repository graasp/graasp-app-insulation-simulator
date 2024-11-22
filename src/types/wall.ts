import { GLTFResult } from '@/modules/models/House/ResidentialHouse/useResidentialHouse';

/**
 * Represents a 3D position as an array of [x, y, z] coordinates.
 */
export type Position = [x: number, y: number, z: number];

export type WallProps = {
  geometryKey: keyof GLTFResult['nodes'];
  position: Position;
  rotation: Position;
  windows: {
    positions: [Position, Position];
  };
  arrow: {
    rotation: Position;
    position: Position;
  };
  doorPosition: Position;
};

export enum WallKeys {
  Front = 'Front',
  Back = 'Back',
  Left = 'Left',
  Right = 'Right',
}
