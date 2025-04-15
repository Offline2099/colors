import { Notation } from '../constants/color-spaces/base/notation.enum';
import { ColorSpaceName } from '../constants/color-spaces/base/color-space-name.enum';
import { Color } from './color';
import { ColorSpaceNotation } from './color-space';

export type ConverterName = ColorSpaceName | Notation.hexadecimal;

export interface Converter {
  name: ConverterName;
  inputNotations: {
    name: ColorSpaceNotation;
    example: string;
  }[];
  selectedNotationIndex: number;
  userInput: string;
  result: ColorParseResult;
}

export interface ColorParseResult {
  errors: InputIssue[];
  warnings: InputIssue[];
  color: Color | null;
}

export interface InputIssue {
  text: string;
  details?: {
    text: string;
    isValid: boolean;
  }[];
}
