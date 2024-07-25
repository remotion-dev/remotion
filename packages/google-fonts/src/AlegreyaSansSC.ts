import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Alegreya Sans SC',
	importName: 'AlegreyaSansSC',
	version: 'v23',
	url: 'https://fonts.googleapis.com/css2?family=Alegreya+Sans+SC:ital,wght@0,100;0,300;0,400;0,500;0,700;0,800;0,900;1,100;1,300;1,400;1,500;1,700;1,800;1,900',
	unicodeRanges: {
		'cyrillic-ext':
			'U+0460-052F, U+1C80-1C88, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F',
		cyrillic: 'U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116',
		'greek-ext': 'U+1F00-1FFF',
		greek:
			'U+0370-0377, U+037A-037F, U+0384-038A, U+038C, U+038E-03A1, U+03A3-03FF',
		vietnamese:
			'U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB',
		'latin-ext':
			'U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		italic: {
			'100': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGl4-RGJqfMvt7P8FUr0Q1j-Hf1BkxdljRLFY9GMg.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGl4-RGJqfMvt7P8FUr0Q1j-Hf1BkxdljRCFY9GMg.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGl4-RGJqfMvt7P8FUr0Q1j-Hf1BkxdljRKFY9GMg.woff2',
				greek:
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGl4-RGJqfMvt7P8FUr0Q1j-Hf1BkxdljRFFY9GMg.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGl4-RGJqfMvt7P8FUr0Q1j-Hf1BkxdljRJFY9GMg.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGl4-RGJqfMvt7P8FUr0Q1j-Hf1BkxdljRIFY9GMg.woff2',
				latin:
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGl4-RGJqfMvt7P8FUr0Q1j-Hf1BkxdljRGFY8.woff2',
			},
			'300': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGk4-RGJqfMvt7P8FUr0Q1j-Hf1BkxdXiZRP6p7C-4.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGk4-RGJqfMvt7P8FUr0Q1j-Hf1BkxdXiZRNqp7C-4.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGk4-RGJqfMvt7P8FUr0Q1j-Hf1BkxdXiZRPqp7C-4.woff2',
				greek:
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGk4-RGJqfMvt7P8FUr0Q1j-Hf1BkxdXiZRMap7C-4.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGk4-RGJqfMvt7P8FUr0Q1j-Hf1BkxdXiZRPap7C-4.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGk4-RGJqfMvt7P8FUr0Q1j-Hf1BkxdXiZRPKp7C-4.woff2',
				latin:
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGk4-RGJqfMvt7P8FUr0Q1j-Hf1BkxdXiZRMqp7.woff2',
			},
			'400': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGn4-RGJqfMvt7P8FUr0Q1j-Hf1BkxV-AREDYs.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGn4-RGJqfMvt7P8FUr0Q1j-Hf1BkxV8QREDYs.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGn4-RGJqfMvt7P8FUr0Q1j-Hf1BkxV-QREDYs.woff2',
				greek:
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGn4-RGJqfMvt7P8FUr0Q1j-Hf1BkxV9gREDYs.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGn4-RGJqfMvt7P8FUr0Q1j-Hf1BkxV-gREDYs.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGn4-RGJqfMvt7P8FUr0Q1j-Hf1BkxV-wREDYs.woff2',
				latin:
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGn4-RGJqfMvt7P8FUr0Q1j-Hf1BkxV9QRE.woff2',
			},
			'500': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGk4-RGJqfMvt7P8FUr0Q1j-Hf1BkxdBidRP6p7C-4.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGk4-RGJqfMvt7P8FUr0Q1j-Hf1BkxdBidRNqp7C-4.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGk4-RGJqfMvt7P8FUr0Q1j-Hf1BkxdBidRPqp7C-4.woff2',
				greek:
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGk4-RGJqfMvt7P8FUr0Q1j-Hf1BkxdBidRMap7C-4.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGk4-RGJqfMvt7P8FUr0Q1j-Hf1BkxdBidRPap7C-4.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGk4-RGJqfMvt7P8FUr0Q1j-Hf1BkxdBidRPKp7C-4.woff2',
				latin:
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGk4-RGJqfMvt7P8FUr0Q1j-Hf1BkxdBidRMqp7.woff2',
			},
			'700': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGk4-RGJqfMvt7P8FUr0Q1j-Hf1BkxdTiFRP6p7C-4.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGk4-RGJqfMvt7P8FUr0Q1j-Hf1BkxdTiFRNqp7C-4.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGk4-RGJqfMvt7P8FUr0Q1j-Hf1BkxdTiFRPqp7C-4.woff2',
				greek:
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGk4-RGJqfMvt7P8FUr0Q1j-Hf1BkxdTiFRMap7C-4.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGk4-RGJqfMvt7P8FUr0Q1j-Hf1BkxdTiFRPap7C-4.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGk4-RGJqfMvt7P8FUr0Q1j-Hf1BkxdTiFRPKp7C-4.woff2',
				latin:
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGk4-RGJqfMvt7P8FUr0Q1j-Hf1BkxdTiFRMqp7.woff2',
			},
			'800': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGk4-RGJqfMvt7P8FUr0Q1j-Hf1BkxdUiJRP6p7C-4.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGk4-RGJqfMvt7P8FUr0Q1j-Hf1BkxdUiJRNqp7C-4.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGk4-RGJqfMvt7P8FUr0Q1j-Hf1BkxdUiJRPqp7C-4.woff2',
				greek:
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGk4-RGJqfMvt7P8FUr0Q1j-Hf1BkxdUiJRMap7C-4.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGk4-RGJqfMvt7P8FUr0Q1j-Hf1BkxdUiJRPap7C-4.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGk4-RGJqfMvt7P8FUr0Q1j-Hf1BkxdUiJRPKp7C-4.woff2',
				latin:
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGk4-RGJqfMvt7P8FUr0Q1j-Hf1BkxdUiJRMqp7.woff2',
			},
			'900': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGk4-RGJqfMvt7P8FUr0Q1j-Hf1BkxddiNRP6p7C-4.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGk4-RGJqfMvt7P8FUr0Q1j-Hf1BkxddiNRNqp7C-4.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGk4-RGJqfMvt7P8FUr0Q1j-Hf1BkxddiNRPqp7C-4.woff2',
				greek:
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGk4-RGJqfMvt7P8FUr0Q1j-Hf1BkxddiNRMap7C-4.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGk4-RGJqfMvt7P8FUr0Q1j-Hf1BkxddiNRPap7C-4.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGk4-RGJqfMvt7P8FUr0Q1j-Hf1BkxddiNRPKp7C-4.woff2',
				latin:
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGk4-RGJqfMvt7P8FUr0Q1j-Hf1BkxddiNRMqp7.woff2',
			},
		},
		normal: {
			'100': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGn4-RGJqfMvt7P8FUr0Q1j-Hf1DipV-AREDYs.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGn4-RGJqfMvt7P8FUr0Q1j-Hf1DipV8QREDYs.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGn4-RGJqfMvt7P8FUr0Q1j-Hf1DipV-QREDYs.woff2',
				greek:
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGn4-RGJqfMvt7P8FUr0Q1j-Hf1DipV9gREDYs.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGn4-RGJqfMvt7P8FUr0Q1j-Hf1DipV-gREDYs.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGn4-RGJqfMvt7P8FUr0Q1j-Hf1DipV-wREDYs.woff2',
				latin:
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGn4-RGJqfMvt7P8FUr0Q1j-Hf1DipV9QRE.woff2',
			},
			'300': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGm4-RGJqfMvt7P8FUr0Q1j-Hf1DuJH4i5hMLJ_.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGm4-RGJqfMvt7P8FUr0Q1j-Hf1DuJH4idhMLJ_.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGm4-RGJqfMvt7P8FUr0Q1j-Hf1DuJH4i9hMLJ_.woff2',
				greek:
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGm4-RGJqfMvt7P8FUr0Q1j-Hf1DuJH4iBhMLJ_.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGm4-RGJqfMvt7P8FUr0Q1j-Hf1DuJH4ixhMLJ_.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGm4-RGJqfMvt7P8FUr0Q1j-Hf1DuJH4i1hMLJ_.woff2',
				latin:
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGm4-RGJqfMvt7P8FUr0Q1j-Hf1DuJH4iNhMA.woff2',
			},
			'400': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGh4-RGJqfMvt7P8FUr0Q1j-Hf1BkRl9xxA.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGh4-RGJqfMvt7P8FUr0Q1j-Hf1Bk1l9xxA.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGh4-RGJqfMvt7P8FUr0Q1j-Hf1BkVl9xxA.woff2',
				greek:
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGh4-RGJqfMvt7P8FUr0Q1j-Hf1Bkpl9xxA.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGh4-RGJqfMvt7P8FUr0Q1j-Hf1BkZl9xxA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGh4-RGJqfMvt7P8FUr0Q1j-Hf1Bkdl9xxA.woff2',
				latin:
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGh4-RGJqfMvt7P8FUr0Q1j-Hf1Bkll9w.woff2',
			},
			'500': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGm4-RGJqfMvt7P8FUr0Q1j-Hf1DrpG4i5hMLJ_.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGm4-RGJqfMvt7P8FUr0Q1j-Hf1DrpG4idhMLJ_.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGm4-RGJqfMvt7P8FUr0Q1j-Hf1DrpG4i9hMLJ_.woff2',
				greek:
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGm4-RGJqfMvt7P8FUr0Q1j-Hf1DrpG4iBhMLJ_.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGm4-RGJqfMvt7P8FUr0Q1j-Hf1DrpG4ixhMLJ_.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGm4-RGJqfMvt7P8FUr0Q1j-Hf1DrpG4i1hMLJ_.woff2',
				latin:
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGm4-RGJqfMvt7P8FUr0Q1j-Hf1DrpG4iNhMA.woff2',
			},
			'700': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGm4-RGJqfMvt7P8FUr0Q1j-Hf1DvJA4i5hMLJ_.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGm4-RGJqfMvt7P8FUr0Q1j-Hf1DvJA4idhMLJ_.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGm4-RGJqfMvt7P8FUr0Q1j-Hf1DvJA4i9hMLJ_.woff2',
				greek:
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGm4-RGJqfMvt7P8FUr0Q1j-Hf1DvJA4iBhMLJ_.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGm4-RGJqfMvt7P8FUr0Q1j-Hf1DvJA4ixhMLJ_.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGm4-RGJqfMvt7P8FUr0Q1j-Hf1DvJA4i1hMLJ_.woff2',
				latin:
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGm4-RGJqfMvt7P8FUr0Q1j-Hf1DvJA4iNhMA.woff2',
			},
			'800': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGm4-RGJqfMvt7P8FUr0Q1j-Hf1Du5D4i5hMLJ_.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGm4-RGJqfMvt7P8FUr0Q1j-Hf1Du5D4idhMLJ_.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGm4-RGJqfMvt7P8FUr0Q1j-Hf1Du5D4i9hMLJ_.woff2',
				greek:
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGm4-RGJqfMvt7P8FUr0Q1j-Hf1Du5D4iBhMLJ_.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGm4-RGJqfMvt7P8FUr0Q1j-Hf1Du5D4ixhMLJ_.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGm4-RGJqfMvt7P8FUr0Q1j-Hf1Du5D4i1hMLJ_.woff2',
				latin:
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGm4-RGJqfMvt7P8FUr0Q1j-Hf1Du5D4iNhMA.woff2',
			},
			'900': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGm4-RGJqfMvt7P8FUr0Q1j-Hf1DspC4i5hMLJ_.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGm4-RGJqfMvt7P8FUr0Q1j-Hf1DspC4idhMLJ_.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGm4-RGJqfMvt7P8FUr0Q1j-Hf1DspC4i9hMLJ_.woff2',
				greek:
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGm4-RGJqfMvt7P8FUr0Q1j-Hf1DspC4iBhMLJ_.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGm4-RGJqfMvt7P8FUr0Q1j-Hf1DspC4ixhMLJ_.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGm4-RGJqfMvt7P8FUr0Q1j-Hf1DspC4i1hMLJ_.woff2',
				latin:
					'https://fonts.gstatic.com/s/alegreyasanssc/v23/mtGm4-RGJqfMvt7P8FUr0Q1j-Hf1DspC4iNhMA.woff2',
			},
		},
	},
});

export const fontFamily = 'Alegreya Sans SC' as const;

type Variants = {
	italic: {
		weights: '100' | '300' | '400' | '500' | '700' | '800' | '900';
		subsets:
			| 'cyrillic'
			| 'cyrillic-ext'
			| 'greek'
			| 'greek-ext'
			| 'latin'
			| 'latin-ext'
			| 'vietnamese';
	};
	normal: {
		weights: '100' | '300' | '400' | '500' | '700' | '800' | '900';
		subsets:
			| 'cyrillic'
			| 'cyrillic-ext'
			| 'greek'
			| 'greek-ext'
			| 'latin'
			| 'latin-ext'
			| 'vietnamese';
	};
};

export const loadFont = <T extends keyof Variants>(
	style?: T,
	options?: {
		weights?: Variants[T]['weights'][];
		subsets?: Variants[T]['subsets'][];
		document?: Document;
	},
) => {
	return loadFonts(getInfo(), style, options);
};
