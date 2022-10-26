import { loadFonts } from './base';

export const meta = {
  family: "'Gayathri'",
  version: 'v15',
  url: 'https://fonts.googleapis.com/css2?family=Gayathri:ital,wght@0,100;0,400;0,700',
  unicodeRanges: {
    malayalam: 'U+0307, U+0323, U+0964-0965, U+0D02-0D7F, U+200C-200D, U+20B9, U+25CC',
    latin: 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  },
  fonts: {
    normal: {
      '100': {
        malayalam: 'https://fonts.gstatic.com/s/gayathri/v15/MCoWzAb429DbBilWLLhcyoTYAsgA.woff2',
        latin: 'https://fonts.gstatic.com/s/gayathri/v15/MCoWzAb429DbBilWLLhcypzYAg.woff2',
      },
      '400': {
        malayalam: 'https://fonts.gstatic.com/s/gayathri/v15/MCoQzAb429DbBilWLLAn-p7ABg.woff2',
        latin: 'https://fonts.gstatic.com/s/gayathri/v15/MCoQzAb429DbBilWLLA_-p4.woff2',
      },
      '700': {
        malayalam: 'https://fonts.gstatic.com/s/gayathri/v15/MCoXzAb429DbBilWLLiE34vnJ_U5wA.woff2',
        latin: 'https://fonts.gstatic.com/s/gayathri/v15/MCoXzAb429DbBilWLLiE34v_J_U.woff2',
      },
    },
  },
};

export const family = meta.family;

type Variants = {
  normal: {
    weights: '100' | '400' | '700';
    subsets: 'latin' | 'malayalam';
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
