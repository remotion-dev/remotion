import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Cardo',
	importName: 'Cardo',
	version: 'v21',
	url: 'https://fonts.googleapis.com/css2?family=Cardo:ital,wght@0,400;0,700;1,400',
	unicodeRanges: {
		gothic: 'U+0304-0305, U+0308, U+0331, U+10330-1034A',
		'greek-ext': 'U+1F00-1FFF',
		greek:
			'U+0370-0377, U+037A-037F, U+0384-038A, U+038C, U+038E-03A1, U+03A3-03FF',
		hebrew:
			'U+0307-0308, U+0590-05FF, U+200C-2010, U+20AA, U+25CC, U+FB1D-FB4F',
		'old-italic': 'U+10300-1032F',
		runic: 'U+16A0-16F8',
		'latin-ext':
			'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		italic: {
			'400': {
				gothic:
					'https://fonts.gstatic.com/s/cardo/v21/wlpxgwjKBV1pqhv97LQx3F5O.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/cardo/v21/wlpxgwjKBV1pqhv97I8x3F5O.woff2',
				greek:
					'https://fonts.gstatic.com/s/cardo/v21/wlpxgwjKBV1pqhv97IAx3F5O.woff2',
				hebrew:
					'https://fonts.gstatic.com/s/cardo/v21/wlpxgwjKBV1pqhv97IEx3F5O.woff2',
				'old-italic':
					'https://fonts.gstatic.com/s/cardo/v21/wlpxgwjKBV1pqhv97MEx3F5O.woff2',
				runic:
					'https://fonts.gstatic.com/s/cardo/v21/wlpxgwjKBV1pqhv97Lcx3F5O.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/cardo/v21/wlpxgwjKBV1pqhv97I0x3F5O.woff2',
				latin:
					'https://fonts.gstatic.com/s/cardo/v21/wlpxgwjKBV1pqhv97IMx3A.woff2',
			},
		},
		normal: {
			'400': {
				gothic:
					'https://fonts.gstatic.com/s/cardo/v21/wlp_gwjKBV1pqhvP3IEp2A.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/cardo/v21/wlp_gwjKBV1pqhv03IEp2A.woff2',
				greek:
					'https://fonts.gstatic.com/s/cardo/v21/wlp_gwjKBV1pqhv73IEp2A.woff2',
				hebrew:
					'https://fonts.gstatic.com/s/cardo/v21/wlp_gwjKBV1pqhv63IEp2A.woff2',
				'old-italic':
					'https://fonts.gstatic.com/s/cardo/v21/wlp_gwjKBV1pqhu63IEp2A.woff2',
				runic:
					'https://fonts.gstatic.com/s/cardo/v21/wlp_gwjKBV1pqhvM3IEp2A.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/cardo/v21/wlp_gwjKBV1pqhv23IEp2A.woff2',
				latin:
					'https://fonts.gstatic.com/s/cardo/v21/wlp_gwjKBV1pqhv43IE.woff2',
			},
			'700': {
				gothic:
					'https://fonts.gstatic.com/s/cardo/v21/wlpygwjKBV1pqhND-ZQh-WN3aQ.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/cardo/v21/wlpygwjKBV1pqhND-ZQa-WN3aQ.woff2',
				greek:
					'https://fonts.gstatic.com/s/cardo/v21/wlpygwjKBV1pqhND-ZQV-WN3aQ.woff2',
				hebrew:
					'https://fonts.gstatic.com/s/cardo/v21/wlpygwjKBV1pqhND-ZQU-WN3aQ.woff2',
				'old-italic':
					'https://fonts.gstatic.com/s/cardo/v21/wlpygwjKBV1pqhND-ZRU-WN3aQ.woff2',
				runic:
					'https://fonts.gstatic.com/s/cardo/v21/wlpygwjKBV1pqhND-ZQi-WN3aQ.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/cardo/v21/wlpygwjKBV1pqhND-ZQY-WN3aQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/cardo/v21/wlpygwjKBV1pqhND-ZQW-WM.woff2',
			},
		},
	},
	subsets: [
		'gothic',
		'greek',
		'greek-ext',
		'hebrew',
		'latin',
		'latin-ext',
		'old-italic',
		'runic',
	],
});

export const fontFamily = 'Cardo' as const;

type Variants = {
	italic: {
		weights: '400';
		subsets:
			| 'gothic'
			| 'greek'
			| 'greek-ext'
			| 'hebrew'
			| 'latin'
			| 'latin-ext'
			| 'old-italic'
			| 'runic';
	};
	normal: {
		weights: '400' | '700';
		subsets:
			| 'gothic'
			| 'greek'
			| 'greek-ext'
			| 'hebrew'
			| 'latin'
			| 'latin-ext'
			| 'old-italic'
			| 'runic';
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
