import { RGB } from '../constants/color-spaces/space-rgb';
import { HSL } from '../constants/color-spaces/space-hsl';
import { CMYK } from '../constants/color-spaces/space-cmyk';

export type ColorRGB = Record<RGB, number>;
export type ColorHSL = Record<HSL, number>;
export type ColorCMYK = Record<CMYK, number>;

export interface Color {
  rgb: ColorRGB;
  hsl: ColorHSL;
  cmyk: ColorCMYK;
  hex: string;
}
