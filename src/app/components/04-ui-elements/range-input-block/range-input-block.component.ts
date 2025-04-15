import { Component, HostBinding, input, model, computed } from '@angular/core';
import { NgStyle } from '@angular/common';
import { DEFAULT_COLOR } from '../../../constants/default-color';
import { Color } from '../../../types/color';
import { Space, ColorSpaceRange } from '../../../types/color-space';
import { InputRange } from '../../../types/range';
import { RangeInputComponent } from '../range-input/range-input.component';
import { ColorService } from '../../../services/color.service';

@Component({
  selector: 'app-range-input-block',
  imports: [NgStyle, RangeInputComponent],
  templateUrl: './range-input-block.component.html',
  styleUrl: './range-input-block.component.scss'
})
export class RangeInputBlockComponent {

  @HostBinding('class.collapsed') isCollapsed: boolean = false;
  @HostBinding('class.sample-displayed') get isSampleDisplayed(): boolean { return this.displaySample() }

  colorSpace = input.required<Space>();
  color = model<Color>(DEFAULT_COLOR);
  displaySample = input<boolean>(false);
 
  ranges: InputRange<ColorSpaceRange>[] = [];

  constructor(private colors: ColorService) {}

  ngOnInit(): void {
    this.ranges = this.constructInputRanges(this.colorSpace());
  }
  
  toggleBlock(): void {
    this.isCollapsed = !this.isCollapsed;
  }

  constructInputRanges(space: Space): InputRange<ColorSpaceRange>[] {
    return space.ranges.map(rangeData => ({
      ...rangeData,
      value: computed<number>(() => this.colors.getColorComponent(this.color(), rangeData.id)),
      step: 1
    }));
  }

  setColor(range: ColorSpaceRange, value: number): void {
    this.color.set(
      this.colors.changeColorByRangeValue(this.color(), this.colorSpace(), range, value)
    );
  }

}
