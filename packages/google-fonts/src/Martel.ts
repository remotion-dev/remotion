import { loadFonts } from './base';

export const meta = {
  family: "'Martel'",
  version: 'v10',
  url: 'https://fonts.googleapis.com/css2?family=Martel:ital,wght@0,200;0,300;0,400;0,600;0,700;0,800;0,900',
  unicodeRanges: {
    'devanagari': 'U+0900-097F, U+1CD0-1CF6, U+1CF8-1CF9, U+200C-200D, U+20A8, U+20B9, U+25CC, U+A830-A839, U+A8E0-A8FB',
    'latin-ext': 'U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF',
    'latin': 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  },
  fonts: {
    normal: {
      '200': {
        'devanagari': 'https://fonts.gstatic.com/s/martel/v10/PN_yRfK9oXHga0XVqekqgxzWxvk.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/martel/v10/PN_yRfK9oXHga0XVqekqjBzWxvk.woff2',
        'latin': 'https://fonts.gstatic.com/s/martel/v10/PN_yRfK9oXHga0XVqekqghzW.woff2',
      },
      '300': {
        'devanagari': 'https://fonts.gstatic.com/s/martel/v10/PN_yRfK9oXHga0XVzeoqgxzWxvk.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/martel/v10/PN_yRfK9oXHga0XVzeoqjBzWxvk.woff2',
        'latin': 'https://fonts.gstatic.com/s/martel/v10/PN_yRfK9oXHga0XVzeoqghzW.woff2',
      },
      '400': {
        'devanagari': 'https://fonts.gstatic.com/s/martel/v10/PN_xRfK9oXHga0XdZ8g_vT0.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/martel/v10/PN_xRfK9oXHga0XdaMg_vT0.woff2',
        'latin': 'https://fonts.gstatic.com/s/martel/v10/PN_xRfK9oXHga0XdZsg_.woff2',
      },
      '600': {
        'devanagari': 'https://fonts.gstatic.com/s/martel/v10/PN_yRfK9oXHga0XVuewqgxzWxvk.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/martel/v10/PN_yRfK9oXHga0XVuewqjBzWxvk.woff2',
        'latin': 'https://fonts.gstatic.com/s/martel/v10/PN_yRfK9oXHga0XVuewqghzW.woff2',
      },
      '700': {
        'devanagari': 'https://fonts.gstatic.com/s/martel/v10/PN_yRfK9oXHga0XV3e0qgxzWxvk.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/martel/v10/PN_yRfK9oXHga0XV3e0qjBzWxvk.woff2',
        'latin': 'https://fonts.gstatic.com/s/martel/v10/PN_yRfK9oXHga0XV3e0qghzW.woff2',
      },
      '800': {
        'devanagari': 'https://fonts.gstatic.com/s/martel/v10/PN_yRfK9oXHga0XVwe4qgxzWxvk.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/martel/v10/PN_yRfK9oXHga0XVwe4qjBzWxvk.woff2',
        'latin': 'https://fonts.gstatic.com/s/martel/v10/PN_yRfK9oXHga0XVwe4qghzW.woff2',
      },
      '900': {
        'devanagari': 'https://fonts.gstatic.com/s/martel/v10/PN_yRfK9oXHga0XV5e8qgxzWxvk.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/martel/v10/PN_yRfK9oXHga0XV5e8qjBzWxvk.woff2',
        'latin': 'https://fonts.gstatic.com/s/martel/v10/PN_yRfK9oXHga0XV5e8qghzW.woff2',
      },
    },
  },
};

export const family = meta.family;

type Variants = {
  normal: {
    weights: '200' | '300' | '400' | '600' | '700' | '800' | '900';
    subsets: 'devanagari' | 'latin' | 'latin-ext';
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
