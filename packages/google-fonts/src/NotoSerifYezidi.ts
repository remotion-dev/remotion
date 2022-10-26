import { loadFonts } from './base';

export const meta = {
  family: "'Noto Serif Yezidi'",
  version: 'v16',
  url: 'https://fonts.googleapis.com/css2?family=Noto+Serif+Yezidi:ital,wght@0,400;0,500;0,600;0,700',
  unicodeRanges: {
    yezidi:
      'U+060C, U+061B, U+061F, U+06D4, U+10E80-10EBF, U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  },
  fonts: {
    normal: {
      '400': {
        yezidi: 'https://fonts.gstatic.com/s/notoserifyezidi/v16/XLY8IYr5bJNDGYxLBibeHZAn3B5KJGkKasc.woff2',
      },
      '500': {
        yezidi: 'https://fonts.gstatic.com/s/notoserifyezidi/v16/XLY8IYr5bJNDGYxLBibeHZAn3B5KJGkKasc.woff2',
      },
      '600': {
        yezidi: 'https://fonts.gstatic.com/s/notoserifyezidi/v16/XLY8IYr5bJNDGYxLBibeHZAn3B5KJGkKasc.woff2',
      },
      '700': {
        yezidi: 'https://fonts.gstatic.com/s/notoserifyezidi/v16/XLY8IYr5bJNDGYxLBibeHZAn3B5KJGkKasc.woff2',
      },
    },
  },
};

export const family = meta.family;

type Variants = {
  normal: {
    weights: '400' | '500' | '600' | '700';
    subsets: 'yezidi';
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
