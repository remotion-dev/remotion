import { loadFonts } from './base';

export const meta = {
  family: "'Solway'",
  version: 'v15',
  url: 'https://fonts.googleapis.com/css2?family=Solway:ital,wght@0,300;0,400;0,500;0,700;0,800',
  unicodeRanges: {
    latin: 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  },
  fonts: {
    normal: {
      '300': {
        latin: 'https://fonts.gstatic.com/s/solway/v15/AMOTz46Cs2uTAOCuLlgpnccR.woff2',
      },
      '400': {
        latin: 'https://fonts.gstatic.com/s/solway/v15/AMOQz46Cs2uTAOCmhXo8.woff2',
      },
      '500': {
        latin: 'https://fonts.gstatic.com/s/solway/v15/AMOTz46Cs2uTAOCudlkpnccR.woff2',
      },
      '700': {
        latin: 'https://fonts.gstatic.com/s/solway/v15/AMOTz46Cs2uTAOCuPl8pnccR.woff2',
      },
      '800': {
        latin: 'https://fonts.gstatic.com/s/solway/v15/AMOTz46Cs2uTAOCuIlwpnccR.woff2',
      },
    },
  },
};

export const family = meta.family;

type Variants = {
  normal: {
    weights: '300' | '400' | '500' | '700' | '800';
    subsets: 'latin';
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
