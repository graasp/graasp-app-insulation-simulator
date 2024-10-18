import { Color } from 'three';

export const fromRGB = ({
  r,
  g,
  b,
}: {
  r: number;
  g: number;
  b: number;
}): Color => new Color(...[r, g, b]);
