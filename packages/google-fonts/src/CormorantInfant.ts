import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Cormorant Infant',
	importName: 'CormorantInfant',
	version: 'v17',
	url: 'https://fonts.googleapis.com/css2?family=Cormorant+Infant:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700',
	unicodeRanges: {
		'cyrillic-ext':
			'U+0460-052F, U+1C80-1C88, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F',
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
			'300': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/cormorantinfant/v17/HhyKU44g9vKiM1sORYSiWeAsLN997_ItcDERTI8ZBrk.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/cormorantinfant/v17/HhyKU44g9vKiM1sORYSiWeAsLN997_ItcDERRY8ZBrk.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/cormorantinfant/v17/HhyKU44g9vKiM1sORYSiWeAsLN997_ItcDERTo8ZBrk.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/cormorantinfant/v17/HhyKU44g9vKiM1sORYSiWeAsLN997_ItcDERT48ZBrk.woff2',
				latin:
					'https://fonts.gstatic.com/s/cormorantinfant/v17/HhyKU44g9vKiM1sORYSiWeAsLN997_ItcDERQY8Z.woff2',
			},
			'400': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/cormorantinfant/v17/HhyJU44g9vKiM1sORYSiWeAsLN997_Il1hMEfq4.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/cormorantinfant/v17/HhyJU44g9vKiM1sORYSiWeAsLN997_Il3xMEfq4.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/cormorantinfant/v17/HhyJU44g9vKiM1sORYSiWeAsLN997_Il1BMEfq4.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/cormorantinfant/v17/HhyJU44g9vKiM1sORYSiWeAsLN997_Il1RMEfq4.woff2',
				latin:
					'https://fonts.gstatic.com/s/cormorantinfant/v17/HhyJU44g9vKiM1sORYSiWeAsLN997_Il2xME.woff2',
			},
			'500': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/cormorantinfant/v17/HhyKU44g9vKiM1sORYSiWeAsLN997_ItKDARTI8ZBrk.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/cormorantinfant/v17/HhyKU44g9vKiM1sORYSiWeAsLN997_ItKDARRY8ZBrk.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/cormorantinfant/v17/HhyKU44g9vKiM1sORYSiWeAsLN997_ItKDARTo8ZBrk.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/cormorantinfant/v17/HhyKU44g9vKiM1sORYSiWeAsLN997_ItKDART48ZBrk.woff2',
				latin:
					'https://fonts.gstatic.com/s/cormorantinfant/v17/HhyKU44g9vKiM1sORYSiWeAsLN997_ItKDARQY8Z.woff2',
			},
			'600': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/cormorantinfant/v17/HhyKU44g9vKiM1sORYSiWeAsLN997_ItBDcRTI8ZBrk.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/cormorantinfant/v17/HhyKU44g9vKiM1sORYSiWeAsLN997_ItBDcRRY8ZBrk.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/cormorantinfant/v17/HhyKU44g9vKiM1sORYSiWeAsLN997_ItBDcRTo8ZBrk.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/cormorantinfant/v17/HhyKU44g9vKiM1sORYSiWeAsLN997_ItBDcRT48ZBrk.woff2',
				latin:
					'https://fonts.gstatic.com/s/cormorantinfant/v17/HhyKU44g9vKiM1sORYSiWeAsLN997_ItBDcRQY8Z.woff2',
			},
			'700': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/cormorantinfant/v17/HhyKU44g9vKiM1sORYSiWeAsLN997_ItYDYRTI8ZBrk.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/cormorantinfant/v17/HhyKU44g9vKiM1sORYSiWeAsLN997_ItYDYRRY8ZBrk.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/cormorantinfant/v17/HhyKU44g9vKiM1sORYSiWeAsLN997_ItYDYRTo8ZBrk.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/cormorantinfant/v17/HhyKU44g9vKiM1sORYSiWeAsLN997_ItYDYRT48ZBrk.woff2',
				latin:
					'https://fonts.gstatic.com/s/cormorantinfant/v17/HhyKU44g9vKiM1sORYSiWeAsLN997_ItYDYRQY8Z.woff2',
			},
		},
		normal: {
			'300': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/cormorantinfant/v17/HhyIU44g9vKiM1sORYSiWeAsLN9951w3zDkhQ5cd.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/cormorantinfant/v17/HhyIU44g9vKiM1sORYSiWeAsLN9951w3zDAhQ5cd.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/cormorantinfant/v17/HhyIU44g9vKiM1sORYSiWeAsLN9951w3zDshQ5cd.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/cormorantinfant/v17/HhyIU44g9vKiM1sORYSiWeAsLN9951w3zDohQ5cd.woff2',
				latin:
					'https://fonts.gstatic.com/s/cormorantinfant/v17/HhyIU44g9vKiM1sORYSiWeAsLN9951w3zDQhQw.woff2',
			},
			'400': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/cormorantinfant/v17/HhyPU44g9vKiM1sORYSiWeAsLN997_oV2QsA.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/cormorantinfant/v17/HhyPU44g9vKiM1sORYSiWeAsLN997_MV2QsA.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/cormorantinfant/v17/HhyPU44g9vKiM1sORYSiWeAsLN997_gV2QsA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/cormorantinfant/v17/HhyPU44g9vKiM1sORYSiWeAsLN997_kV2QsA.woff2',
				latin:
					'https://fonts.gstatic.com/s/cormorantinfant/v17/HhyPU44g9vKiM1sORYSiWeAsLN997_cV2Q.woff2',
			},
			'500': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/cormorantinfant/v17/HhyIU44g9vKiM1sORYSiWeAsLN995wQ2zDkhQ5cd.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/cormorantinfant/v17/HhyIU44g9vKiM1sORYSiWeAsLN995wQ2zDAhQ5cd.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/cormorantinfant/v17/HhyIU44g9vKiM1sORYSiWeAsLN995wQ2zDshQ5cd.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/cormorantinfant/v17/HhyIU44g9vKiM1sORYSiWeAsLN995wQ2zDohQ5cd.woff2',
				latin:
					'https://fonts.gstatic.com/s/cormorantinfant/v17/HhyIU44g9vKiM1sORYSiWeAsLN995wQ2zDQhQw.woff2',
			},
			'600': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/cormorantinfant/v17/HhyIU44g9vKiM1sORYSiWeAsLN995ygxzDkhQ5cd.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/cormorantinfant/v17/HhyIU44g9vKiM1sORYSiWeAsLN995ygxzDAhQ5cd.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/cormorantinfant/v17/HhyIU44g9vKiM1sORYSiWeAsLN995ygxzDshQ5cd.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/cormorantinfant/v17/HhyIU44g9vKiM1sORYSiWeAsLN995ygxzDohQ5cd.woff2',
				latin:
					'https://fonts.gstatic.com/s/cormorantinfant/v17/HhyIU44g9vKiM1sORYSiWeAsLN995ygxzDQhQw.woff2',
			},
			'700': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/cormorantinfant/v17/HhyIU44g9vKiM1sORYSiWeAsLN9950wwzDkhQ5cd.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/cormorantinfant/v17/HhyIU44g9vKiM1sORYSiWeAsLN9950wwzDAhQ5cd.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/cormorantinfant/v17/HhyIU44g9vKiM1sORYSiWeAsLN9950wwzDshQ5cd.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/cormorantinfant/v17/HhyIU44g9vKiM1sORYSiWeAsLN9950wwzDohQ5cd.woff2',
				latin:
					'https://fonts.gstatic.com/s/cormorantinfant/v17/HhyIU44g9vKiM1sORYSiWeAsLN9950wwzDQhQw.woff2',
			},
		},
	},
});

export const fontFamily = 'Cormorant Infant' as const;

type Variants = {
	italic: {
		weights: '300' | '400' | '500' | '600' | '700';
		subsets: 'cyrillic' | 'cyrillic-ext' | 'latin' | 'latin-ext' | 'vietnamese';
	};
	normal: {
		weights: '300' | '400' | '500' | '600' | '700';
		subsets: 'cyrillic' | 'cyrillic-ext' | 'latin' | 'latin-ext' | 'vietnamese';
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
