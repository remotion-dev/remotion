import { loadFonts } from './base';

export const meta = {
  family: "'Noto Serif Tibetan'",
  version: 'v16',
  url: 'https://fonts.googleapis.com/css2?family=Noto+Serif+Tibetan:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900',
  unicodeRanges: {
    tibetan:
      'U+0F00-0FFF, U+200C-200D, U+25CC, U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  },
  fonts: {
    normal: {
      '100': {
        tibetan: 'https://fonts.gstatic.com/s/notoseriftibetan/v16/gokzH7nwAEdtF9N45n0Vaz7O-pk0wsvbBMgm.woff2',
      },
      '200': {
        tibetan: 'https://fonts.gstatic.com/s/notoseriftibetan/v16/gokzH7nwAEdtF9N45n0Vaz7O-pk0wsvbBMgm.woff2',
      },
      '300': {
        tibetan: 'https://fonts.gstatic.com/s/notoseriftibetan/v16/gokzH7nwAEdtF9N45n0Vaz7O-pk0wsvbBMgm.woff2',
      },
      '400': {
        tibetan: 'https://fonts.gstatic.com/s/notoseriftibetan/v16/gokzH7nwAEdtF9N45n0Vaz7O-pk0wsvbBMgm.woff2',
      },
      '500': {
        tibetan: 'https://fonts.gstatic.com/s/notoseriftibetan/v16/gokzH7nwAEdtF9N45n0Vaz7O-pk0wsvbBMgm.woff2',
      },
      '600': {
        tibetan: 'https://fonts.gstatic.com/s/notoseriftibetan/v16/gokzH7nwAEdtF9N45n0Vaz7O-pk0wsvbBMgm.woff2',
      },
      '700': {
        tibetan: 'https://fonts.gstatic.com/s/notoseriftibetan/v16/gokzH7nwAEdtF9N45n0Vaz7O-pk0wsvbBMgm.woff2',
      },
      '800': {
        tibetan: 'https://fonts.gstatic.com/s/notoseriftibetan/v16/gokzH7nwAEdtF9N45n0Vaz7O-pk0wsvbBMgm.woff2',
      },
      '900': {
        tibetan: 'https://fonts.gstatic.com/s/notoseriftibetan/v16/gokzH7nwAEdtF9N45n0Vaz7O-pk0wsvbBMgm.woff2',
      },
    },
  },
};

export const family = meta.family;

type Variants = {
  normal: {
    weights: '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
    subsets: 'tibetan';
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
