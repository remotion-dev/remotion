import { loadFonts } from './base';

export const meta = {
  family: "'Noto Sans Syloti Nagri'",
  version: 'v15',
  url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Syloti+Nagri:ital,wght@0,400',
  unicodeRanges: {
    'syloti-nagri':
      'U+0964-0965, U+09BD, U+09E6-09EF, U+200C-200D, U+2010-2011, U+2055, U+25CC, U+A800-A82C, U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  },
  fonts: {
    normal: {
      '400': {
        'syloti-nagri': 'https://fonts.gstatic.com/s/notosanssylotinagri/v15/uU9eCAQZ75uhfF9UoWDRiY3q7Sf_VFV3m4dGJW_7Ng.woff2',
      },
    },
  },
};

export const family = meta.family;

type Variants = {
  normal: {
    weights: '400';
    subsets: 'syloti-nagri';
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
