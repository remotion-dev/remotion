import { loadFonts } from './base';

export const meta = {
  family: "'Tajawal'",
  version: 'v9',
  url: 'https://fonts.googleapis.com/css2?family=Tajawal:ital,wght@0,200;0,300;0,400;0,500;0,700;0,800;0,900',
  unicodeRanges: {
    arabic: 'U+0600-06FF, U+200C-200E, U+2010-2011, U+204F, U+2E41, U+FB50-FDFF, U+FE80-FEFC',
    latin: 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  },
  fonts: {
    normal: {
      '200': {
        arabic: 'https://fonts.gstatic.com/s/tajawal/v9/Iurf6YBj_oCad4k1l_6gHrRpiYlJ.woff2',
        latin: 'https://fonts.gstatic.com/s/tajawal/v9/Iurf6YBj_oCad4k1l_6gHrFpiQ.woff2',
      },
      '300': {
        arabic: 'https://fonts.gstatic.com/s/tajawal/v9/Iurf6YBj_oCad4k1l5qjHrRpiYlJ.woff2',
        latin: 'https://fonts.gstatic.com/s/tajawal/v9/Iurf6YBj_oCad4k1l5qjHrFpiQ.woff2',
      },
      '400': {
        arabic: 'https://fonts.gstatic.com/s/tajawal/v9/Iura6YBj_oCad4k1nzSBC45I.woff2',
        latin: 'https://fonts.gstatic.com/s/tajawal/v9/Iura6YBj_oCad4k1nzGBCw.woff2',
      },
      '500': {
        arabic: 'https://fonts.gstatic.com/s/tajawal/v9/Iurf6YBj_oCad4k1l8KiHrRpiYlJ.woff2',
        latin: 'https://fonts.gstatic.com/s/tajawal/v9/Iurf6YBj_oCad4k1l8KiHrFpiQ.woff2',
      },
      '700': {
        arabic: 'https://fonts.gstatic.com/s/tajawal/v9/Iurf6YBj_oCad4k1l4qkHrRpiYlJ.woff2',
        latin: 'https://fonts.gstatic.com/s/tajawal/v9/Iurf6YBj_oCad4k1l4qkHrFpiQ.woff2',
      },
      '800': {
        arabic: 'https://fonts.gstatic.com/s/tajawal/v9/Iurf6YBj_oCad4k1l5anHrRpiYlJ.woff2',
        latin: 'https://fonts.gstatic.com/s/tajawal/v9/Iurf6YBj_oCad4k1l5anHrFpiQ.woff2',
      },
      '900': {
        arabic: 'https://fonts.gstatic.com/s/tajawal/v9/Iurf6YBj_oCad4k1l7KmHrRpiYlJ.woff2',
        latin: 'https://fonts.gstatic.com/s/tajawal/v9/Iurf6YBj_oCad4k1l7KmHrFpiQ.woff2',
      },
    },
  },
};

export const family = meta.family;

type Variants = {
  normal: {
    weights: '200' | '300' | '400' | '500' | '700' | '800' | '900';
    subsets: 'arabic' | 'latin';
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
