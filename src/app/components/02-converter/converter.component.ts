import { Component } from '@angular/core';
import { NgClass } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
// Constants & Enums
import { DEFAULT_COLOR } from '../../constants/default-color';
import { SPACE_RGB, NotationRGB } from '../../constants/color-spaces/space-rgb';
import { SPACE_HSL } from '../../constants/color-spaces/space-hsl';
import { SPACE_CMYK } from '../../constants/color-spaces/space-cmyk';
import { Notation } from '../../constants/color-spaces/base/notation.enum';
import { ColorSpaceName } from '../../constants/color-spaces/base/color-space-name.enum';
// Interfaces & Types
import { Space, ColorSpaceNotation } from '../../types/color-space';
import { Converter, ConverterName } from '../../types/converter';
import { MenuOption } from '../../types/menu-option.interface';
// Components
import { MenuComponent } from '../04-ui-elements/menu/menu.component';
import { OutputColorComponent } from '../04-ui-elements/output-color/output-color.component';
// Services
import { ColorService } from '../../services/color.service';
import { InputValidationService } from '../../services/input-validation.service';

const DEFAULT_CONVERTER_INDEX: number = 0;
const DEFAULT_NOTATION_INDEX: number = 0;

@Component({
  selector: 'app-converter',
  imports: [NgClass, MenuComponent, OutputColorComponent],
  templateUrl: './converter.component.html',
  styleUrl: './converter.component.scss'
})
export class ConverterComponent {

  converters: Converter[];

  converterMenu: MenuOption[];
  notationMenu: Record<ConverterName, MenuOption[]>;

  selectedConverter!: ConverterName;
  fragmentSubscription: Subscription;

  fadeInState: boolean = true;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private colors: ColorService,
    private validation: InputValidationService
  ) {
    this.converters = this.constructConverters();
    this.converterMenu = this.constructConverterMenu(this.converters);
    this.notationMenu = this.constructNotationMenu(this.converters);
    this.fragmentSubscription = 
      this.route.fragment.subscribe(fragment => this.setPageStateFromURL(fragment));
  }

  constructConverters(): Converter[] {
    return [SPACE_RGB, SPACE_HSL, SPACE_CMYK]
      .map(space => ({
        space,
        name: space.name as ConverterName,
        notations: space.notations
          .filter(notation => notation !== NotationRGB.hexadecimal) as ColorSpaceNotation[]
      }))
      .concat({ space: SPACE_RGB, name: Notation.hexadecimal, notations: [NotationRGB.hexadecimal] })
      .map(converter => ({
        name: converter.name,
        inputNotations: converter.notations.map(notation => ({
          name: notation,
          example: this.constructExample(converter.space, notation)
        })),
        selectedNotationIndex: DEFAULT_NOTATION_INDEX,
        userInput: '',
        result: this.validation.emptyParseResult()
      }));
  }

  constructExample(space: Space, notation: ColorSpaceNotation): string {
    const values: string[] = this.colors.formatColorValues(DEFAULT_COLOR, space, notation);
    if ((notation as string) === Notation.percentages)
      values.forEach((_, index) => {
        if (!(space === SPACE_HSL && !index)) values[index] += '%';
      });
    return values.join(notation === NotationRGB.hexadecimal ? '' : ', ');
  }

  constructConverterMenu(converters: Converter[]): MenuOption[] {
    return converters.map(converter => ({
      text: converter.name,
      id: converter.name,
      urlFragment: this.urlFragmentString(converter, converter.selectedNotationIndex)
    }));
  }

  constructNotationMenu(converters: Converter[]): Record<string, MenuOption[]> {
    return converters.reduce((acc, converter) => {
      acc[converter.name] = converter.inputNotations.map((notation, index) => ({
        text: notation.name,
        id: index,
        urlFragment: this.urlFragmentString(converter, index)
      }));
      return acc;
    }, {} as Record<string, MenuOption[]>);
  }

  urlFragmentString(converter: Converter, notationIndex: number): string {
    const notation: string | null = converter.inputNotations.length > 1
      ? converter.inputNotations[notationIndex].name.toLowerCase()
      : null;
    return converter.name.toLowerCase() + (notation ? `-${notation}` : '');
  }

  setPageStateFromURL(fragment: string | null): void {
    if (!fragment) {
      this.setDefaultPageState();
      return;
    }
    const [converterId, notationId]: string[] = fragment.split('-');
    const converter: Converter = this.setConverterFromURL(converterId);
    this.setInputNotationFromURL(converter, notationId);
    this.converterMenu = this.constructConverterMenu(this.converters);
  }

  setConverterFromURL(converterId: string): Converter {
    const converter: Converter | undefined = 
      this.converters.find(converter => converter.name.toLowerCase() === converterId);
    if (!converter) {
      this.setDefaultPageState();
      return this.converters[DEFAULT_CONVERTER_INDEX];
    }
    this.selectedConverter = converter.name;
    return converter;
  }

  setInputNotationFromURL(converter: Converter, notationId?: string): void {
    if (!notationId) {
      converter.selectedNotationIndex = DEFAULT_NOTATION_INDEX;
      return;
    }
    const notationIndex: number = 
      converter.inputNotations.map(notation => notation.name.toLowerCase()).indexOf(notationId);
    if (notationIndex < 0) {
      this.setDefaultPageState();
      return;
    }
    converter.selectedNotationIndex = notationIndex;
  }
  
  setDefaultPageState(): void {
    const defaultFragment: string = 
      this.urlFragmentString(this.converters[DEFAULT_CONVERTER_INDEX], DEFAULT_NOTATION_INDEX);
    this.router.navigate([], { fragment: defaultFragment });
  }

  updateUserInput(converter: Converter, e: Event): void {
    converter.userInput = (e.target as HTMLInputElement).value;
  }

  onKeyDown(converter: Converter, e: KeyboardEvent): void {
    if (e.key !== 'Enter') return;
    this.runConverter(converter);
  }

  runConverter(converter: Converter): void {
    this.fadeInState = !this.fadeInState;
    converter.result = this.validation.emptyParseResult();
    const notation: ColorSpaceNotation = converter.inputNotations[converter.selectedNotationIndex].name;
    let space: Space;
    switch (converter.name) {
      case ColorSpaceName.rgb:
      case Notation.hexadecimal:
        space = SPACE_RGB;
        break;
      case ColorSpaceName.hsl:
        space = SPACE_HSL;
        break;
      case ColorSpaceName.cmyk:
        space = SPACE_CMYK;
    }
    converter.result = this.validation.parseColor(space, notation, converter.userInput)
  }

  ngOnDestroy(): void {
    if (this.fragmentSubscription)
      this.fragmentSubscription.unsubscribe();
  }

}
