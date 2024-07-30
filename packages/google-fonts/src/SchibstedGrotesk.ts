import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Schibsted Grotesk',
	importName: 'SchibstedGrotesk',
	version: 'v3',
	url: 'https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500;1,600;1,700;1,800;1,900',
	unicodeRanges: {
		'latin-ext':
			'U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		italic: {
			'400': {
				'latin-ext':
					'https://fonts.gstatic.com/s/schibstedgrotesk/v3/Jqz_5SSPQuCQF3t8uOwiUL-taUTtap9DWyYpchFP.woff2',
				latin:
					'https://fonts.gstatic.com/s/schibstedgrotesk/v3/Jqz_5SSPQuCQF3t8uOwiUL-taUTtap9DWygpcg.woff2',
			},
			'500': {
				'latin-ext':
					'https://fonts.gstatic.com/s/schibstedgrotesk/v3/Jqz_5SSPQuCQF3t8uOwiUL-taUTtap9DWyYpchFP.woff2',
				latin:
					'https://fonts.gstatic.com/s/schibstedgrotesk/v3/Jqz_5SSPQuCQF3t8uOwiUL-taUTtap9DWygpcg.woff2',
			},
			'600': {
				'latin-ext':
					'https://fonts.gstatic.com/s/schibstedgrotesk/v3/Jqz_5SSPQuCQF3t8uOwiUL-taUTtap9DWyYpchFP.woff2',
				latin:
					'https://fonts.gstatic.com/s/schibstedgrotesk/v3/Jqz_5SSPQuCQF3t8uOwiUL-taUTtap9DWygpcg.woff2',
			},
			'700': {
				'latin-ext':
					'https://fonts.gstatic.com/s/schibstedgrotesk/v3/Jqz_5SSPQuCQF3t8uOwiUL-taUTtap9DWyYpchFP.woff2',
				latin:
					'https://fonts.gstatic.com/s/schibstedgrotesk/v3/Jqz_5SSPQuCQF3t8uOwiUL-taUTtap9DWygpcg.woff2',
			},
			'800': {
				'latin-ext':
					'https://fonts.gstatic.com/s/schibstedgrotesk/v3/Jqz_5SSPQuCQF3t8uOwiUL-taUTtap9DWyYpchFP.woff2',
				latin:
					'https://fonts.gstatic.com/s/schibstedgrotesk/v3/Jqz_5SSPQuCQF3t8uOwiUL-taUTtap9DWygpcg.woff2',
			},
			'900': {
				'latin-ext':
					'https://fonts.gstatic.com/s/schibstedgrotesk/v3/Jqz_5SSPQuCQF3t8uOwiUL-taUTtap9DWyYpchFP.woff2',
				latin:
					'https://fonts.gstatic.com/s/schibstedgrotesk/v3/Jqz_5SSPQuCQF3t8uOwiUL-taUTtap9DWygpcg.woff2',
			},
		},
		normal: {
			'400': {
				'latin-ext':
					'https://fonts.gstatic.com/s/schibstedgrotesk/v3/Jqz55SSPQuCQF3t8uOwiUL-taUTtap9Iayoxdg.woff2',
				latin:
					'https://fonts.gstatic.com/s/schibstedgrotesk/v3/Jqz55SSPQuCQF3t8uOwiUL-taUTtap9Gayo.woff2',
			},
			'500': {
				'latin-ext':
					'https://fonts.gstatic.com/s/schibstedgrotesk/v3/Jqz55SSPQuCQF3t8uOwiUL-taUTtap9Iayoxdg.woff2',
				latin:
					'https://fonts.gstatic.com/s/schibstedgrotesk/v3/Jqz55SSPQuCQF3t8uOwiUL-taUTtap9Gayo.woff2',
			},
			'600': {
				'latin-ext':
					'https://fonts.gstatic.com/s/schibstedgrotesk/v3/Jqz55SSPQuCQF3t8uOwiUL-taUTtap9Iayoxdg.woff2',
				latin:
					'https://fonts.gstatic.com/s/schibstedgrotesk/v3/Jqz55SSPQuCQF3t8uOwiUL-taUTtap9Gayo.woff2',
			},
			'700': {
				'latin-ext':
					'https://fonts.gstatic.com/s/schibstedgrotesk/v3/Jqz55SSPQuCQF3t8uOwiUL-taUTtap9Iayoxdg.woff2',
				latin:
					'https://fonts.gstatic.com/s/schibstedgrotesk/v3/Jqz55SSPQuCQF3t8uOwiUL-taUTtap9Gayo.woff2',
			},
			'800': {
				'latin-ext':
					'https://fonts.gstatic.com/s/schibstedgrotesk/v3/Jqz55SSPQuCQF3t8uOwiUL-taUTtap9Iayoxdg.woff2',
				latin:
					'https://fonts.gstatic.com/s/schibstedgrotesk/v3/Jqz55SSPQuCQF3t8uOwiUL-taUTtap9Gayo.woff2',
			},
			'900': {
				'latin-ext':
					'https://fonts.gstatic.com/s/schibstedgrotesk/v3/Jqz55SSPQuCQF3t8uOwiUL-taUTtap9Iayoxdg.woff2',
				latin:
					'https://fonts.gstatic.com/s/schibstedgrotesk/v3/Jqz55SSPQuCQF3t8uOwiUL-taUTtap9Gayo.woff2',
			},
		},
	},
});

export const fontFamily = 'Schibsted Grotesk' as const;

type Variants = {
	italic: {
		weights: '400' | '500' | '600' | '700' | '800' | '900';
		subsets: 'latin' | 'latin-ext';
	};
	normal: {
		weights: '400' | '500' | '600' | '700' | '800' | '900';
		subsets: 'latin' | 'latin-ext';
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
