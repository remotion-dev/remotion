import { loadFonts } from './base';

export const meta = {
  family: "'Tomorrow'",
  version: 'v15',
  url: 'https://fonts.googleapis.com/css2?family=Tomorrow:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900',
  unicodeRanges: {
    'latin-ext': 'U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF',
    'latin': 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  },
  fonts: {
    italic: {
      '100': {
        'latin-ext': 'https://fonts.gstatic.com/s/tomorrow/v15/WBLirETNbFtZCeGqgRXXQwHYJeCssE4.woff2',
        'latin': 'https://fonts.gstatic.com/s/tomorrow/v15/WBLirETNbFtZCeGqgRXXQwHYK-Cs.woff2',
      },
      '200': {
        'latin-ext': 'https://fonts.gstatic.com/s/tomorrow/v15/WBLjrETNbFtZCeGqgRXXQ63JPMmJjXd4.woff2',
        'latin': 'https://fonts.gstatic.com/s/tomorrow/v15/WBLjrETNbFtZCeGqgRXXQ63JPMeJjQ.woff2',
      },
      '300': {
        'latin-ext': 'https://fonts.gstatic.com/s/tomorrow/v15/WBLjrETNbFtZCeGqgRXXQ8nKPMmJjXd4.woff2',
        'latin': 'https://fonts.gstatic.com/s/tomorrow/v15/WBLjrETNbFtZCeGqgRXXQ8nKPMeJjQ.woff2',
      },
      '400': {
        'latin-ext': 'https://fonts.gstatic.com/s/tomorrow/v15/WBLgrETNbFtZCeGqgRXXS2zoKfio.woff2',
        'latin': 'https://fonts.gstatic.com/s/tomorrow/v15/WBLgrETNbFtZCeGqgRXXS2LoKQ.woff2',
      },
      '500': {
        'latin-ext': 'https://fonts.gstatic.com/s/tomorrow/v15/WBLjrETNbFtZCeGqgRXXQ5HLPMmJjXd4.woff2',
        'latin': 'https://fonts.gstatic.com/s/tomorrow/v15/WBLjrETNbFtZCeGqgRXXQ5HLPMeJjQ.woff2',
      },
      '600': {
        'latin-ext': 'https://fonts.gstatic.com/s/tomorrow/v15/WBLjrETNbFtZCeGqgRXXQ73MPMmJjXd4.woff2',
        'latin': 'https://fonts.gstatic.com/s/tomorrow/v15/WBLjrETNbFtZCeGqgRXXQ73MPMeJjQ.woff2',
      },
      '700': {
        'latin-ext': 'https://fonts.gstatic.com/s/tomorrow/v15/WBLjrETNbFtZCeGqgRXXQ9nNPMmJjXd4.woff2',
        'latin': 'https://fonts.gstatic.com/s/tomorrow/v15/WBLjrETNbFtZCeGqgRXXQ9nNPMeJjQ.woff2',
      },
      '800': {
        'latin-ext': 'https://fonts.gstatic.com/s/tomorrow/v15/WBLjrETNbFtZCeGqgRXXQ8XOPMmJjXd4.woff2',
        'latin': 'https://fonts.gstatic.com/s/tomorrow/v15/WBLjrETNbFtZCeGqgRXXQ8XOPMeJjQ.woff2',
      },
      '900': {
        'latin-ext': 'https://fonts.gstatic.com/s/tomorrow/v15/WBLjrETNbFtZCeGqgRXXQ-HPPMmJjXd4.woff2',
        'latin': 'https://fonts.gstatic.com/s/tomorrow/v15/WBLjrETNbFtZCeGqgRXXQ-HPPMeJjQ.woff2',
      },
    },
    normal: {
      '100': {
        'latin-ext': 'https://fonts.gstatic.com/s/tomorrow/v15/WBLgrETNbFtZCeGqgR2xS2zoKfio.woff2',
        'latin': 'https://fonts.gstatic.com/s/tomorrow/v15/WBLgrETNbFtZCeGqgR2xS2LoKQ.woff2',
      },
      '200': {
        'latin-ext': 'https://fonts.gstatic.com/s/tomorrow/v15/WBLhrETNbFtZCeGqgR0dWnXBDMWRiQ.woff2',
        'latin': 'https://fonts.gstatic.com/s/tomorrow/v15/WBLhrETNbFtZCeGqgR0dWnXPDMU.woff2',
      },
      '300': {
        'latin-ext': 'https://fonts.gstatic.com/s/tomorrow/v15/WBLhrETNbFtZCeGqgR15WXXBDMWRiQ.woff2',
        'latin': 'https://fonts.gstatic.com/s/tomorrow/v15/WBLhrETNbFtZCeGqgR15WXXPDMU.woff2',
      },
      '400': {
        'latin-ext': 'https://fonts.gstatic.com/s/tomorrow/v15/WBLmrETNbFtZCeGqgRXce2DwLQ.woff2',
        'latin': 'https://fonts.gstatic.com/s/tomorrow/v15/WBLmrETNbFtZCeGqgRXSe2A.woff2',
      },
      '500': {
        'latin-ext': 'https://fonts.gstatic.com/s/tomorrow/v15/WBLhrETNbFtZCeGqgR0hWHXBDMWRiQ.woff2',
        'latin': 'https://fonts.gstatic.com/s/tomorrow/v15/WBLhrETNbFtZCeGqgR0hWHXPDMU.woff2',
      },
      '600': {
        'latin-ext': 'https://fonts.gstatic.com/s/tomorrow/v15/WBLhrETNbFtZCeGqgR0NX3XBDMWRiQ.woff2',
        'latin': 'https://fonts.gstatic.com/s/tomorrow/v15/WBLhrETNbFtZCeGqgR0NX3XPDMU.woff2',
      },
      '700': {
        'latin-ext': 'https://fonts.gstatic.com/s/tomorrow/v15/WBLhrETNbFtZCeGqgR1pXnXBDMWRiQ.woff2',
        'latin': 'https://fonts.gstatic.com/s/tomorrow/v15/WBLhrETNbFtZCeGqgR1pXnXPDMU.woff2',
      },
      '800': {
        'latin-ext': 'https://fonts.gstatic.com/s/tomorrow/v15/WBLhrETNbFtZCeGqgR11XXXBDMWRiQ.woff2',
        'latin': 'https://fonts.gstatic.com/s/tomorrow/v15/WBLhrETNbFtZCeGqgR11XXXPDMU.woff2',
      },
      '900': {
        'latin-ext': 'https://fonts.gstatic.com/s/tomorrow/v15/WBLhrETNbFtZCeGqgR1RXHXBDMWRiQ.woff2',
        'latin': 'https://fonts.gstatic.com/s/tomorrow/v15/WBLhrETNbFtZCeGqgR1RXHXPDMU.woff2',
      },
    },
  },
};

export const family = meta.family;

type Variants = {
  italic: {
    weights: '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
    subsets: 'latin' | 'latin-ext';
  };
  normal: {
    weights: '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
    subsets: 'latin' | 'latin-ext';
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
