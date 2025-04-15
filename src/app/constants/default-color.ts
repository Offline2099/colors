import { Color } from '../types/color';
import { RGB } from './color-spaces/space-rgb';
import { HSL } from './color-spaces/space-hsl';
import { CMYK } from './color-spaces/space-cmyk';

export const DEFAULT_COLOR: Color = {
  rgb: {
    [RGB.r]: 56,
    [RGB.g]: 77,
    [RGB.b]: 105
  },
  hsl: {
    [HSL.h]: 214,
    [HSL.s]: .304,
    [HSL.l]: .316
  },
  cmyk: {
    [CMYK.c]: .60,
    [CMYK.m]: .45,
    [CMYK.y]: .25,
    [CMYK.k]: .45
  },
  hex: '#384D69'
}
