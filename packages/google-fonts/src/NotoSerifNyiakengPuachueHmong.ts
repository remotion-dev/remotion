import { loadFonts } from './base';

export const meta = {
  family: "'Noto Serif Nyiakeng Puachue Hmong'",
  version: 'v16',
  url: 'https://fonts.googleapis.com/css2?family=Noto+Serif+Nyiakeng+Puachue+Hmong:ital,wght@0,400;0,500;0,600;0,700',
  unicodeRanges: {
    'nyiakeng-puachue-hmong':
      'U+1E100-1E14F, U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  },
  fonts: {
    normal: {
      '400': {
        'nyiakeng-puachue-hmong': 'https://fonts.gstatic.com/s/notoserifnyiakengpuachuehmong/v16/5h1wibMoOmIC3YuzLC-NZyLDZC8iwh-MTC8ggAjEhePFNRVcneAvPIfwpA.woff2',
      },
      '500': {
        'nyiakeng-puachue-hmong': 'https://fonts.gstatic.com/s/notoserifnyiakengpuachuehmong/v16/5h1wibMoOmIC3YuzLC-NZyLDZC8iwh-MTC8ggAjEhePFNRVcneAvPIfwpA.woff2',
      },
      '600': {
        'nyiakeng-puachue-hmong': 'https://fonts.gstatic.com/s/notoserifnyiakengpuachuehmong/v16/5h1wibMoOmIC3YuzLC-NZyLDZC8iwh-MTC8ggAjEhePFNRVcneAvPIfwpA.woff2',
      },
      '700': {
        'nyiakeng-puachue-hmong': 'https://fonts.gstatic.com/s/notoserifnyiakengpuachuehmong/v16/5h1wibMoOmIC3YuzLC-NZyLDZC8iwh-MTC8ggAjEhePFNRVcneAvPIfwpA.woff2',
      },
    },
  },
};

export const family = meta.family;

type Variants = {
  normal: {
    weights: '400' | '500' | '600' | '700';
    subsets: 'nyiakeng-puachue-hmong';
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
