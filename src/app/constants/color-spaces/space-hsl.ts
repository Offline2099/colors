import { DEGREE_0_TO_360, RANGE_PERCENTAGE } from './base/ranges';
import { ColorSpaceName } from './base/color-space-name.enum';
import { Notation } from './base/notation.enum';
import { ColorSpace } from '../../types/color-space';

export enum HSL {
  h = 'hue',
  s = 'saturation',
  l = 'lightness'
}

export enum NotationHSL {
  percentages = Notation.percentages,
  arithmetic = Notation.arithmetic
}

export const SPACE_HSL: ColorSpace<HSL, NotationHSL> = {
  name: ColorSpaceName.hsl,
  ranges: [
    { id: HSL.h, name: 'Hue', ...DEGREE_0_TO_360 },
    { id: HSL.s, name: 'Saturation', ...RANGE_PERCENTAGE },
    { id: HSL.l, name: 'Lightness', ...RANGE_PERCENTAGE }
  ],
  notations: [NotationHSL.percentages, NotationHSL.arithmetic]
}
