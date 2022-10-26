import { loadFonts } from './base';

export const meta = {
  family: "'Mukta Mahee'",
  version: 'v15',
  url: 'https://fonts.googleapis.com/css2?family=Mukta+Mahee:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;0,800',
  unicodeRanges: {
    'gurmukhi': 'U+0964-0965, U+0A01-0A75, U+200C-200D, U+20B9, U+25CC, U+262C, U+A830-A839',
    'latin-ext': 'U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF',
    'latin': 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  },
  fonts: {
    normal: {
      '200': {
        'gurmukhi': 'https://fonts.gstatic.com/s/muktamahee/v15/XRXN3IOIi0hcP8iVU67hA9MFcCojLHZaZA.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/muktamahee/v15/XRXN3IOIi0hcP8iVU67hA9MFcCoOLHZaZA.woff2',
        'latin': 'https://fonts.gstatic.com/s/muktamahee/v15/XRXN3IOIi0hcP8iVU67hA9MFcCoALHY.woff2',
      },
      '300': {
        'gurmukhi': 'https://fonts.gstatic.com/s/muktamahee/v15/XRXN3IOIi0hcP8iVU67hA9NhcyojLHZaZA.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/muktamahee/v15/XRXN3IOIi0hcP8iVU67hA9NhcyoOLHZaZA.woff2',
        'latin': 'https://fonts.gstatic.com/s/muktamahee/v15/XRXN3IOIi0hcP8iVU67hA9NhcyoALHY.woff2',
      },
      '400': {
        'gurmukhi': 'https://fonts.gstatic.com/s/muktamahee/v15/XRXQ3IOIi0hcP8iVU67hA9vpUT8_DQ.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/muktamahee/v15/XRXQ3IOIi0hcP8iVU67hA9vEUT8_DQ.woff2',
        'latin': 'https://fonts.gstatic.com/s/muktamahee/v15/XRXQ3IOIi0hcP8iVU67hA9vKUT8.woff2',
      },
      '500': {
        'gurmukhi': 'https://fonts.gstatic.com/s/muktamahee/v15/XRXN3IOIi0hcP8iVU67hA9M5ciojLHZaZA.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/muktamahee/v15/XRXN3IOIi0hcP8iVU67hA9M5cioOLHZaZA.woff2',
        'latin': 'https://fonts.gstatic.com/s/muktamahee/v15/XRXN3IOIi0hcP8iVU67hA9M5cioALHY.woff2',
      },
      '600': {
        'gurmukhi': 'https://fonts.gstatic.com/s/muktamahee/v15/XRXN3IOIi0hcP8iVU67hA9MVdSojLHZaZA.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/muktamahee/v15/XRXN3IOIi0hcP8iVU67hA9MVdSoOLHZaZA.woff2',
        'latin': 'https://fonts.gstatic.com/s/muktamahee/v15/XRXN3IOIi0hcP8iVU67hA9MVdSoALHY.woff2',
      },
      '700': {
        'gurmukhi': 'https://fonts.gstatic.com/s/muktamahee/v15/XRXN3IOIi0hcP8iVU67hA9NxdCojLHZaZA.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/muktamahee/v15/XRXN3IOIi0hcP8iVU67hA9NxdCoOLHZaZA.woff2',
        'latin': 'https://fonts.gstatic.com/s/muktamahee/v15/XRXN3IOIi0hcP8iVU67hA9NxdCoALHY.woff2',
      },
      '800': {
        'gurmukhi': 'https://fonts.gstatic.com/s/muktamahee/v15/XRXN3IOIi0hcP8iVU67hA9NtdyojLHZaZA.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/muktamahee/v15/XRXN3IOIi0hcP8iVU67hA9NtdyoOLHZaZA.woff2',
        'latin': 'https://fonts.gstatic.com/s/muktamahee/v15/XRXN3IOIi0hcP8iVU67hA9NtdyoALHY.woff2',
      },
    },
  },
};

export const family = meta.family;

type Variants = {
  normal: {
    weights: '200' | '300' | '400' | '500' | '600' | '700' | '800';
    subsets: 'gurmukhi' | 'latin' | 'latin-ext';
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
