import { loadFonts } from './base';

export const meta = {
  family: "'Arima Madurai'",
  version: 'v14',
  url: 'https://fonts.googleapis.com/css2?family=Arima+Madurai:ital,wght@0,100;0,200;0,300;0,400;0,500;0,700;0,800;0,900',
  unicodeRanges: {
    'tamil': 'U+0964-0965, U+0B82-0BFA, U+200C-200D, U+20B9, U+25CC',
    'vietnamese': 'U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+1EA0-1EF9, U+20AB',
    'latin-ext': 'U+0100-024F, U+0259, U+1E00-1EFF, U+2020, U+20A0-20AB, U+20AD-20CF, U+2113, U+2C60-2C7F, U+A720-A7FF',
    'latin': 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
  },
  fonts: {
    normal: {
      '100': {
        'tamil': 'https://fonts.gstatic.com/s/arimamadurai/v14/t5t4IRoeKYORG0WNMgnC3seB1V3_u7uDQh4.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/arimamadurai/v14/t5t4IRoeKYORG0WNMgnC3seB1V3_oruDQh4.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/arimamadurai/v14/t5t4IRoeKYORG0WNMgnC3seB1V3_o7uDQh4.woff2',
        'latin': 'https://fonts.gstatic.com/s/arimamadurai/v14/t5t4IRoeKYORG0WNMgnC3seB1V3_rbuD.woff2',
      },
      '200': {
        'tamil': 'https://fonts.gstatic.com/s/arimamadurai/v14/t5t7IRoeKYORG0WNMgnC3seB1fHuuoqmfyca.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/arimamadurai/v14/t5t7IRoeKYORG0WNMgnC3seB1fHuupOmfyca.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/arimamadurai/v14/t5t7IRoeKYORG0WNMgnC3seB1fHuupKmfyca.woff2',
        'latin': 'https://fonts.gstatic.com/s/arimamadurai/v14/t5t7IRoeKYORG0WNMgnC3seB1fHuupymfw.woff2',
      },
      '300': {
        'tamil': 'https://fonts.gstatic.com/s/arimamadurai/v14/t5t7IRoeKYORG0WNMgnC3seB1ZXtuoqmfyca.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/arimamadurai/v14/t5t7IRoeKYORG0WNMgnC3seB1ZXtupOmfyca.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/arimamadurai/v14/t5t7IRoeKYORG0WNMgnC3seB1ZXtupKmfyca.woff2',
        'latin': 'https://fonts.gstatic.com/s/arimamadurai/v14/t5t7IRoeKYORG0WNMgnC3seB1ZXtupymfw.woff2',
      },
      '400': {
        'tamil': 'https://fonts.gstatic.com/s/arimamadurai/v14/t5tmIRoeKYORG0WNMgnC3seB3SjPr6OH.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/arimamadurai/v14/t5tmIRoeKYORG0WNMgnC3seB3THPr6OH.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/arimamadurai/v14/t5tmIRoeKYORG0WNMgnC3seB3TDPr6OH.woff2',
        'latin': 'https://fonts.gstatic.com/s/arimamadurai/v14/t5tmIRoeKYORG0WNMgnC3seB3T7Prw.woff2',
      },
      '500': {
        'tamil': 'https://fonts.gstatic.com/s/arimamadurai/v14/t5t7IRoeKYORG0WNMgnC3seB1c3suoqmfyca.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/arimamadurai/v14/t5t7IRoeKYORG0WNMgnC3seB1c3supOmfyca.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/arimamadurai/v14/t5t7IRoeKYORG0WNMgnC3seB1c3supKmfyca.woff2',
        'latin': 'https://fonts.gstatic.com/s/arimamadurai/v14/t5t7IRoeKYORG0WNMgnC3seB1c3supymfw.woff2',
      },
      '700': {
        'tamil': 'https://fonts.gstatic.com/s/arimamadurai/v14/t5t7IRoeKYORG0WNMgnC3seB1YXquoqmfyca.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/arimamadurai/v14/t5t7IRoeKYORG0WNMgnC3seB1YXqupOmfyca.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/arimamadurai/v14/t5t7IRoeKYORG0WNMgnC3seB1YXqupKmfyca.woff2',
        'latin': 'https://fonts.gstatic.com/s/arimamadurai/v14/t5t7IRoeKYORG0WNMgnC3seB1YXqupymfw.woff2',
      },
      '800': {
        'tamil': 'https://fonts.gstatic.com/s/arimamadurai/v14/t5t7IRoeKYORG0WNMgnC3seB1Znpuoqmfyca.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/arimamadurai/v14/t5t7IRoeKYORG0WNMgnC3seB1ZnpupOmfyca.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/arimamadurai/v14/t5t7IRoeKYORG0WNMgnC3seB1ZnpupKmfyca.woff2',
        'latin': 'https://fonts.gstatic.com/s/arimamadurai/v14/t5t7IRoeKYORG0WNMgnC3seB1Znpupymfw.woff2',
      },
      '900': {
        'tamil': 'https://fonts.gstatic.com/s/arimamadurai/v14/t5t7IRoeKYORG0WNMgnC3seB1b3ouoqmfyca.woff2',
        'vietnamese': 'https://fonts.gstatic.com/s/arimamadurai/v14/t5t7IRoeKYORG0WNMgnC3seB1b3oupOmfyca.woff2',
        'latin-ext': 'https://fonts.gstatic.com/s/arimamadurai/v14/t5t7IRoeKYORG0WNMgnC3seB1b3oupKmfyca.woff2',
        'latin': 'https://fonts.gstatic.com/s/arimamadurai/v14/t5t7IRoeKYORG0WNMgnC3seB1b3oupymfw.woff2',
      },
    },
  },
};

export const family = meta.family;

type Variants = {
  normal: {
    weights: '100' | '200' | '300' | '400' | '500' | '700' | '800' | '900';
    subsets: 'latin' | 'latin-ext' | 'tamil' | 'vietnamese';
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
