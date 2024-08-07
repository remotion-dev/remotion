import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Abhaya Libre',
	importName: 'AbhayaLibre',
	version: 'v14',
	url: 'https://fonts.googleapis.com/css2?family=Abhaya+Libre:ital,wght@0,400;0,500;0,600;0,700;0,800',
	unicodeRanges: {
		sinhala:
			'U+0964-0965, U+0D81-0DF4, U+1CF2, U+200C-200D, U+25CC, U+111E1-111F4',
		'latin-ext':
			'U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'400': {
				sinhala:
					'https://fonts.gstatic.com/s/abhayalibre/v17/e3tmeuGtX-Co5MNzeAOqinEQYUnXkvc.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/abhayalibre/v17/e3tmeuGtX-Co5MNzeAOqinEQcknXkvc.woff2',
				latin:
					'https://fonts.gstatic.com/s/abhayalibre/v17/e3tmeuGtX-Co5MNzeAOqinEQfEnX.woff2',
			},
			'500': {
				sinhala:
					'https://fonts.gstatic.com/s/abhayalibre/v17/e3t5euGtX-Co5MNzeAOqinEYj2rCsNZJ2oY.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/abhayalibre/v17/e3t5euGtX-Co5MNzeAOqinEYj2rCo9ZJ2oY.woff2',
				latin:
					'https://fonts.gstatic.com/s/abhayalibre/v17/e3t5euGtX-Co5MNzeAOqinEYj2rCrdZJ.woff2',
			},
			'600': {
				sinhala:
					'https://fonts.gstatic.com/s/abhayalibre/v17/e3t5euGtX-Co5MNzeAOqinEYo23CsNZJ2oY.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/abhayalibre/v17/e3t5euGtX-Co5MNzeAOqinEYo23Co9ZJ2oY.woff2',
				latin:
					'https://fonts.gstatic.com/s/abhayalibre/v17/e3t5euGtX-Co5MNzeAOqinEYo23CrdZJ.woff2',
			},
			'700': {
				sinhala:
					'https://fonts.gstatic.com/s/abhayalibre/v17/e3t5euGtX-Co5MNzeAOqinEYx2zCsNZJ2oY.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/abhayalibre/v17/e3t5euGtX-Co5MNzeAOqinEYx2zCo9ZJ2oY.woff2',
				latin:
					'https://fonts.gstatic.com/s/abhayalibre/v17/e3t5euGtX-Co5MNzeAOqinEYx2zCrdZJ.woff2',
			},
			'800': {
				sinhala:
					'https://fonts.gstatic.com/s/abhayalibre/v17/e3t5euGtX-Co5MNzeAOqinEY22_CsNZJ2oY.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/abhayalibre/v17/e3t5euGtX-Co5MNzeAOqinEY22_Co9ZJ2oY.woff2',
				latin:
					'https://fonts.gstatic.com/s/abhayalibre/v17/e3t5euGtX-Co5MNzeAOqinEY22_CrdZJ.woff2',
			},
		},
	},
});

export const fontFamily = 'Abhaya Libre' as const;

type Variants = {
	normal: {
		weights: '400' | '500' | '600' | '700' | '800';
		subsets: 'latin' | 'latin-ext' | 'sinhala';
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
