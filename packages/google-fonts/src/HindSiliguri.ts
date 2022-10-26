import { loadFonts } from './base';

export const meta = {
  family: "'Hind Siliguri'",
  version: 'v12',
  url: 'https://fonts.googleapis.com/css2?family=Hind+Siliguri:ital,wght@0,300;0,400;0,500;0,600;0,700',
  unicodeRanges: {
    'bengali': 'U+0964-0965, U+0981-09FB, U+200C-200D, U+20B9, U+25CC',
    'latin-ext': 'U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF',
    'latin': 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  },
  fonts: {
    normal: {
      '300': {
        'bengali': 'https://fonts.gstatic.com/s/hindsiliguri/v12/ijwOs5juQtsyLLR5jN4cxBEoRDf40vQVKxGv.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/hindsiliguri/v12/ijwOs5juQtsyLLR5jN4cxBEoRDf40ugVKxGv.woff2',
        'latin': 'https://fonts.gstatic.com/s/hindsiliguri/v12/ijwOs5juQtsyLLR5jN4cxBEoRDf40uYVKw.woff2',
      },
      '400': {
        'bengali': 'https://fonts.gstatic.com/s/hindsiliguri/v12/ijwTs5juQtsyLLR5jN4cxBEoTI7ax9k0.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/hindsiliguri/v12/ijwTs5juQtsyLLR5jN4cxBEoTJLax9k0.woff2',
        'latin': 'https://fonts.gstatic.com/s/hindsiliguri/v12/ijwTs5juQtsyLLR5jN4cxBEoTJzaxw.woff2',
      },
      '500': {
        'bengali': 'https://fonts.gstatic.com/s/hindsiliguri/v12/ijwOs5juQtsyLLR5jN4cxBEoRG_50vQVKxGv.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/hindsiliguri/v12/ijwOs5juQtsyLLR5jN4cxBEoRG_50ugVKxGv.woff2',
        'latin': 'https://fonts.gstatic.com/s/hindsiliguri/v12/ijwOs5juQtsyLLR5jN4cxBEoRG_50uYVKw.woff2',
      },
      '600': {
        'bengali': 'https://fonts.gstatic.com/s/hindsiliguri/v12/ijwOs5juQtsyLLR5jN4cxBEoREP-0vQVKxGv.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/hindsiliguri/v12/ijwOs5juQtsyLLR5jN4cxBEoREP-0ugVKxGv.woff2',
        'latin': 'https://fonts.gstatic.com/s/hindsiliguri/v12/ijwOs5juQtsyLLR5jN4cxBEoREP-0uYVKw.woff2',
      },
      '700': {
        'bengali': 'https://fonts.gstatic.com/s/hindsiliguri/v12/ijwOs5juQtsyLLR5jN4cxBEoRCf_0vQVKxGv.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/hindsiliguri/v12/ijwOs5juQtsyLLR5jN4cxBEoRCf_0ugVKxGv.woff2',
        'latin': 'https://fonts.gstatic.com/s/hindsiliguri/v12/ijwOs5juQtsyLLR5jN4cxBEoRCf_0uYVKw.woff2',
      },
    },
  },
};

export const family = meta.family;

type Variants = {
  normal: {
    weights: '300' | '400' | '500' | '600' | '700';
    subsets: 'bengali' | 'latin' | 'latin-ext';
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
