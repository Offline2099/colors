import { RANGE_PERCENTAGE } from './base/ranges';
import { ColorSpaceName } from './base/color-space-name.enum';
import { Notation } from './base/notation.enum';
import { ColorSpace } from '../../types/color-space';

export enum CMYK {
  c = 'cyan',
  m = 'magenta',
  y = 'yellow',
  k = 'key'
}

export enum NotationCMYK {
  percentages = Notation.percentages,
  arithmetic = Notation.arithmetic
}

export const SPACE_CMYK: ColorSpace<CMYK, NotationCMYK> = {
  name: ColorSpaceName.cmyk,
  ranges: [
    { id: CMYK.c, name: 'Cyan', ...RANGE_PERCENTAGE },
    { id: CMYK.m, name: 'Magenta', ...RANGE_PERCENTAGE },
    { id: CMYK.y, name: 'Yellow', ...RANGE_PERCENTAGE },
    { id: CMYK.k, name: 'Key', ...RANGE_PERCENTAGE }
  ],
  notations: [NotationCMYK.percentages, NotationCMYK.arithmetic]
}
