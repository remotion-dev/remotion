import { loadFonts } from './base';

export const meta = {
  family: "'Noto Sans Ol Chiki'",
  version: 'v17',
  url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Ol+Chiki:ital,wght@0,400;0,500;0,600;0,700',
  unicodeRanges: {
    'ol-chiki':
      'U+1C50-1C7F, U+20B9, U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  },
  fonts: {
    normal: {
      '400': {
        'ol-chiki': 'https://fonts.gstatic.com/s/notosansolchiki/v17/N0bI2TJNOPt-eHmFZCdQbrL32r-4CvhZQByB.woff2',
      },
      '500': {
        'ol-chiki': 'https://fonts.gstatic.com/s/notosansolchiki/v17/N0bI2TJNOPt-eHmFZCdQbrL32r-4CvhZQByB.woff2',
      },
      '600': {
        'ol-chiki': 'https://fonts.gstatic.com/s/notosansolchiki/v17/N0bI2TJNOPt-eHmFZCdQbrL32r-4CvhZQByB.woff2',
      },
      '700': {
        'ol-chiki': 'https://fonts.gstatic.com/s/notosansolchiki/v17/N0bI2TJNOPt-eHmFZCdQbrL32r-4CvhZQByB.woff2',
      },
    },
  },
};

export const family = meta.family;

type Variants = {
  normal: {
    weights: '400' | '500' | '600' | '700';
    subsets: 'ol-chiki';
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
