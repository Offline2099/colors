import { Component } from '@angular/core';
import { NgClass } from '@angular/common';
import { SPACE_RGB } from '../../constants/color-spaces/space-rgb';
import { SPACE_HSL } from '../../constants/color-spaces/space-hsl';
import { SPACE_CMYK } from '../../constants/color-spaces/space-cmyk';
import { RangeInputBlockComponent } from '../04-ui-elements/range-input-block/range-input-block.component';

enum Section {
  perceptionOfColors,
  colorSpaces,
  colorSpaceRGB,
  colorSpaceHSL,
  colorSpaceCMYK
}

interface PageSection {
  id: Section;
  isCollapsed: boolean;
  isHovered: boolean;
}

@Component({
  selector: 'app-info',
  imports: [NgClass, RangeInputBlockComponent],
  templateUrl: './info.component.html',
  styleUrl: './info.component.scss'
})
export class InfoComponent {

  readonly Section = Section;
  readonly SPACE_RGB = SPACE_RGB;
  readonly SPACE_HSL = SPACE_HSL;
  readonly SPACE_CMYK = SPACE_CMYK;

  pageSections: PageSection[];

  constructor() {
    this.pageSections = this.constructSections();
  }

  constructSections(): PageSection[] {
    return Object.values(Section).filter(value => typeof value === 'number').map(id => ({
      id,
      isCollapsed: true,
      isHovered: false
    }));
  }

  toggleSection(section: PageSection): void {
    section.isCollapsed = !section.isCollapsed;
  }

  setSectionHoverStatus(section: PageSection, status: boolean): void {
    section.isHovered = status;
  }

}
