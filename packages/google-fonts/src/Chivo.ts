import { loadFonts } from './base';

export const meta = {
  family: "'Chivo'",
  version: 'v17',
  url: 'https://fonts.googleapis.com/css2?family=Chivo:ital,wght@0,300;0,400;0,700;0,900;1,300;1,400;1,700;1,900',
  unicodeRanges: {
    'latin-ext': 'U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF',
    'latin': 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  },
  fonts: {
    italic: {
      '300': {
        'latin-ext': 'https://fonts.gstatic.com/s/chivo/v17/va9D4kzIxd1KFrBteUp9gKHuRA_-.woff2',
        'latin': 'https://fonts.gstatic.com/s/chivo/v17/va9D4kzIxd1KFrBteUp9gK_uRA.woff2',
      },
      '400': {
        'latin-ext': 'https://fonts.gstatic.com/s/chivo/v17/va9G4kzIxd1KFrBtce9flZDP.woff2',
        'latin': 'https://fonts.gstatic.com/s/chivo/v17/va9G4kzIxd1KFrBtceFflQ.woff2',
      },
      '700': {
        'latin-ext': 'https://fonts.gstatic.com/s/chivo/v17/va9D4kzIxd1KFrBteVp6gKHuRA_-.woff2',
        'latin': 'https://fonts.gstatic.com/s/chivo/v17/va9D4kzIxd1KFrBteVp6gK_uRA.woff2',
      },
      '900': {
        'latin-ext': 'https://fonts.gstatic.com/s/chivo/v17/va9D4kzIxd1KFrBteWJ4gKHuRA_-.woff2',
        'latin': 'https://fonts.gstatic.com/s/chivo/v17/va9D4kzIxd1KFrBteWJ4gK_uRA.woff2',
      },
    },
    normal: {
      '300': {
        'latin-ext': 'https://fonts.gstatic.com/s/chivo/v17/va9F4kzIxd1KFrjDY_Z2sK32QA.woff2',
        'latin': 'https://fonts.gstatic.com/s/chivo/v17/va9F4kzIxd1KFrjDY_Z4sK0.woff2',
      },
      '400': {
        'latin-ext': 'https://fonts.gstatic.com/s/chivo/v17/va9I4kzIxd1KFrBmQeNHkQ.woff2',
        'latin': 'https://fonts.gstatic.com/s/chivo/v17/va9I4kzIxd1KFrBoQeM.woff2',
      },
      '700': {
        'latin-ext': 'https://fonts.gstatic.com/s/chivo/v17/va9F4kzIxd1KFrjTZPZ2sK32QA.woff2',
        'latin': 'https://fonts.gstatic.com/s/chivo/v17/va9F4kzIxd1KFrjTZPZ4sK0.woff2',
      },
      '900': {
        'latin-ext': 'https://fonts.gstatic.com/s/chivo/v17/va9F4kzIxd1KFrjrZvZ2sK32QA.woff2',
        'latin': 'https://fonts.gstatic.com/s/chivo/v17/va9F4kzIxd1KFrjrZvZ4sK0.woff2',
      },
    },
  },
};

export const family = meta.family;

type Variants = {
  italic: {
    weights: '300' | '400' | '700' | '900';
    subsets: 'latin' | 'latin-ext';
  };
  normal: {
    weights: '300' | '400' | '700' | '900';
    subsets: 'latin' | 'latin-ext';
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
