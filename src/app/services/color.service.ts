import { Injectable } from '@angular/core';
import { ColorSpaceName } from '../constants/color-spaces/base/color-space-name.enum';
import { RGB, NotationRGB } from '../constants/color-spaces/space-rgb';
import { HSL, NotationHSL } from '../constants/color-spaces/space-hsl';
import { CMYK, NotationCMYK } from '../constants/color-spaces/space-cmyk';
import { Color, ColorRGB, ColorHSL, ColorCMYK } from '../types/color';
import { Space, ColorSpaceRange, ColorSpaceNotation } from '../types/color-space';

@Injectable({
  providedIn: 'root'
})
export class ColorService {

  private convertRGBtoHSL(input: ColorRGB): ColorHSL {

    const r: number = input[RGB.r] / 255;
    const g: number = input[RGB.g] / 255;
    const b: number = input[RGB.b] / 255;

    const hsl: ColorHSL = { [HSL.h]: 0, [HSL.s]: 0, [HSL.l]: 0 }

    const cmax: number = Math.max(r, g, b);
    const cmin: number = Math.min(r, g, b);

    hsl[HSL.l] = (cmax + cmin) / 2; 
    if (cmax === cmin) return hsl;

    hsl[HSL.s] = (cmax - cmin) / (1 - Math.abs(2 * hsl[HSL.l] - 1));

    switch (cmax) {
      case r:
        hsl[HSL.h] = 60 * (((g - b) / (cmax - cmin)) % 6);
        hsl[HSL.h] = hsl[HSL.h] >= 0 ? hsl[HSL.h] : 360 + hsl[HSL.h];
        break;
      case g:
        hsl[HSL.h] = 60 * ((b - r) / (cmax - cmin) + 2);
        break;
      case b:
        hsl[HSL.h] = 60 * ((r - g) / (cmax - cmin) + 4);
        break;
    }

    return hsl;
  }

  private convertHSLtoRGB(input: ColorHSL): ColorRGB {

    const h: number = input[HSL.h];
    const s: number = input[HSL.s];
    const l: number = input[HSL.l];

    const c: number = (1 - Math.abs(2 * l - 1)) * s;
    const x: number = c * (1 - Math.abs(((h / 60) % 2) - 1));
    const m: number = l - c / 2;

    let r: number = 0, g: number = 0, b: number = 0;

    if (0 <= h && h < 60) {
      r = c; g = x; b = 0;
    }
    else if (60 <= h && h < 120) {
      r = x; g = c; b = 0;
    }
    else if (120 <= h && h < 180) {
      r = 0; g = c; b = x;
    }
    else if (180 <= h && h < 240) {
      r = 0; g = x; b = c;
    }
    else if (240 <= h && h < 300) {
      r = x; g = 0; b = c;
    }
    else if (300 <= h && h <= 360) {
      r = c; g = 0; b = x;
    }

    return {
      [RGB.r]: 255 * (r + m),
      [RGB.g]: 255 * (g + m),
      [RGB.b]: 255 * (b + m)
    }
  }

  private convertRGBtoCMYK(input: ColorRGB): ColorCMYK {

    const r: number = input[RGB.r] / 255;
    const g: number = input[RGB.g] / 255;
    const b: number = input[RGB.b] / 255;

    let cmyk: ColorCMYK = { [CMYK.c]: 0, [CMYK.m]: 0, [CMYK.y]: 0, [CMYK.k]: 1 }

    if (r === 0 && g === 0 && b === 0) return cmyk;

    const k: number = (1 - Math.max(r, g, b));
    
    cmyk[CMYK.c] = (1 - r - k) / (1 - k);
    cmyk[CMYK.m] = (1 - g - k) / (1 - k);
    cmyk[CMYK.y] = (1 - b - k) / (1 - k);
    cmyk[CMYK.k] = k;

    return cmyk;
  }

  private convertCMYKtoRGB(input: ColorCMYK): ColorRGB {

    const c: number = input[CMYK.c];
    const m: number = input[CMYK.m];
    const y: number = input[CMYK.y];
    const k: number = input[CMYK.k];

    return {
      [RGB.r]: 255 * (1 - c) * (1 - k),
      [RGB.g]: 255 * (1 - m) * (1 - k),
      [RGB.b]: 255 * (1 - y) * (1 - k)
    }
  }

