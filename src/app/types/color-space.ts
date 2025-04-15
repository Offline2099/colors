
import { ColorSpaceName } from '../constants/color-spaces/base/color-space-name.enum';
import { RGB, NotationRGB } from '../constants/color-spaces/space-rgb';
import { HSL, NotationHSL } from '../constants/color-spaces/space-hsl';
import { CMYK, NotationCMYK } from '../constants/color-spaces/space-cmyk';
import { RangeData } from './range'

export type ColorSpaceRange = RGB | HSL | CMYK;
export type ColorSpaceNotation = NotationRGB | NotationHSL | NotationCMYK;

export interface ColorSpace<ColorSpaceRange extends string, ColorSpaceNotation> {
  name: ColorSpaceName;
  ranges: RangeData<ColorSpaceRange>[];
  notations: ColorSpaceNotation[];
}

export type Space = ColorSpace<ColorSpaceRange, ColorSpaceNotation>;
