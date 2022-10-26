import { loadFonts } from './base';

export const meta = {
  family: "'Mirza'",
  version: 'v15',
  url: 'https://fonts.googleapis.com/css2?family=Mirza:ital,wght@0,400;0,500;0,600;0,700',
  unicodeRanges: {
    'arabic': 'U+0600-06FF, U+200C-200E, U+2010-2011, U+204F, U+2E41, U+FB50-FDFF, U+FE80-FEFC',
    'latin-ext': 'U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF',
    'latin': 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  },
  fonts: {
    normal: {
      '400': {
        'arabic': 'https://fonts.gstatic.com/s/mirza/v15/co3ImWlikiN5EtrfIsaAsg.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/mirza/v15/co3ImWlikiN5EtrUIsaAsg.woff2',
        'latin': 'https://fonts.gstatic.com/s/mirza/v15/co3ImWlikiN5EtraIsY.woff2',
      },
      '500': {
        'arabic': 'https://fonts.gstatic.com/s/mirza/v15/co3FmWlikiN5EtIpAdO6k6bxog.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/mirza/v15/co3FmWlikiN5EtIpAdOxk6bxog.woff2',
        'latin': 'https://fonts.gstatic.com/s/mirza/v15/co3FmWlikiN5EtIpAdO_k6Y.woff2',
      },
      '600': {
        'arabic': 'https://fonts.gstatic.com/s/mirza/v15/co3FmWlikiN5EtIFBtO6k6bxog.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/mirza/v15/co3FmWlikiN5EtIFBtOxk6bxog.woff2',
        'latin': 'https://fonts.gstatic.com/s/mirza/v15/co3FmWlikiN5EtIFBtO_k6Y.woff2',
      },
      '700': {
        'arabic': 'https://fonts.gstatic.com/s/mirza/v15/co3FmWlikiN5EtJhB9O6k6bxog.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/mirza/v15/co3FmWlikiN5EtJhB9Oxk6bxog.woff2',
        'latin': 'https://fonts.gstatic.com/s/mirza/v15/co3FmWlikiN5EtJhB9O_k6Y.woff2',
      },
    },
  },
};

export const family = meta.family;

type Variants = {
  normal: {
    weights: '400' | '500' | '600' | '700';
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
