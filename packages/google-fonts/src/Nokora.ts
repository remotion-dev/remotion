import { loadFonts } from './base';

export const meta = {
  family: "'Nokora'",
  version: 'v30',
  url: 'https://fonts.googleapis.com/css2?family=Nokora:ital,wght@0,100;0,300;0,400;0,700;0,900',
  unicodeRanges: {
    khmer: 'U+1780-17FF, U+200C, U+25CC',
    latin: 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  },
  fonts: {
    normal: {
      '100': {
        khmer: 'https://fonts.gstatic.com/s/nokora/v30/~CgoKBk5va29yYRhkEAwgBTgB.woff2',
        latin: 'https://fonts.gstatic.com/s/nokora/v30/~CgoKBk5va29yYRhkEAcgBQ==.woff2',
      },
      '300': {
        khmer: 'https://fonts.gstatic.com/s/nokora/v30/~CgsKBk5va29yYRisAhAMIAU4AQ==.woff2',
        latin: 'https://fonts.gstatic.com/s/nokora/v30/~CgsKBk5va29yYRisAhAHIAU=.woff2',
      },
      '400': {
        khmer: 'https://fonts.gstatic.com/s/nokora/v30/~CggKBk5va29yYRAMIAU4AQ==.woff2',
        latin: 'https://fonts.gstatic.com/s/nokora/v30/~CggKBk5va29yYRAHIAU=.woff2',
      },
      '700': {
        khmer: 'https://fonts.gstatic.com/s/nokora/v30/~CgsKBk5va29yYRi8BRAMIAU4AQ==.woff2',
        latin: 'https://fonts.gstatic.com/s/nokora/v30/~CgsKBk5va29yYRi8BRAHIAU=.woff2',
      },
      '900': {
        khmer: 'https://fonts.gstatic.com/s/nokora/v30/~CgsKBk5va29yYRiEBxAMIAU4AQ==.woff2',
        latin: 'https://fonts.gstatic.com/s/nokora/v30/~CgsKBk5va29yYRiEBxAHIAU=.woff2',
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
