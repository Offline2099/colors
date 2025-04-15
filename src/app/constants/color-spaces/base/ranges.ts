import { RangeBase } from '../../../types/range';

export enum RangeType {
  decimal,
  percentage,
  degree
}

export const DECIMAL_0_TO_255: RangeBase = {
  type: RangeType.decimal,
  min: 0,
  max: 255
}

export const DEGREE_0_TO_360: RangeBase = {
  type: RangeType.degree,
  min: 0,
  max: 360
}

export const RANGE_PERCENTAGE: RangeBase = {
  type: RangeType.percentage,
  min: 0,
  max: 1
}