  private convertRGBtoHex(input: ColorRGB): string {

    const toHexadecimal = (n: number): string => {
      const hex: string = Math.round(n).toString(16).toUpperCase();
      return (hex.length === 1 ? '0' : '') + hex;
    }

    const r: string = toHexadecimal(input[RGB.r]);
    const g: string = toHexadecimal(input[RGB.g]);
    const b: string = toHexadecimal(input[RGB.b]);

    return '#' + r + g + b;
  }

  private formatDecimal(n: number): string {
    return Math.abs(n).toFixed(0);
  }

  private formatArithmetic(n: number): string {
    return Math.abs(n).toFixed(3);
  }

  private formatPercentage(n: number): string {
    return Math.abs(100 * n).toFixed(0);
  }

  private formatValuesRGB(color: ColorRGB, notation: NotationRGB): string[] {
    switch (notation) {
      case NotationRGB.decimal:
        return Object.values(color).map(value => this.formatDecimal(value));
      case NotationRGB.arithmetic:
        return Object.values(color).map(value => this.formatArithmetic(value / 255));
      case NotationRGB.percentages:
        return Object.values(color).map(value => this.formatPercentage(value / 255));
      case NotationRGB.hexadecimal:
        const hex: string = this.convertRGBtoHex(color);
        return [hex[0], hex.slice(1, 3), hex.slice(3, 5), hex.slice(5, 7)];
    }
  }

  private formatValuesHSL(color: ColorHSL, notation: NotationHSL): string[] {
    switch (notation) {
      case NotationHSL.arithmetic:
        return [
          this.formatDecimal(color[HSL.h]),
          this.formatArithmetic(color[HSL.s]),
          this.formatArithmetic(color[HSL.l])
        ];
      case NotationHSL.percentages:
        return [
          this.formatDecimal(color[HSL.h]),
          this.formatPercentage(color[HSL.s]),
          this.formatPercentage(color[HSL.l])
        ];
    }
  }

  private formatValuesCMYK(color: ColorCMYK, notation: NotationCMYK): string[] {
    switch (notation) {
      case NotationCMYK.arithmetic:
        return Object.values(color).map(value => this.formatArithmetic(value));
      case NotationCMYK.percentages:
        return Object.values(color).map(value => this.formatPercentage(value));
    }
  }

  setColorFromRGB(input: ColorRGB): Color {
    return {
      rgb: input,
      hsl: this.convertRGBtoHSL(input),
      cmyk: this.convertRGBtoCMYK(input),
      hex: this.convertRGBtoHex(input)
    }
  }

  setColorFromHSL(input: ColorHSL): Color {
    const rgb: ColorRGB = this.convertHSLtoRGB(input);
    return {
      rgb: rgb,
      hsl: input,
      cmyk: this.convertRGBtoCMYK(rgb),
      hex: this.convertRGBtoHex(rgb)
    }
  }

  setColorFromCMYK(input: ColorCMYK): Color {
    const rgb: ColorRGB = this.convertCMYKtoRGB(input);
    return {
      rgb: rgb,
      hsl: this.convertRGBtoHSL(rgb),
      cmyk: input,
      hex: this.convertRGBtoHex(rgb)
    }
  }

  changeColorByRangeValue(color: Color, space: Space, range: ColorSpaceRange, value: number): Color {
    switch (space.name) {
      case ColorSpaceName.rgb:
        return this.setColorFromRGB({ ...color.rgb, [range]: value });
      case ColorSpaceName.hsl:
        return this.setColorFromHSL({ ...color.hsl, [range]: value });
      case ColorSpaceName.cmyk:
        return this.setColorFromCMYK({ ...color.cmyk, [range]: value });
    }
  }

  getColorComponent(color: Color, range: ColorSpaceRange): number {
    switch (range) {
      case RGB.r:
      case RGB.g:
      case RGB.b:
        return color.rgb[range];
      case HSL.h:
      case HSL.s:
      case HSL.l:
        return color.hsl[range];
      case CMYK.c:
      case CMYK.m:
      case CMYK.y:
      case CMYK.k:
        return color.cmyk[range];
    }
  }

  formatColorValues(color: Color, space: Space, notation: ColorSpaceNotation): string[] {
    switch (space.name) {
      case ColorSpaceName.rgb:
        return this.formatValuesRGB(color.rgb, notation as NotationRGB);
      case ColorSpaceName.hsl:
        return this.formatValuesHSL(color.hsl, notation as NotationHSL);
      case ColorSpaceName.cmyk:
        return this.formatValuesCMYK(color.cmyk, notation as NotationCMYK);
    }
  }

}