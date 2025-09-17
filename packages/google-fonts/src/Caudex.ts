import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Caudex',
	importName: 'Caudex',
	version: 'v19',
	url: 'https://fonts.googleapis.com/css2?family=Caudex:ital,wght@0,400;0,700;1,400;1,700',
	unicodeRanges: {
		'greek-ext': 'U+1F00-1FFF',
		greek:
			'U+0370-0377, U+037A-037F, U+0384-038A, U+038C, U+038E-03A1, U+03A3-03FF',
		runic: 'U+16A0-16F8',
		vietnamese:
			'U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB',
		'latin-ext':
			'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		italic: {
			'400': {
				'greek-ext':
					'https://fonts.gstatic.com/s/caudex/v19/esDS311QOP6BJUr4yMKPtbo-Ew.woff2',
				greek:
					'https://fonts.gstatic.com/s/caudex/v19/esDS311QOP6BJUr4yMKAtbo-Ew.woff2',
				runic:
					'https://fonts.gstatic.com/s/caudex/v19/esDS311QOP6BJUr4yMK3tbo-Ew.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/caudex/v19/esDS311QOP6BJUr4yMKMtbo-Ew.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/caudex/v19/esDS311QOP6BJUr4yMKNtbo-Ew.woff2',
				latin:
					'https://fonts.gstatic.com/s/caudex/v19/esDS311QOP6BJUr4yMKDtbo.woff2',
			},
			'700': {
				'greek-ext':
					'https://fonts.gstatic.com/s/caudex/v19/esDV311QOP6BJUr4yMo4kK8NMpWeGQ.woff2',
				greek:
					'https://fonts.gstatic.com/s/caudex/v19/esDV311QOP6BJUr4yMo4kK8CMpWeGQ.woff2',
				runic:
					'https://fonts.gstatic.com/s/caudex/v19/esDV311QOP6BJUr4yMo4kK81MpWeGQ.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/caudex/v19/esDV311QOP6BJUr4yMo4kK8OMpWeGQ.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/caudex/v19/esDV311QOP6BJUr4yMo4kK8PMpWeGQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/caudex/v19/esDV311QOP6BJUr4yMo4kK8BMpU.woff2',
			},
		},
		normal: {
			'400': {
				'greek-ext':
					'https://fonts.gstatic.com/s/caudex/v19/esDQ311QOP6BJUr4wfKBrb4.woff2',
				greek:
					'https://fonts.gstatic.com/s/caudex/v19/esDQ311QOP6BJUr4zvKBrb4.woff2',
				runic:
					'https://fonts.gstatic.com/s/caudex/v19/esDQ311QOP6BJUr4-fKBrb4.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/caudex/v19/esDQ311QOP6BJUr4wvKBrb4.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/caudex/v19/esDQ311QOP6BJUr4w_KBrb4.woff2',
				latin:
					'https://fonts.gstatic.com/s/caudex/v19/esDQ311QOP6BJUr4zfKB.woff2',
			},
			'700': {
				'greek-ext':
					'https://fonts.gstatic.com/s/caudex/v19/esDT311QOP6BJUrwdteUnp8DKpE.woff2',
				greek:
					'https://fonts.gstatic.com/s/caudex/v19/esDT311QOP6BJUrwdteUkZ8DKpE.woff2',
				runic:
					'https://fonts.gstatic.com/s/caudex/v19/esDT311QOP6BJUrwdteUpp8DKpE.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/caudex/v19/esDT311QOP6BJUrwdteUnZ8DKpE.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/caudex/v19/esDT311QOP6BJUrwdteUnJ8DKpE.woff2',
				latin:
					'https://fonts.gstatic.com/s/caudex/v19/esDT311QOP6BJUrwdteUkp8D.woff2',
			},
		},
	},
	subsets: ['greek', 'greek-ext', 'latin', 'latin-ext', 'runic', 'vietnamese'],
});

export const fontFamily = 'Caudex' as const;

type Variants = {
	italic: {
		weights: '400' | '700';
		subsets:
			| 'greek'
			| 'greek-ext'
			| 'latin'
			| 'latin-ext'
			| 'runic'
			| 'vietnamese';
	};
	normal: {
		weights: '400' | '700';
		subsets:
			| 'greek'
			| 'greek-ext'
			| 'latin'
			| 'latin-ext'
			| 'runic'
			| 'vietnamese';
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
