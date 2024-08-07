import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Spectral SC',
	importName: 'SpectralSC',
	version: 'v12',
	url: 'https://fonts.googleapis.com/css2?family=Spectral+SC:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;0,800;1,200;1,300;1,400;1,500;1,600;1,700;1,800',
	unicodeRanges: {
		cyrillic: 'U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116',
		vietnamese:
			'U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB',
		'latin-ext':
			'U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		italic: {
			'200': {
				cyrillic:
					'https://fonts.gstatic.com/s/spectralsc/v12/Ktk2ALCRZonmalTgyPmRfsWg26zWB4C9WLZB.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/spectralsc/v12/Ktk2ALCRZonmalTgyPmRfsWg26zWB4u9WLZB.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/spectralsc/v12/Ktk2ALCRZonmalTgyPmRfsWg26zWB4q9WLZB.woff2',
				latin:
					'https://fonts.gstatic.com/s/spectralsc/v12/Ktk2ALCRZonmalTgyPmRfsWg26zWB4S9WA.woff2',
			},
			'300': {
				cyrillic:
					'https://fonts.gstatic.com/s/spectralsc/v12/Ktk2ALCRZonmalTgyPmRfsWg28jVB4C9WLZB.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/spectralsc/v12/Ktk2ALCRZonmalTgyPmRfsWg28jVB4u9WLZB.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/spectralsc/v12/Ktk2ALCRZonmalTgyPmRfsWg28jVB4q9WLZB.woff2',
				latin:
					'https://fonts.gstatic.com/s/spectralsc/v12/Ktk2ALCRZonmalTgyPmRfsWg28jVB4S9WA.woff2',
			},
			'400': {
				cyrillic:
					'https://fonts.gstatic.com/s/spectralsc/v12/KtkrALCRZonmalTgyPmRfsWg02f3Eruc.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/spectralsc/v12/KtkrALCRZonmalTgyPmRfsWg02z3Eruc.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/spectralsc/v12/KtkrALCRZonmalTgyPmRfsWg0233Eruc.woff2',
				latin:
					'https://fonts.gstatic.com/s/spectralsc/v12/KtkrALCRZonmalTgyPmRfsWg02P3Eg.woff2',
			},
			'500': {
				cyrillic:
					'https://fonts.gstatic.com/s/spectralsc/v12/Ktk2ALCRZonmalTgyPmRfsWg25DUB4C9WLZB.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/spectralsc/v12/Ktk2ALCRZonmalTgyPmRfsWg25DUB4u9WLZB.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/spectralsc/v12/Ktk2ALCRZonmalTgyPmRfsWg25DUB4q9WLZB.woff2',
				latin:
					'https://fonts.gstatic.com/s/spectralsc/v12/Ktk2ALCRZonmalTgyPmRfsWg25DUB4S9WA.woff2',
			},
			'600': {
				cyrillic:
					'https://fonts.gstatic.com/s/spectralsc/v12/Ktk2ALCRZonmalTgyPmRfsWg27zTB4C9WLZB.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/spectralsc/v12/Ktk2ALCRZonmalTgyPmRfsWg27zTB4u9WLZB.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/spectralsc/v12/Ktk2ALCRZonmalTgyPmRfsWg27zTB4q9WLZB.woff2',
				latin:
					'https://fonts.gstatic.com/s/spectralsc/v12/Ktk2ALCRZonmalTgyPmRfsWg27zTB4S9WA.woff2',
			},
			'700': {
				cyrillic:
					'https://fonts.gstatic.com/s/spectralsc/v12/Ktk2ALCRZonmalTgyPmRfsWg29jSB4C9WLZB.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/spectralsc/v12/Ktk2ALCRZonmalTgyPmRfsWg29jSB4u9WLZB.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/spectralsc/v12/Ktk2ALCRZonmalTgyPmRfsWg29jSB4q9WLZB.woff2',
				latin:
					'https://fonts.gstatic.com/s/spectralsc/v12/Ktk2ALCRZonmalTgyPmRfsWg29jSB4S9WA.woff2',
			},
			'800': {
				cyrillic:
					'https://fonts.gstatic.com/s/spectralsc/v12/Ktk2ALCRZonmalTgyPmRfsWg28TRB4C9WLZB.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/spectralsc/v12/Ktk2ALCRZonmalTgyPmRfsWg28TRB4u9WLZB.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/spectralsc/v12/Ktk2ALCRZonmalTgyPmRfsWg28TRB4q9WLZB.woff2',
				latin:
					'https://fonts.gstatic.com/s/spectralsc/v12/Ktk2ALCRZonmalTgyPmRfsWg28TRB4S9WA.woff2',
			},
		},
		normal: {
			'200': {
				cyrillic:
					'https://fonts.gstatic.com/s/spectralsc/v12/Ktk0ALCRZonmalTgyPmRfs1qwnTUN4alXA.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/spectralsc/v12/Ktk0ALCRZonmalTgyPmRfs1qwnTfN4alXA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/spectralsc/v12/Ktk0ALCRZonmalTgyPmRfs1qwnTeN4alXA.woff2',
				latin:
					'https://fonts.gstatic.com/s/spectralsc/v12/Ktk0ALCRZonmalTgyPmRfs1qwnTQN4Y.woff2',
			},
			'300': {
				cyrillic:
					'https://fonts.gstatic.com/s/spectralsc/v12/Ktk0ALCRZonmalTgyPmRfs0OwXTUN4alXA.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/spectralsc/v12/Ktk0ALCRZonmalTgyPmRfs0OwXTfN4alXA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/spectralsc/v12/Ktk0ALCRZonmalTgyPmRfs0OwXTeN4alXA.woff2',
				latin:
					'https://fonts.gstatic.com/s/spectralsc/v12/Ktk0ALCRZonmalTgyPmRfs0OwXTQN4Y.woff2',
			},
			'400': {
				cyrillic:
					'https://fonts.gstatic.com/s/spectralsc/v12/KtkpALCRZonmalTgyPmRfsWh42HvFg.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/spectralsc/v12/KtkpALCRZonmalTgyPmRfsWq42HvFg.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/spectralsc/v12/KtkpALCRZonmalTgyPmRfsWr42HvFg.woff2',
				latin:
					'https://fonts.gstatic.com/s/spectralsc/v12/KtkpALCRZonmalTgyPmRfsWl42E.woff2',
			},
			'500': {
				cyrillic:
					'https://fonts.gstatic.com/s/spectralsc/v12/Ktk0ALCRZonmalTgyPmRfs1WwHTUN4alXA.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/spectralsc/v12/Ktk0ALCRZonmalTgyPmRfs1WwHTfN4alXA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/spectralsc/v12/Ktk0ALCRZonmalTgyPmRfs1WwHTeN4alXA.woff2',
				latin:
					'https://fonts.gstatic.com/s/spectralsc/v12/Ktk0ALCRZonmalTgyPmRfs1WwHTQN4Y.woff2',
			},
			'600': {
				cyrillic:
					'https://fonts.gstatic.com/s/spectralsc/v12/Ktk0ALCRZonmalTgyPmRfs16x3TUN4alXA.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/spectralsc/v12/Ktk0ALCRZonmalTgyPmRfs16x3TfN4alXA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/spectralsc/v12/Ktk0ALCRZonmalTgyPmRfs16x3TeN4alXA.woff2',
				latin:
					'https://fonts.gstatic.com/s/spectralsc/v12/Ktk0ALCRZonmalTgyPmRfs16x3TQN4Y.woff2',
			},
			'700': {
				cyrillic:
					'https://fonts.gstatic.com/s/spectralsc/v12/Ktk0ALCRZonmalTgyPmRfs0exnTUN4alXA.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/spectralsc/v12/Ktk0ALCRZonmalTgyPmRfs0exnTfN4alXA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/spectralsc/v12/Ktk0ALCRZonmalTgyPmRfs0exnTeN4alXA.woff2',
				latin:
					'https://fonts.gstatic.com/s/spectralsc/v12/Ktk0ALCRZonmalTgyPmRfs0exnTQN4Y.woff2',
			},
			'800': {
				cyrillic:
					'https://fonts.gstatic.com/s/spectralsc/v12/Ktk0ALCRZonmalTgyPmRfs0CxXTUN4alXA.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/spectralsc/v12/Ktk0ALCRZonmalTgyPmRfs0CxXTfN4alXA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/spectralsc/v12/Ktk0ALCRZonmalTgyPmRfs0CxXTeN4alXA.woff2',
				latin:
					'https://fonts.gstatic.com/s/spectralsc/v12/Ktk0ALCRZonmalTgyPmRfs0CxXTQN4Y.woff2',
			},
		},
	},
});

export const fontFamily = 'Spectral SC' as const;

type Variants = {
	italic: {
		weights: '200' | '300' | '400' | '500' | '600' | '700' | '800';
		subsets: 'cyrillic' | 'latin' | 'latin-ext' | 'vietnamese';
	};
	normal: {
		weights: '200' | '300' | '400' | '500' | '600' | '700' | '800';
		subsets: 'cyrillic' | 'latin' | 'latin-ext' | 'vietnamese';
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
