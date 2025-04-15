import { Injectable } from '@angular/core';
import { RGB, NotationRGB } from '../constants/color-spaces/space-rgb';
import { HSL, NotationHSL, SPACE_HSL } from '../constants/color-spaces/space-hsl';
import { CMYK, NotationCMYK } from '../constants/color-spaces/space-cmyk';
import { Notation } from '../constants/color-spaces/base/notation.enum';
import { ColorSpaceName } from '../constants/color-spaces/base/color-space-name.enum';
import { Color, ColorRGB } from '../types/color';
import { Space, ColorSpaceNotation } from '../types/color-space';
import { ColorParseResult } from '../types/converter';
import { InputIssue } from '../types/converter';
import { ColorService } from './color.service';

const HEXADECIMAL_ALLLOWED_SYMBOLS: RegExp = /^[\dA-Fa-f\s#]+$/;
const CSV_ALLOWED_SYMBOLS: RegExp = /^[\d\%\s.,()]+$/;
const SPACES: RegExp = /[\s]/g;
const SPACES_OR_HASH: RegExp = /[\s#]/g;
const PARENTHESES: RegExp = /[()]/;
const SPACES_OR_PARENTHESES: RegExp = /[\s()]/g;
const SPACES_OR_PARENTHESES_OR_PERCENT: RegExp = /[\s\%()]/g;

enum ValueIssueType {
  isNotNumber,
  isOutOfRange,
  isSuspicious
}

interface ValidityData {
  issueType: ValueIssueType;
  entries: {
    value: string;
    isValid: boolean;
  }[];
}

@Injectable({
  providedIn: 'root'
})
export class InputValidationService {

  constructor(private colors: ColorService) {}

  // ==========================================================================
  //  COMMON METHODS
  // ==========================================================================

  private checkForErrors(result: ColorParseResult, checks: Array<() => void>): void {
    for (const check of checks) {
      check();
      if (result.errors.length) return;
    }
  }

  private addIssuesToList(list: InputIssue[], issues: (InputIssue | null)[]): void {
    issues.forEach(issue => {
      if (issue) list.push(issue);
    });
  }

  private isEmptyInput(input: string): InputIssue | null {
    return input.replace(SPACES, '') ? null : { text: 'The input field is empty.' }
  }

  private hasUnexpectedSymbols(input: string, allowedPattern: RegExp): InputIssue | null {
    if (input.match(allowedPattern)) return null;
    return {
      text: 'Input contains unexpected symbols.',
      details: [...input].map(char => ({
        text: char,
        isValid: allowedPattern.test(char)
      }))
    }
  }

  emptyParseResult(): ColorParseResult {
    return { errors: [], warnings: [], color: null }
  }

  parseColor(space: Space, notation: ColorSpaceNotation, input: string): ColorParseResult {
    return notation === NotationRGB.hexadecimal
      ? this.validateHexadecimal(input)
      : this.validateColorCSV(space, notation, input);
  }

  // ==========================================================================
  //  HEXADECIMAL COLOR STRING VALIDATION AND PARSING
  // ==========================================================================

  /* 

    VALIDATION LOGIC

    - There must be no symbols other than hash, digits, and letters A to F 
      (lowercase or uppercase). Spaces are tolerated.
    - After spaces are removed, hash sign can only be at the beginning.
    - After spaces and hash are removed, length must be 3 or 6 symbols.

  */

  private validateHexadecimal(input: string): ColorParseResult {
    const result: ColorParseResult = this.emptyParseResult();
    const cleanInput: string = input.replace(SPACES_OR_HASH, '');
    this.checkForErrors(result, [
      () => this.addIssuesToList(result.errors, [this.isEmptyInput(input)]),
      () => this.addIssuesToList(result.errors, [
        this.hasUnexpectedSymbols(input, HEXADECIMAL_ALLLOWED_SYMBOLS),
        this.hasMisplacedHashSign(input)        
      ]),
      () => this.addIssuesToList(result.errors, [this.isInvalidLength(cleanInput)])
    ]);
    if (result.errors.length) return result;
    result.color = this.colors.setColorFromRGB(this.parseValidHexadecimal(cleanInput));
    return result;
  }

  private hasMisplacedHashSign(input: string): InputIssue | null {
    if (!input.replace(SPACES, '').slice(1).includes('#')) return null;
    return {
      text: 'The # symbol can only appear at the beginning of the input.',
      details: [...input].map((char, index) => ({
        text: char,
        isValid: !index || char !== '#'
      }))
    }
  }

  private isInvalidLength(input: string): InputIssue | null {
    if (input.length === 6 || input.length === 3) return null;
    return {
      text: 'The length of the input does not match a valid hexadecimal color format.'
    }
  }

  private parseValidHexadecimal(input: string): ColorRGB {
    const value: string = input.length === 3 ? this.shortHexadecimalToFull(input) : input;
    const components: number[] = this.splitIntoHexadecimalComponents(value)
      .map(hexValue => parseInt(hexValue, 16));
    return {
      [RGB.r]: components[0],
      [RGB.g]: components[1],
      [RGB.b]: components[2]
    }
  }

  private shortHexadecimalToFull(value: string): string {
    return value.replace(/./g, '$&$&');
  }

  private splitIntoHexadecimalComponents(value: string): string[] {
    return value.match(/.{2}/g) as string[];
  }

  // ==========================================================================
  //  CSV COLOR STRING VALIDATION AND PARSING
  // ==========================================================================

  /* 
  
    VALIDATION LOGIC

    - There must be no symbols other than commas, digits, dot, percent sign,
      parentheses, or spaces.
    - The number of values (and hence commas) must match the number of color
      components for the color space.
    - After spaces are removed, parentheses can only be at the beginning or
      end of the input.
    - Prcent sign is only allowed:
      - if the color notation is set to percentages,
      - in a range which can be expressed as percentage,
      - at the end of the value (after spaces and parentheses are removed).
    - Each value must be convertible to a number (after spaces, parentheses,
      and percent signs are removed).
    - Each value must be within the valid range for the color component it
      represents (for the selected color space and input notation).

  */

  private validateColorCSV(space: Space, notation: ColorSpaceNotation, input: string): ColorParseResult {
    const result: ColorParseResult = this.emptyParseResult();
    const values: string[] = input.split(',');
    this.checkForErrors(result, [
      () => this.addIssuesToList(result.errors, [this.isEmptyInput(input)]),
      () => this.addIssuesToList(result.errors, [
        this.isInvalidNumberOfValues(space, values),
        this.hasUnexpectedSymbols(input, CSV_ALLOWED_SYMBOLS),
        this.hasMisplacedParentheses(input),
        this.hasMisplacedPercentSign(space, notation, values)
      ]),
      () => this.addIssuesToList(result.errors, [this.hasNonNumericValues(space, values)]),
      () => this.addIssuesToList(result.errors, [this.hasValuesOutOfRange(space, notation, values)])
    ]);
    if (result.errors.length) return result;
    this.addIssuesToList(result.warnings, [this.hasStrangelySmallValues(space, notation, values)]);
    result.color = this.parseValidColorCSV(space, notation, values);
    return result;
  }

  private isInvalidNumberOfValues(space: Space, values: string[]): InputIssue | null {
    const length: number = values.length;
    const expected: number = space.ranges.length;
    if (length === expected) return null;
    return {
      text: `Input must contain ${expected} values separated by ${expected - 1} commas.` +
        ` Found ${length} value${length > 1 ? 's' : ''} instead.`
    }
  }

  private hasMisplacedParentheses(input: string): InputIssue | null {
    if (input.replace(SPACES, '').slice(1, -1).search(PARENTHESES) < 0) return null;
    return {
      text: 'Parentheses can only occur at the beginning or end of the input.',
      details: [...input].map((char, index) => ({
        text: char,
        isValid: !index || index === input.length - 1 || char.search(PARENTHESES) < 0
      }))
    }
  }

  private hasMisplacedPercentSign(space: Space, notation: ColorSpaceNotation, values: string[]): InputIssue | null {
    if (!values.join('').includes('%')) return null;
    const isWrongNotation: boolean = (notation as string) !== Notation.percentages;
    const isWrongRange: boolean = space === SPACE_HSL && values[0].includes('%');
    const isWrongPosition: boolean = values.some(value => {
      const cleanValue: string = value.replace(SPACES_OR_PARENTHESES, '');
      const percentSignIndex: number = cleanValue.indexOf('%');
      return percentSignIndex >= 0 && percentSignIndex !== cleanValue.length - 1;
    });
    if (!isWrongNotation && !isWrongRange && !isWrongPosition) return null;
    return {
      text: 'Input contains percent signs where it is not expected.',
      details: values.flatMap((value, valueIndex) => 
        [...value].map((char, index) => ({
          text: char,
          isValid: char !== '%' || 
            (!isWrongNotation && !(isWrongRange && !valueIndex) && 
              value.slice(index + 1).replace(SPACES_OR_PARENTHESES, '').length === 0)
        })).concat(valueIndex === values.length - 1 ? [] : { text: ',', isValid: true })
      )
    }
  }

  private hasNonNumericValues(space: Space, values: string[]): InputIssue | null {
    const data: ValidityData = {
      issueType: ValueIssueType.isNotNumber,
      entries: values.map(value => {
        const cleanValue: string = value.replace(SPACES_OR_PARENTHESES_OR_PERCENT, '')
        return {
          value,
          isValid: cleanValue.split('.').length < 3 && !isNaN(Number(cleanValue))
        }
      })
    }
    return data.entries.some(entry => !entry.isValid)
      ? this.constructIssuesForRangeValues(space, data)
      : null;
  }

  private hasValuesOutOfRange(space: Space, notation: ColorSpaceNotation, values: string[]): InputIssue | null {
    const data: ValidityData = {
      issueType: ValueIssueType.isOutOfRange,
      entries: values.map((value, index) => {
        const cleanValue: string = value.replace(SPACES_OR_PARENTHESES, '');
        const numericValue: number = Number(value.replace(SPACES_OR_PARENTHESES_OR_PERCENT, ''));
        const min: number = space.ranges[index].min;
        let max: number = space.ranges[index].max;
        if (space.ranges[index].id !== HSL.h) {
          if ((notation as string) === Notation.percentages) max = 100;
          else if ((notation as string) === Notation.arithmetic) max = 1;
        }
        return {
          value: cleanValue,
          isValid: numericValue >= min && numericValue <= max
        }
      })
    }
    return data.entries.some(entry => !entry.isValid)
      ? this.constructIssuesForRangeValues(space, data)
      : null;
  }

  private hasStrangelySmallValues(space: Space, notation: ColorSpaceNotation, values: string[]): InputIssue | null {
    const isArithmetic: boolean = (notation as string) === Notation.arithmetic;
    const data: ValidityData = {
      issueType: ValueIssueType.isSuspicious,
      entries: values.map(value => {
        const cleanValue: string = value.replace(SPACES_OR_PARENTHESES, '');
        const numericValue: number = Number(value.replace(SPACES_OR_PARENTHESES_OR_PERCENT, ''));
        return {
          value: cleanValue,
          isValid: isArithmetic || numericValue <= 0 || numericValue >= 1
        }
      })
    }
    return data.entries.some(entry => !entry.isValid)
      ? this.constructIssuesForRangeValues(space, data)
      : null;
  }

  private constructIssuesForRangeValues(space: Space, data: ValidityData): InputIssue {

    let issueTextStart: string, issueTextEnd: string;

    const ordinal: string[] = ['first', 'second', 'third', 'fourth'];
    const invalidIndices: string[] = data.entries
      .map((entry, index) => entry.isValid ? '' : ordinal[index])
      .filter(ordinal => ordinal);

    issueTextStart = [
      `The ${invalidIndices[0]} value`,
      `The ${invalidIndices[0]} and ${invalidIndices[1]} values`,
      data.entries.length === 3 
        ? 'All three values'
        : `The ${invalidIndices[0]}, ${invalidIndices[1]}, and ${invalidIndices[3]} values`,
      'All four values'
    ][invalidIndices.length - 1];

    switch (data.issueType) {
      case ValueIssueType.isNotNumber:
        issueTextEnd = ` ${invalidIndices.length > 1 ? 'do' : 'does'} not represent a number.`;
        break;
      case ValueIssueType.isOutOfRange:
        issueTextEnd = ` ${invalidIndices.length > 1 ? 'are' : 'is'} out of range of the ` +
          `${space.name} color space with the selected input format.`;
        break;
      case ValueIssueType.isSuspicious:
        issueTextEnd = ` ${invalidIndices.length > 1 ? 'are' : 'is'} smaller than 1. ` +
          `Make sure the input is correct and the proper format is selected.`;
    }
    
    return {
      text: issueTextStart + issueTextEnd,
      details: data.entries.flatMap(entry => [entry, null]).slice(0, -1).map(entry => ({
        text: entry ? entry.value : ',',
        isValid: entry ? entry.isValid : true
      }))
    }
  }

  private parseValidColorCSV(space: Space, notation: ColorSpaceNotation, values: string[]): Color {
    const numericValues: number[] = 
      values.map(value => Number(value.replace(SPACES_OR_PARENTHESES_OR_PERCENT, '')));
    switch (space.name) {
      case ColorSpaceName.rgb:
        return this.parseValidRGB(notation as NotationRGB, numericValues);
      case ColorSpaceName.hsl:
        return this.parseValidHSL(notation as NotationHSL, numericValues);
      case ColorSpaceName.cmyk:
        return this.parseValidCMYK(notation as NotationCMYK, numericValues);
    }
  }

  private parseValidRGB(notation: NotationRGB, values: number[]): Color {
    const [r, g, b]: number[] = values;
    let q: number = 1;
    if (notation === NotationRGB.percentages) q = 255 / 100;
    else if (notation === NotationRGB.arithmetic) q = 255;
    return this.colors.setColorFromRGB({ [RGB.r]: q * r , [RGB.g]: q * g, [RGB.b]: q * b });
  }

  private parseValidHSL(notation: NotationHSL, values: number[]): Color {
    const [h, s, l]: number[] = values;
    const q: number = notation === NotationHSL.percentages ? 0.01 : 1;
    return this.colors.setColorFromHSL({ [HSL.h]: h, [HSL.s]: q * s, [HSL.l]: q * l });
  }

  private parseValidCMYK(notation: NotationCMYK, values: number[]): Color {
    const [c, m, y, k]: number[] = values;
    const q: number = notation === NotationCMYK.percentages ? 0.01 : 1;
    return this.colors.setColorFromCMYK({ [CMYK.c]: q * c, [CMYK.m]: q * m, [CMYK.y]: q * y, [CMYK.k]: q * k });
  }

}