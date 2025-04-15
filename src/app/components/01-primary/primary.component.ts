import { Component, signal } from '@angular/core';
import { DEFAULT_COLOR } from '../../constants/default-color';
import { SPACE_RGB } from '../../constants/color-spaces/space-rgb';
import { SPACE_HSL } from '../../constants/color-spaces/space-hsl';
import { SPACE_CMYK } from '../../constants/color-spaces/space-cmyk';
import { Color } from '../../types/color';
import { ColorSpace, ColorSpaceRange, ColorSpaceNotation } from '../../types/color-space';
import { OutputColorComponent } from '../04-ui-elements/output-color/output-color.component';
import { RangeInputBlockComponent } from '../04-ui-elements/range-input-block/range-input-block.component';

@Component({
  selector: 'app-primary',
  imports: [OutputColorComponent, RangeInputBlockComponent],
  templateUrl: './primary.component.html',
  styleUrl: './primary.component.scss'
})
export class PrimaryComponent {

  color = signal<Color>(DEFAULT_COLOR);
  
  colorSpaces: ColorSpace<ColorSpaceRange, ColorSpaceNotation>[] = [
    SPACE_RGB, SPACE_HSL, SPACE_CMYK
  ];

}
