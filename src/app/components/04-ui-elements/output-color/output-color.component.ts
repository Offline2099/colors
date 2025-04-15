import { Component, Signal, input, computed } from '@angular/core';
import { NgClass, NgStyle } from '@angular/common';
import { Notation } from '../../../constants/color-spaces/base/notation.enum';
import { SPACE_RGB } from '../../../constants/color-spaces/space-rgb';
import { SPACE_HSL } from '../../../constants/color-spaces/space-hsl';
import { SPACE_CMYK } from '../../../constants/color-spaces/space-cmyk';
import { Color } from '../../../types/color';
import { ColorService } from '../../../services/color.service';

interface TextOutputBlock {
  isCollapsed: boolean;
  colorSpaceName: string;
  notations: {
    name: string;
    values: Signal<string[]>;
  }[];
}

@Component({
  selector: 'app-output-color',
  imports: [NgClass, NgStyle],
  templateUrl: './output-color.component.html',
  styleUrl: './output-color.component.scss'
})
export class OutputColorComponent {

  readonly Notation = Notation;
  readonly SPACE_HSL = SPACE_HSL;

  color = input.required<Color>();
  headerText = input.required<string>();

  textOutputBlocks: TextOutputBlock[];

  constructor(private colors: ColorService) {
    this.textOutputBlocks = this.constructTextOutputBlocks();
  }

  constructTextOutputBlocks(): TextOutputBlock[] {
    return [SPACE_RGB, SPACE_HSL, SPACE_CMYK].map(space => ({
      isCollapsed: false,
      colorSpaceName: space.name,
      notations: space.notations.map(notation => ({
        name: notation,
        values: computed<string[]>(() => this.colors.formatColorValues(this.color(), space, notation))
      }))
    }));
  }

  toggleTextOutputBlock(block: TextOutputBlock): void {
    block.isCollapsed = !block.isCollapsed;
  }


}
