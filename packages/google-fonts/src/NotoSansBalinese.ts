import { loadFonts } from './base';

export const meta = {
  family: "'Noto Sans Balinese'",
  version: 'v18',
  url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Balinese:ital,wght@0,400;0,500;0,600;0,700',
  unicodeRanges: {
    'balinese': 'U+001D, U+1B00-1B7F, U+200C-200D, U+25CC',
    'latin-ext': 'U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF',
    'latin': 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  },
  fonts: {
    normal: {
      '400': {
        'balinese': 'https://fonts.gstatic.com/s/notosansbalinese/v18/NaPFcYvSBuhTirw6IaFn6UrRDaqje-lDRpyciWM.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/notosansbalinese/v18/NaPFcYvSBuhTirw6IaFn6UrRDaqje-lDb5yciWM.woff2',
        'latin': 'https://fonts.gstatic.com/s/notosansbalinese/v18/NaPFcYvSBuhTirw6IaFn6UrRDaqje-lDYZyc.woff2',
      },
      '500': {
        'balinese': 'https://fonts.gstatic.com/s/notosansbalinese/v18/NaPFcYvSBuhTirw6IaFn6UrRDaqje-lDRpyciWM.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/notosansbalinese/v18/NaPFcYvSBuhTirw6IaFn6UrRDaqje-lDb5yciWM.woff2',
        'latin': 'https://fonts.gstatic.com/s/notosansbalinese/v18/NaPFcYvSBuhTirw6IaFn6UrRDaqje-lDYZyc.woff2',
      },
      '600': {
        'balinese': 'https://fonts.gstatic.com/s/notosansbalinese/v18/NaPFcYvSBuhTirw6IaFn6UrRDaqje-lDRpyciWM.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/notosansbalinese/v18/NaPFcYvSBuhTirw6IaFn6UrRDaqje-lDb5yciWM.woff2',
        'latin': 'https://fonts.gstatic.com/s/notosansbalinese/v18/NaPFcYvSBuhTirw6IaFn6UrRDaqje-lDYZyc.woff2',
      },
      '700': {
        'balinese': 'https://fonts.gstatic.com/s/notosansbalinese/v18/NaPFcYvSBuhTirw6IaFn6UrRDaqje-lDRpyciWM.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/notosansbalinese/v18/NaPFcYvSBuhTirw6IaFn6UrRDaqje-lDb5yciWM.woff2',
        'latin': 'https://fonts.gstatic.com/s/notosansbalinese/v18/NaPFcYvSBuhTirw6IaFn6UrRDaqje-lDYZyc.woff2',
      },
    },
  },
};

export const family = meta.family;

type Variants = {
  normal: {
    weights: '400' | '500' | '600' | '700';
    subsets: 'balinese' | 'latin' | 'latin-ext';
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
