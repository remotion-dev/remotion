import { loadFonts } from './base';

export const meta = {
  family: "'Alef'",
  version: 'v21',
  url: 'https://fonts.googleapis.com/css2?family=Alef:ital,wght@0,400;0,700',
  unicodeRanges: {
    hebrew: 'U+0590-05FF, U+200C-2010, U+20AA, U+25CC, U+FB1D-FB4F',
    latin: 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  },
  fonts: {
    normal: {
      '400': {
        hebrew: 'https://fonts.gstatic.com/s/alef/v21/FeVfS0NQpLYgnjdRCqFx.woff2',
        latin: 'https://fonts.gstatic.com/s/alef/v21/FeVfS0NQpLYgnjVRCg.woff2',
      },
      '700': {
        hebrew: 'https://fonts.gstatic.com/s/alef/v21/FeVQS0NQpLYglo50H5xQ2Ixi.woff2',
        latin: 'https://fonts.gstatic.com/s/alef/v21/FeVQS0NQpLYglo50H55Q2A.woff2',
      },
    },
  },
};

export const family = meta.family;

type Variants = {
  normal: {
    weights: '400' | '700';
    subsets: 'hebrew' | 'latin';
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
