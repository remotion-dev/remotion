import { loadFonts } from './base';

export const meta = {
  family: "'Noto Sans Old North Arabian'",
  version: 'v15',
  url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Old+North+Arabian:ital,wght@0,400',
  unicodeRanges: {
    'old-north-arabian':
      'U+10A80-10A9F, U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  },
  fonts: {
    normal: {
      '400': {
        'old-north-arabian': 'https://fonts.gstatic.com/s/notosansoldnortharabian/v15/esDF30BdNv-KYGGJpKGk2tNiMt7Jar6olZDyNdr81zBgF2Ebyg.woff2',
      },
    },
  },
};

export const family = meta.family;

type Variants = {
  normal: {
    weights: '400';
    subsets: 'old-north-arabian';
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
