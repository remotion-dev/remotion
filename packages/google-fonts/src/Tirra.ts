import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Tirra',
	importName: 'Tirra',
	version: 'v2',
	url: 'https://fonts.googleapis.com/css2?family=Tirra:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900',
	unicodeRanges: {
		tifinagh:
			'U+02C7, U+0301-0302, U+0304, U+0306-0307, U+0309, U+0323, U+0331, U+200C-200D, U+202E, U+25CC, U+2D30-2D7F',
		'latin-ext':
			'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'400': {
				tifinagh:
					'https://fonts.gstatic.com/s/tirra/v2/WBLrrEnNakREGoPi1gDtWg.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/tirra/v2/WBLrrEnNakREGoPM1gDtWg.woff2',
				latin: 'https://fonts.gstatic.com/s/tirra/v2/WBLrrEnNakREGoPC1gA.woff2',
			},
			'500': {
				tifinagh:
					'https://fonts.gstatic.com/s/tirra/v2/WBLmrEnNakREGosx9RXye2DwLQ.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/tirra/v2/WBLmrEnNakREGosx9RXce2DwLQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/tirra/v2/WBLmrEnNakREGosx9RXSe2A.woff2',
			},
			'600': {
				tifinagh:
					'https://fonts.gstatic.com/s/tirra/v2/WBLmrEnNakREGosd8hXye2DwLQ.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/tirra/v2/WBLmrEnNakREGosd8hXce2DwLQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/tirra/v2/WBLmrEnNakREGosd8hXSe2A.woff2',
			},
			'700': {
				tifinagh:
					'https://fonts.gstatic.com/s/tirra/v2/WBLmrEnNakREGot58xXye2DwLQ.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/tirra/v2/WBLmrEnNakREGot58xXce2DwLQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/tirra/v2/WBLmrEnNakREGot58xXSe2A.woff2',
			},
			'800': {
				tifinagh:
					'https://fonts.gstatic.com/s/tirra/v2/WBLmrEnNakREGotl8BXye2DwLQ.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/tirra/v2/WBLmrEnNakREGotl8BXce2DwLQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/tirra/v2/WBLmrEnNakREGotl8BXSe2A.woff2',
			},
			'900': {
				tifinagh:
					'https://fonts.gstatic.com/s/tirra/v2/WBLmrEnNakREGotB8RXye2DwLQ.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/tirra/v2/WBLmrEnNakREGotB8RXce2DwLQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/tirra/v2/WBLmrEnNakREGotB8RXSe2A.woff2',
			},
		},
	},
	subsets: ['latin', 'latin-ext', 'tifinagh'],
});

export const fontFamily = 'Tirra' as const;

type Variants = {
	normal: {
		weights: '400' | '500' | '600' | '700' | '800' | '900';
		subsets: 'latin' | 'latin-ext' | 'tifinagh';
	};
};

export const loadFont = <T extends keyof Variants>(
	style?: T,
	options?: {
		weights?: Variants[T]['weights'][];
		subsets?: Variants[T]['subsets'][];
		document?: Document;
		ignoreTooManyRequestsWarning?: boolean;
	},
) => {
	return loadFonts(getInfo(), style, options);
};
