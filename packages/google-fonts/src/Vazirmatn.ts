import { loadFonts } from './base';

export const meta = {
  family: "'Vazirmatn'",
  version: 'v6',
  url: 'https://fonts.googleapis.com/css2?family=Vazirmatn:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900',
  unicodeRanges: {
    'arabic': 'U+0600-06FF, U+200C-200E, U+2010-2011, U+204F, U+2E41, U+FB50-FDFF, U+FE80-FEFC',
    'latin-ext': 'U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF',
    'latin': 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  },
  fonts: {
    normal: {
      '100': {
        'arabic': 'https://fonts.gstatic.com/s/vazirmatn/v6/Dxxo8j6PP2D_kU2muijlGMWWMmk.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/vazirmatn/v6/Dxxo8j6PP2D_kU2muijlE8WWMmk.woff2',
        'latin': 'https://fonts.gstatic.com/s/vazirmatn/v6/Dxxo8j6PP2D_kU2muijlHcWW.woff2',
      },
      '200': {
        'arabic': 'https://fonts.gstatic.com/s/vazirmatn/v6/Dxxo8j6PP2D_kU2muijlGMWWMmk.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/vazirmatn/v6/Dxxo8j6PP2D_kU2muijlE8WWMmk.woff2',
        'latin': 'https://fonts.gstatic.com/s/vazirmatn/v6/Dxxo8j6PP2D_kU2muijlHcWW.woff2',
      },
      '300': {
        'arabic': 'https://fonts.gstatic.com/s/vazirmatn/v6/Dxxo8j6PP2D_kU2muijlGMWWMmk.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/vazirmatn/v6/Dxxo8j6PP2D_kU2muijlE8WWMmk.woff2',
        'latin': 'https://fonts.gstatic.com/s/vazirmatn/v6/Dxxo8j6PP2D_kU2muijlHcWW.woff2',
      },
      '400': {
        'arabic': 'https://fonts.gstatic.com/s/vazirmatn/v6/Dxxo8j6PP2D_kU2muijlGMWWMmk.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/vazirmatn/v6/Dxxo8j6PP2D_kU2muijlE8WWMmk.woff2',
        'latin': 'https://fonts.gstatic.com/s/vazirmatn/v6/Dxxo8j6PP2D_kU2muijlHcWW.woff2',
      },
      '500': {
        'arabic': 'https://fonts.gstatic.com/s/vazirmatn/v6/Dxxo8j6PP2D_kU2muijlGMWWMmk.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/vazirmatn/v6/Dxxo8j6PP2D_kU2muijlE8WWMmk.woff2',
        'latin': 'https://fonts.gstatic.com/s/vazirmatn/v6/Dxxo8j6PP2D_kU2muijlHcWW.woff2',
      },
      '600': {
        'arabic': 'https://fonts.gstatic.com/s/vazirmatn/v6/Dxxo8j6PP2D_kU2muijlGMWWMmk.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/vazirmatn/v6/Dxxo8j6PP2D_kU2muijlE8WWMmk.woff2',
        'latin': 'https://fonts.gstatic.com/s/vazirmatn/v6/Dxxo8j6PP2D_kU2muijlHcWW.woff2',
      },
      '700': {
        'arabic': 'https://fonts.gstatic.com/s/vazirmatn/v6/Dxxo8j6PP2D_kU2muijlGMWWMmk.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/vazirmatn/v6/Dxxo8j6PP2D_kU2muijlE8WWMmk.woff2',
        'latin': 'https://fonts.gstatic.com/s/vazirmatn/v6/Dxxo8j6PP2D_kU2muijlHcWW.woff2',
      },
      '800': {
        'arabic': 'https://fonts.gstatic.com/s/vazirmatn/v6/Dxxo8j6PP2D_kU2muijlGMWWMmk.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/vazirmatn/v6/Dxxo8j6PP2D_kU2muijlE8WWMmk.woff2',
        'latin': 'https://fonts.gstatic.com/s/vazirmatn/v6/Dxxo8j6PP2D_kU2muijlHcWW.woff2',
      },
      '900': {
        'arabic': 'https://fonts.gstatic.com/s/vazirmatn/v6/Dxxo8j6PP2D_kU2muijlGMWWMmk.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/vazirmatn/v6/Dxxo8j6PP2D_kU2muijlE8WWMmk.woff2',
        'latin': 'https://fonts.gstatic.com/s/vazirmatn/v6/Dxxo8j6PP2D_kU2muijlHcWW.woff2',
      },
    },
  },
};

export const family = meta.family;

type Variants = {
  normal: {
    weights: '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
    subsets: 'arabic' | 'latin' | 'latin-ext';
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
