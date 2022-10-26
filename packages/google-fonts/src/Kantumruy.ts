import { loadFonts } from './base';

export const meta = {
  family: "'Kantumruy'",
  version: 'v21',
  url: 'https://fonts.googleapis.com/css2?family=Kantumruy:ital,wght@0,300;0,400;0,700',
  unicodeRanges: {
    khmer:
      'U+1780-17FF, U+200C, U+25CC, U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  },
  fonts: {
    normal: {
      '300': {
        khmer: 'https://fonts.gstatic.com/s/kantumruy/v21/syk0-yJ0m7wyVb-f4FOPUtDVqnWV.woff2',
      },
      '400': {
        khmer: 'https://fonts.gstatic.com/s/kantumruy/v21/sykx-yJ0m7wyVb-f4FOH8vLA.woff2',
      },
      '700': {
        khmer: 'https://fonts.gstatic.com/s/kantumruy/v21/syk0-yJ0m7wyVb-f4FOPQtfVqnWV.woff2',
      },
    },
  },
};

export const family = meta.family;

type Variants = {
  normal: {
    weights: '300' | '400' | '700';
    subsets: 'khmer';
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
