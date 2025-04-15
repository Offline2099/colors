import { Signal } from '@angular/core';
import { RangeType } from '../constants/color-spaces/base/ranges';

export interface RangeBase {
  type: RangeType;
  min: number;
  max: number;
}

export interface RangeData<T extends string> extends RangeBase {
  id: T;
  name: string;
}

export interface InputRange<T extends string> extends RangeData<T> {
  value: Signal<number>;
  step: number;
}
