import { loadFonts } from './base';

export const meta = {
  family: "'Suwannaphum'",
  version: 'v29',
  url: 'https://fonts.googleapis.com/css2?family=Suwannaphum:ital,wght@0,100;0,300;0,400;0,700;0,900',
  unicodeRanges: {
    khmer: 'U+1780-17FF, U+200C, U+25CC',
    latin: 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  },
  fonts: {
    normal: {
      '100': {
        khmer: 'https://fonts.gstatic.com/s/suwannaphum/v29/jAnAgHV7GtDvc8jbe8hXXL3BxcicXi2V.woff2',
        latin: 'https://fonts.gstatic.com/s/suwannaphum/v29/jAnAgHV7GtDvc8jbe8hXXL3BxcOcXg.woff2',
      },
      '300': {
        khmer: 'https://fonts.gstatic.com/s/suwannaphum/v29/jAnfgHV7GtDvc8jbe8hXXL0J19SwexCsfw.woff2',
        latin: 'https://fonts.gstatic.com/s/suwannaphum/v29/jAnfgHV7GtDvc8jbe8hXXL0J19S7exA.woff2',
      },
      '400': {
        khmer: 'https://fonts.gstatic.com/s/suwannaphum/v29/jAnCgHV7GtDvc8jbe8hXXLWp9cGEWg.woff2',
        latin: 'https://fonts.gstatic.com/s/suwannaphum/v29/jAnCgHV7GtDvc8jbe8hXXLWi9cE.woff2',
      },
      '700': {
        khmer: 'https://fonts.gstatic.com/s/suwannaphum/v29/jAnfgHV7GtDvc8jbe8hXXL0Z0NSwexCsfw.woff2',
        latin: 'https://fonts.gstatic.com/s/suwannaphum/v29/jAnfgHV7GtDvc8jbe8hXXL0Z0NS7exA.woff2',
      },
      '900': {
        khmer: 'https://fonts.gstatic.com/s/suwannaphum/v29/jAnfgHV7GtDvc8jbe8hXXL0h0tSwexCsfw.woff2',
        latin: 'https://fonts.gstatic.com/s/suwannaphum/v29/jAnfgHV7GtDvc8jbe8hXXL0h0tS7exA.woff2',
      },
    },
  },
};

export const family = meta.family;

type Variants = {
  normal: {
    weights: '100' | '300' | '400' | '700' | '900';
    subsets: 'khmer' | 'latin';
  };
};

export const loadFont = <T extends keyof Variants>(
  style: T,
  options: {
    weights: Variants[T]['weights'][];
    subsets: Variants[T]['subsets'][];
  }
) => {
  loadFonts(meta, style, options);
};
