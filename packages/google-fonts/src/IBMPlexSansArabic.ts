import { loadFonts } from './base';

export const meta = {
  family: "'IBM Plex Sans Arabic'",
  version: 'v7',
  url: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700',
  unicodeRanges: {
    'arabic': 'U+0600-06FF, U+200C-200E, U+2010-2011, U+204F, U+2E41, U+FB50-FDFF, U+FE80-FEFC',
    'cyrillic-ext': 'U+0460-052F, U+1C80-1C88, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F',
    'latin-ext': 'U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF',
    'latin': 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  },
  fonts: {
    normal: {
      '100': {
        'arabic': 'https://fonts.gstatic.com/s/ibmplexsansarabic/v7/Qw3MZRtWPQCuHme67tEYUIx3Kh0PHR9N6YNe7PKzeflA.woff2',
        'cyrillic-ext': 'https://fonts.gstatic.com/s/ibmplexsansarabic/v7/Qw3MZRtWPQCuHme67tEYUIx3Kh0PHR9N6YNe7PqzeflA.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/ibmplexsansarabic/v7/Qw3MZRtWPQCuHme67tEYUIx3Kh0PHR9N6YNe7PmzeflA.woff2',
        'latin': 'https://fonts.gstatic.com/s/ibmplexsansarabic/v7/Qw3MZRtWPQCuHme67tEYUIx3Kh0PHR9N6YNe7PezeQ.woff2',
      },
      '200': {
        'arabic': 'https://fonts.gstatic.com/s/ibmplexsansarabic/v7/Qw3NZRtWPQCuHme67tEYUIx3Kh0PHR9N6YPy_eCRXMR5Kw.woff2',
        'cyrillic-ext': 'https://fonts.gstatic.com/s/ibmplexsansarabic/v7/Qw3NZRtWPQCuHme67tEYUIx3Kh0PHR9N6YPy_eCZXMR5Kw.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/ibmplexsansarabic/v7/Qw3NZRtWPQCuHme67tEYUIx3Kh0PHR9N6YPy_eCaXMR5Kw.woff2',
        'latin': 'https://fonts.gstatic.com/s/ibmplexsansarabic/v7/Qw3NZRtWPQCuHme67tEYUIx3Kh0PHR9N6YPy_eCUXMQ.woff2',
      },
      '300': {
        'arabic': 'https://fonts.gstatic.com/s/ibmplexsansarabic/v7/Qw3NZRtWPQCuHme67tEYUIx3Kh0PHR9N6YOW_uCRXMR5Kw.woff2',
        'cyrillic-ext': 'https://fonts.gstatic.com/s/ibmplexsansarabic/v7/Qw3NZRtWPQCuHme67tEYUIx3Kh0PHR9N6YOW_uCZXMR5Kw.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/ibmplexsansarabic/v7/Qw3NZRtWPQCuHme67tEYUIx3Kh0PHR9N6YOW_uCaXMR5Kw.woff2',
        'latin': 'https://fonts.gstatic.com/s/ibmplexsansarabic/v7/Qw3NZRtWPQCuHme67tEYUIx3Kh0PHR9N6YOW_uCUXMQ.woff2',
      },
      '400': {
        'arabic': 'https://fonts.gstatic.com/s/ibmplexsansarabic/v7/Qw3CZRtWPQCuHme67tEYUIx3Kh0PHR9N6Ys43PWrfQ.woff2',
        'cyrillic-ext': 'https://fonts.gstatic.com/s/ibmplexsansarabic/v7/Qw3CZRtWPQCuHme67tEYUIx3Kh0PHR9N6Ysw3PWrfQ.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/ibmplexsansarabic/v7/Qw3CZRtWPQCuHme67tEYUIx3Kh0PHR9N6Ysz3PWrfQ.woff2',
        'latin': 'https://fonts.gstatic.com/s/ibmplexsansarabic/v7/Qw3CZRtWPQCuHme67tEYUIx3Kh0PHR9N6Ys93PU.woff2',
      },
      '500': {
        'arabic': 'https://fonts.gstatic.com/s/ibmplexsansarabic/v7/Qw3NZRtWPQCuHme67tEYUIx3Kh0PHR9N6YPO_-CRXMR5Kw.woff2',
        'cyrillic-ext': 'https://fonts.gstatic.com/s/ibmplexsansarabic/v7/Qw3NZRtWPQCuHme67tEYUIx3Kh0PHR9N6YPO_-CZXMR5Kw.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/ibmplexsansarabic/v7/Qw3NZRtWPQCuHme67tEYUIx3Kh0PHR9N6YPO_-CaXMR5Kw.woff2',
        'latin': 'https://fonts.gstatic.com/s/ibmplexsansarabic/v7/Qw3NZRtWPQCuHme67tEYUIx3Kh0PHR9N6YPO_-CUXMQ.woff2',
      },
      '600': {
        'arabic': 'https://fonts.gstatic.com/s/ibmplexsansarabic/v7/Qw3NZRtWPQCuHme67tEYUIx3Kh0PHR9N6YPi-OCRXMR5Kw.woff2',
        'cyrillic-ext': 'https://fonts.gstatic.com/s/ibmplexsansarabic/v7/Qw3NZRtWPQCuHme67tEYUIx3Kh0PHR9N6YPi-OCZXMR5Kw.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/ibmplexsansarabic/v7/Qw3NZRtWPQCuHme67tEYUIx3Kh0PHR9N6YPi-OCaXMR5Kw.woff2',
        'latin': 'https://fonts.gstatic.com/s/ibmplexsansarabic/v7/Qw3NZRtWPQCuHme67tEYUIx3Kh0PHR9N6YPi-OCUXMQ.woff2',
      },
      '700': {
        'arabic': 'https://fonts.gstatic.com/s/ibmplexsansarabic/v7/Qw3NZRtWPQCuHme67tEYUIx3Kh0PHR9N6YOG-eCRXMR5Kw.woff2',
        'cyrillic-ext': 'https://fonts.gstatic.com/s/ibmplexsansarabic/v7/Qw3NZRtWPQCuHme67tEYUIx3Kh0PHR9N6YOG-eCZXMR5Kw.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/ibmplexsansarabic/v7/Qw3NZRtWPQCuHme67tEYUIx3Kh0PHR9N6YOG-eCaXMR5Kw.woff2',
        'latin': 'https://fonts.gstatic.com/s/ibmplexsansarabic/v7/Qw3NZRtWPQCuHme67tEYUIx3Kh0PHR9N6YOG-eCUXMQ.woff2',
      },
    },
  },
};

export const family = meta.family;

type Variants = {
  normal: {
    weights: '100' | '200' | '300' | '400' | '500' | '600' | '700';
    subsets: 'arabic' | 'cyrillic-ext' | 'latin' | 'latin-ext';
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
