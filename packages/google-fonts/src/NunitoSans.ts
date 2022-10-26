import { loadFonts } from './base';

export const meta = {
  family: "'Nunito Sans'",
  version: 'v12',
  url: 'https://fonts.googleapis.com/css2?family=Nunito+Sans:ital,wght@0,200;0,300;0,400;0,600;0,700;0,800;0,900;1,200;1,300;1,400;1,600;1,700;1,800;1,900',
  unicodeRanges: {
    'cyrillic-ext': 'U+0460-052F, U+1C80-1C88, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F',
    'cyrillic': 'U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116',
    'vietnamese': 'U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+1EA0-1EF9, U+20AB',
    'latin-ext': 'U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF',
    'latin': 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  },
  fonts: {
    italic: {
      '200': {
        'cyrillic-ext': 'https://fonts.gstatic.com/s/nunitosans/v12/pe01MImSLYBIv1o4X1M8cce4GxZrY14IUql-.woff2',
        'cyrillic': 'https://fonts.gstatic.com/s/nunitosans/v12/pe01MImSLYBIv1o4X1M8cce4GxZrY1cIUql-.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/nunitosans/v12/pe01MImSLYBIv1o4X1M8cce4GxZrY1wIUql-.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/nunitosans/v12/pe01MImSLYBIv1o4X1M8cce4GxZrY10IUql-.woff2',
        'latin': 'https://fonts.gstatic.com/s/nunitosans/v12/pe01MImSLYBIv1o4X1M8cce4GxZrY1MIUg.woff2',
      },
      '300': {
        'cyrillic-ext': 'https://fonts.gstatic.com/s/nunitosans/v12/pe01MImSLYBIv1o4X1M8cce4G3JoY14IUql-.woff2',
        'cyrillic': 'https://fonts.gstatic.com/s/nunitosans/v12/pe01MImSLYBIv1o4X1M8cce4G3JoY1cIUql-.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/nunitosans/v12/pe01MImSLYBIv1o4X1M8cce4G3JoY1wIUql-.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/nunitosans/v12/pe01MImSLYBIv1o4X1M8cce4G3JoY10IUql-.woff2',
        'latin': 'https://fonts.gstatic.com/s/nunitosans/v12/pe01MImSLYBIv1o4X1M8cce4G3JoY1MIUg.woff2',
      },
      '400': {
        'cyrillic-ext': 'https://fonts.gstatic.com/s/nunitosans/v12/pe0oMImSLYBIv1o4X1M8cce4E9RKdmwp.woff2',
        'cyrillic': 'https://fonts.gstatic.com/s/nunitosans/v12/pe0oMImSLYBIv1o4X1M8cce4E91Kdmwp.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/nunitosans/v12/pe0oMImSLYBIv1o4X1M8cce4E9ZKdmwp.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/nunitosans/v12/pe0oMImSLYBIv1o4X1M8cce4E9dKdmwp.woff2',
        'latin': 'https://fonts.gstatic.com/s/nunitosans/v12/pe0oMImSLYBIv1o4X1M8cce4E9lKdg.woff2',
      },
      '600': {
        'cyrillic-ext': 'https://fonts.gstatic.com/s/nunitosans/v12/pe01MImSLYBIv1o4X1M8cce4GwZuY14IUql-.woff2',
        'cyrillic': 'https://fonts.gstatic.com/s/nunitosans/v12/pe01MImSLYBIv1o4X1M8cce4GwZuY1cIUql-.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/nunitosans/v12/pe01MImSLYBIv1o4X1M8cce4GwZuY1wIUql-.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/nunitosans/v12/pe01MImSLYBIv1o4X1M8cce4GwZuY10IUql-.woff2',
        'latin': 'https://fonts.gstatic.com/s/nunitosans/v12/pe01MImSLYBIv1o4X1M8cce4GwZuY1MIUg.woff2',
      },
      '700': {
        'cyrillic-ext': 'https://fonts.gstatic.com/s/nunitosans/v12/pe01MImSLYBIv1o4X1M8cce4G2JvY14IUql-.woff2',
        'cyrillic': 'https://fonts.gstatic.com/s/nunitosans/v12/pe01MImSLYBIv1o4X1M8cce4G2JvY1cIUql-.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/nunitosans/v12/pe01MImSLYBIv1o4X1M8cce4G2JvY1wIUql-.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/nunitosans/v12/pe01MImSLYBIv1o4X1M8cce4G2JvY10IUql-.woff2',
        'latin': 'https://fonts.gstatic.com/s/nunitosans/v12/pe01MImSLYBIv1o4X1M8cce4G2JvY1MIUg.woff2',
      },
      '800': {
        'cyrillic-ext': 'https://fonts.gstatic.com/s/nunitosans/v12/pe01MImSLYBIv1o4X1M8cce4G35sY14IUql-.woff2',
        'cyrillic': 'https://fonts.gstatic.com/s/nunitosans/v12/pe01MImSLYBIv1o4X1M8cce4G35sY1cIUql-.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/nunitosans/v12/pe01MImSLYBIv1o4X1M8cce4G35sY1wIUql-.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/nunitosans/v12/pe01MImSLYBIv1o4X1M8cce4G35sY10IUql-.woff2',
        'latin': 'https://fonts.gstatic.com/s/nunitosans/v12/pe01MImSLYBIv1o4X1M8cce4G35sY1MIUg.woff2',
      },
      '900': {
        'cyrillic-ext': 'https://fonts.gstatic.com/s/nunitosans/v12/pe01MImSLYBIv1o4X1M8cce4G1ptY14IUql-.woff2',
        'cyrillic': 'https://fonts.gstatic.com/s/nunitosans/v12/pe01MImSLYBIv1o4X1M8cce4G1ptY1cIUql-.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/nunitosans/v12/pe01MImSLYBIv1o4X1M8cce4G1ptY1wIUql-.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/nunitosans/v12/pe01MImSLYBIv1o4X1M8cce4G1ptY10IUql-.woff2',
        'latin': 'https://fonts.gstatic.com/s/nunitosans/v12/pe01MImSLYBIv1o4X1M8cce4G1ptY1MIUg.woff2',
      },
    },
    normal: {
      '200': {
        'cyrillic-ext': 'https://fonts.gstatic.com/s/nunitosans/v12/pe03MImSLYBIv1o4X1M8cc9yAs5gU1EQVg.woff2',
        'cyrillic': 'https://fonts.gstatic.com/s/nunitosans/v12/pe03MImSLYBIv1o4X1M8cc9yAs5pU1EQVg.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/nunitosans/v12/pe03MImSLYBIv1o4X1M8cc9yAs5iU1EQVg.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/nunitosans/v12/pe03MImSLYBIv1o4X1M8cc9yAs5jU1EQVg.woff2',
        'latin': 'https://fonts.gstatic.com/s/nunitosans/v12/pe03MImSLYBIv1o4X1M8cc9yAs5tU1E.woff2',
      },
      '300': {
        'cyrillic-ext': 'https://fonts.gstatic.com/s/nunitosans/v12/pe03MImSLYBIv1o4X1M8cc8WAc5gU1EQVg.woff2',
        'cyrillic': 'https://fonts.gstatic.com/s/nunitosans/v12/pe03MImSLYBIv1o4X1M8cc8WAc5pU1EQVg.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/nunitosans/v12/pe03MImSLYBIv1o4X1M8cc8WAc5iU1EQVg.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/nunitosans/v12/pe03MImSLYBIv1o4X1M8cc8WAc5jU1EQVg.woff2',
        'latin': 'https://fonts.gstatic.com/s/nunitosans/v12/pe03MImSLYBIv1o4X1M8cc8WAc5tU1E.woff2',
      },
      '400': {
        'cyrillic-ext': 'https://fonts.gstatic.com/s/nunitosans/v12/pe0qMImSLYBIv1o4X1M8ccewI9tScg.woff2',
        'cyrillic': 'https://fonts.gstatic.com/s/nunitosans/v12/pe0qMImSLYBIv1o4X1M8cce5I9tScg.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/nunitosans/v12/pe0qMImSLYBIv1o4X1M8cceyI9tScg.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/nunitosans/v12/pe0qMImSLYBIv1o4X1M8ccezI9tScg.woff2',
        'latin': 'https://fonts.gstatic.com/s/nunitosans/v12/pe0qMImSLYBIv1o4X1M8cce9I9s.woff2',
      },
      '600': {
        'cyrillic-ext': 'https://fonts.gstatic.com/s/nunitosans/v12/pe03MImSLYBIv1o4X1M8cc9iB85gU1EQVg.woff2',
        'cyrillic': 'https://fonts.gstatic.com/s/nunitosans/v12/pe03MImSLYBIv1o4X1M8cc9iB85pU1EQVg.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/nunitosans/v12/pe03MImSLYBIv1o4X1M8cc9iB85iU1EQVg.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/nunitosans/v12/pe03MImSLYBIv1o4X1M8cc9iB85jU1EQVg.woff2',
        'latin': 'https://fonts.gstatic.com/s/nunitosans/v12/pe03MImSLYBIv1o4X1M8cc9iB85tU1E.woff2',
      },
      '700': {
        'cyrillic-ext': 'https://fonts.gstatic.com/s/nunitosans/v12/pe03MImSLYBIv1o4X1M8cc8GBs5gU1EQVg.woff2',
        'cyrillic': 'https://fonts.gstatic.com/s/nunitosans/v12/pe03MImSLYBIv1o4X1M8cc8GBs5pU1EQVg.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/nunitosans/v12/pe03MImSLYBIv1o4X1M8cc8GBs5iU1EQVg.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/nunitosans/v12/pe03MImSLYBIv1o4X1M8cc8GBs5jU1EQVg.woff2',
        'latin': 'https://fonts.gstatic.com/s/nunitosans/v12/pe03MImSLYBIv1o4X1M8cc8GBs5tU1E.woff2',
      },
      '800': {
        'cyrillic-ext': 'https://fonts.gstatic.com/s/nunitosans/v12/pe03MImSLYBIv1o4X1M8cc8aBc5gU1EQVg.woff2',
        'cyrillic': 'https://fonts.gstatic.com/s/nunitosans/v12/pe03MImSLYBIv1o4X1M8cc8aBc5pU1EQVg.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/nunitosans/v12/pe03MImSLYBIv1o4X1M8cc8aBc5iU1EQVg.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/nunitosans/v12/pe03MImSLYBIv1o4X1M8cc8aBc5jU1EQVg.woff2',
        'latin': 'https://fonts.gstatic.com/s/nunitosans/v12/pe03MImSLYBIv1o4X1M8cc8aBc5tU1E.woff2',
      },
      '900': {
        'cyrillic-ext': 'https://fonts.gstatic.com/s/nunitosans/v12/pe03MImSLYBIv1o4X1M8cc8-BM5gU1EQVg.woff2',
        'cyrillic': 'https://fonts.gstatic.com/s/nunitosans/v12/pe03MImSLYBIv1o4X1M8cc8-BM5pU1EQVg.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/nunitosans/v12/pe03MImSLYBIv1o4X1M8cc8-BM5iU1EQVg.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/nunitosans/v12/pe03MImSLYBIv1o4X1M8cc8-BM5jU1EQVg.woff2',
        'latin': 'https://fonts.gstatic.com/s/nunitosans/v12/pe03MImSLYBIv1o4X1M8cc8-BM5tU1E.woff2',
      },
    },
  },
};

export const family = meta.family;

type Variants = {
  italic: {
    weights: '200' | '300' | '400' | '600' | '700' | '800' | '900';
    subsets: 'cyrillic' | 'cyrillic-ext' | 'latin' | 'latin-ext' | 'vietnamese';
  };
  normal: {
    weights: '200' | '300' | '400' | '600' | '700' | '800' | '900';
    subsets: 'cyrillic' | 'cyrillic-ext' | 'latin' | 'latin-ext' | 'vietnamese';
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
