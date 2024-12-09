import { Vector3 } from 'three';

export const WindowScaleSize = {
  Small: new Vector3(0.8, 0.8, 1),
  Medium: new Vector3(1, 1, 1),
  Large: new Vector3(1.2, 1.2, 1),
} as const;

export const WindowSizes = Object.keys(WindowScaleSize);

export type WindowSizeType = keyof typeof WindowScaleSize;
