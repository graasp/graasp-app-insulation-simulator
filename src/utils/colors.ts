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

export const fromHSL = ({
  h,
  s,
  l,
}: {
  h: number;
  s: number;
  l: number;
}): Color => new Color().setHSL(...[h, s, l]);
