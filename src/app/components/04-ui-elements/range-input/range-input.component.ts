import { Component, HostBinding, input, computed, output } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { RangeType } from '../../../constants/color-spaces/base/ranges';
import { InputRange } from '../../../types/range';
import { ColorSpaceRange } from '../../../types/color-space';

@Component({
  selector: 'app-range-input',
  imports: [NgTemplateOutlet],
  templateUrl: './range-input.component.html',
  styleUrl: './range-input.component.scss'
})
export class RangeInputComponent {

  readonly RangeType = RangeType;

  @HostBinding('class.range-255') get isType255(): boolean { 
    return this.range().min === 0 && this.range().max === 255;
  }
  @HostBinding('class.range-360') get isType360(): boolean { 
    return this.range().min === 0 && this.range().max === 360;
  }
  @HostBinding('class.range-percentage') get isPercentage(): boolean {
    return this.range().type === RangeType.percentage;
  }
  @HostBinding('class.range-degree') get isDegree(): boolean {
    return this.range().type === RangeType.degree;
  }

  range = input.required<InputRange<ColorSpaceRange>>();

  min = computed<number>(() => this.adjustInputValue(this.range().min));
  max = computed<number>(() => this.adjustInputValue(this.range().max));
  currentValue = computed<number>(() => this.adjustInputValue(this.range().value()));
  currentValueText = computed<string>(() => this.currentValue().toFixed(0));

  valueChange = output<number>();

  adjustInputValue(value: number): number {
    return this.range().type === RangeType.percentage ? 100 * value : value;
  }

  adjustOutputValue(value: number): number {
    return this.range().type === RangeType.percentage ? value / 100 : value;
  }

  updateRange(e: Event): void {
    this.valueChange.emit(this.adjustOutputValue(Number((e.target as HTMLInputElement).value)));
  }

}
