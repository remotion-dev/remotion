import { loadFonts } from './base';

export const meta = {
  family: "'Nuosu SIL'",
  version: 'v2',
  url: 'https://fonts.googleapis.com/css2?family=Nuosu+SIL:ital,wght@0,400',
  unicodeRanges: {
    'yi': 'U+3001-3002, U+3008-3011, U+3014-301B, U+30FB, U+A000-A48C, U+A490-A4C6, U+FF01, U+FF0C, U+FF1A-FF1B, U+FF1F, U+FF61-FF65',
    'latin-ext': 'U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF',
    'latin': 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  },
  fonts: {
    normal: {
      '400': {
        'yi': 'https://fonts.gstatic.com/s/nuosusil/v2/8vIK7wM3wmRn_kc4uAjuMmZaC_w.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/nuosusil/v2/8vIK7wM3wmRn_kc4uAjuHWZaC_w.woff2',
        'latin': 'https://fonts.gstatic.com/s/nuosusil/v2/8vIK7wM3wmRn_kc4uAjuE2Za.woff2',
      },
    },
  },
};

export const family = meta.family;

type Variants = {
  normal: {
    weights: '400';
    subsets: 'latin' | 'latin-ext' | 'yi';
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
