import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Playfair Display SC',
	importName: 'PlayfairDisplaySC',
	version: 'v15',
	url: 'https://fonts.googleapis.com/css2?family=Playfair+Display+SC:ital,wght@0,400;0,700;0,900;1,400;1,700;1,900',
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
			'400': {
				cyrillic:
					'https://fonts.gstatic.com/s/playfairdisplaysc/v17/ke87OhoaMkR6-hSn7kbHVoFf7ZfgMPr_lbw8FusyE4s.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/playfairdisplaysc/v17/ke87OhoaMkR6-hSn7kbHVoFf7ZfgMPr_lbw8HesyE4s.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/playfairdisplaysc/v17/ke87OhoaMkR6-hSn7kbHVoFf7ZfgMPr_lbw8HOsyE4s.woff2',
				latin:
					'https://fonts.gstatic.com/s/playfairdisplaysc/v17/ke87OhoaMkR6-hSn7kbHVoFf7ZfgMPr_lbw8Eusy.woff2',
			},
			'700': {
				cyrillic:
					'https://fonts.gstatic.com/s/playfairdisplaysc/v17/ke82OhoaMkR6-hSn7kbHVoFf7ZfgMPr_lbw0qc4nKKoQEyE.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/playfairdisplaysc/v17/ke82OhoaMkR6-hSn7kbHVoFf7ZfgMPr_lbw0qc4nI6oQEyE.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/playfairdisplaysc/v17/ke82OhoaMkR6-hSn7kbHVoFf7ZfgMPr_lbw0qc4nIqoQEyE.woff2',
				latin:
					'https://fonts.gstatic.com/s/playfairdisplaysc/v17/ke82OhoaMkR6-hSn7kbHVoFf7ZfgMPr_lbw0qc4nLKoQ.woff2',
			},
			'900': {
				cyrillic:
					'https://fonts.gstatic.com/s/playfairdisplaysc/v17/ke82OhoaMkR6-hSn7kbHVoFf7ZfgMPr_lbw0kcwnKKoQEyE.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/playfairdisplaysc/v17/ke82OhoaMkR6-hSn7kbHVoFf7ZfgMPr_lbw0kcwnI6oQEyE.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/playfairdisplaysc/v17/ke82OhoaMkR6-hSn7kbHVoFf7ZfgMPr_lbw0kcwnIqoQEyE.woff2',
				latin:
					'https://fonts.gstatic.com/s/playfairdisplaysc/v17/ke82OhoaMkR6-hSn7kbHVoFf7ZfgMPr_lbw0kcwnLKoQ.woff2',
			},
		},
		normal: {
			'400': {
				cyrillic:
					'https://fonts.gstatic.com/s/playfairdisplaysc/v17/ke85OhoaMkR6-hSn7kbHVoFf7ZfgMPr_lb0MEPM2.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/playfairdisplaysc/v17/ke85OhoaMkR6-hSn7kbHVoFf7ZfgMPr_lbYMEPM2.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/playfairdisplaysc/v17/ke85OhoaMkR6-hSn7kbHVoFf7ZfgMPr_lbcMEPM2.woff2',
				latin:
					'https://fonts.gstatic.com/s/playfairdisplaysc/v17/ke85OhoaMkR6-hSn7kbHVoFf7ZfgMPr_lbkMEA.woff2',
			},
			'700': {
				cyrillic:
					'https://fonts.gstatic.com/s/playfairdisplaysc/v17/ke80OhoaMkR6-hSn7kbHVoFf7ZfgMPr_nQIpBcgXLrIU.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/playfairdisplaysc/v17/ke80OhoaMkR6-hSn7kbHVoFf7ZfgMPr_nQIpBcMXLrIU.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/playfairdisplaysc/v17/ke80OhoaMkR6-hSn7kbHVoFf7ZfgMPr_nQIpBcIXLrIU.woff2',
				latin:
					'https://fonts.gstatic.com/s/playfairdisplaysc/v17/ke80OhoaMkR6-hSn7kbHVoFf7ZfgMPr_nQIpBcwXLg.woff2',
			},
			'900': {
				cyrillic:
					'https://fonts.gstatic.com/s/playfairdisplaysc/v17/ke80OhoaMkR6-hSn7kbHVoFf7ZfgMPr_nTorBcgXLrIU.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/playfairdisplaysc/v17/ke80OhoaMkR6-hSn7kbHVoFf7ZfgMPr_nTorBcMXLrIU.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/playfairdisplaysc/v17/ke80OhoaMkR6-hSn7kbHVoFf7ZfgMPr_nTorBcIXLrIU.woff2',
				latin:
					'https://fonts.gstatic.com/s/playfairdisplaysc/v17/ke80OhoaMkR6-hSn7kbHVoFf7ZfgMPr_nTorBcwXLg.woff2',
			},
		},
	},
});

export const fontFamily = 'Playfair Display SC' as const;

type Variants = {
	italic: {
		weights: '400' | '700' | '900';
		subsets: 'cyrillic' | 'latin' | 'latin-ext' | 'vietnamese';
	};
	normal: {
		weights: '400' | '700' | '900';
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
