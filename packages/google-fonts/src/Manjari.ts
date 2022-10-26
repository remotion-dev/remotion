import { loadFonts } from './base';

export const meta = {
  family: "'Manjari'",
  version: 'v9',
  url: 'https://fonts.googleapis.com/css2?family=Manjari:ital,wght@0,100;0,400;0,700',
  unicodeRanges: {
    'malayalam': 'U+0307, U+0323, U+0964-0965, U+0D02-0D7F, U+200C-200D, U+20B9, U+25CC',
    'latin-ext': 'U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF',
    'latin': 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  },
  fonts: {
    normal: {
      '100': {
        'malayalam': 'https://fonts.gstatic.com/s/manjari/v9/k3kSo8UPMOBO2w1UdbrYNGHEEaM.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/manjari/v9/k3kSo8UPMOBO2w1UdbrYImHEEaM.woff2',
        'latin': 'https://fonts.gstatic.com/s/manjari/v9/k3kSo8UPMOBO2w1UdbrYLGHE.woff2',
      },
      '400': {
        'malayalam': 'https://fonts.gstatic.com/s/manjari/v9/k3kQo8UPMOBO2w1UfcHoLnnA.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/manjari/v9/k3kQo8UPMOBO2w1UfdfoLnnA.woff2',
        'latin': 'https://fonts.gstatic.com/s/manjari/v9/k3kQo8UPMOBO2w1UfdnoLg.woff2',
      },
      '700': {
        'malayalam': 'https://fonts.gstatic.com/s/manjari/v9/k3kVo8UPMOBO2w1UdWLNO17hLJqM.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/manjari/v9/k3kVo8UPMOBO2w1UdWLNO0jhLJqM.woff2',
        'latin': 'https://fonts.gstatic.com/s/manjari/v9/k3kVo8UPMOBO2w1UdWLNO0bhLA.woff2',
      },
    },
  },
};

export const family = meta.family;

type Variants = {
  normal: {
    weights: '100' | '400' | '700';
    subsets: 'latin' | 'latin-ext' | 'malayalam';
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
