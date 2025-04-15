import { DECIMAL_0_TO_255 } from './base/ranges';
import { ColorSpaceName } from './base/color-space-name.enum';
import { Notation } from './base/notation.enum';
import { ColorSpace } from '../../types/color-space';

export enum RGB {
  r = 'red',
  g = 'green',
  b = 'blue'
}

export enum NotationRGB {
  decimal = Notation.decimal,
  percentages = Notation.percentages,
  arithmetic = Notation.arithmetic,
  hexadecimal = Notation.hexadecimal
}

export const SPACE_RGB: ColorSpace<RGB, NotationRGB> = {
  name: ColorSpaceName.rgb,
  ranges: [
    { id: RGB.r, name: 'Red', ...DECIMAL_0_TO_255 },
    { id: RGB.g, name: 'Green', ...DECIMAL_0_TO_255 },
    { id: RGB.b, name: 'Blue', ...DECIMAL_0_TO_255 }
  ],
  notations: [
    NotationRGB.decimal,
    NotationRGB.percentages,
    NotationRGB.arithmetic,
    NotationRGB.hexadecimal
  ]
}
