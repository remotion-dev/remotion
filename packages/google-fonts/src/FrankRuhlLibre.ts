import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Frank Ruhl Libre',
	importName: 'FrankRuhlLibre',
	version: 'v23',
	url: 'https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900',
	unicodeRanges: {
		hebrew:
			'U+0307-0308, U+0590-05FF, U+200C-2010, U+20AA, U+25CC, U+FB1D-FB4F',
		'latin-ext':
			'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'300': {
				hebrew:
					'https://fonts.gstatic.com/s/frankruhllibre/v23/j8_w6_fAw7jrcalD7oKYNX0QfAnPW7Ll4ajn.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/frankruhllibre/v23/j8_w6_fAw7jrcalD7oKYNX0QfAnPW77l4ajn.woff2',
				latin:
					'https://fonts.gstatic.com/s/frankruhllibre/v23/j8_w6_fAw7jrcalD7oKYNX0QfAnPW7Dl4Q.woff2',
			},
			'400': {
				hebrew:
					'https://fonts.gstatic.com/s/frankruhllibre/v23/j8_w6_fAw7jrcalD7oKYNX0QfAnPW7Ll4ajn.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/frankruhllibre/v23/j8_w6_fAw7jrcalD7oKYNX0QfAnPW77l4ajn.woff2',
				latin:
					'https://fonts.gstatic.com/s/frankruhllibre/v23/j8_w6_fAw7jrcalD7oKYNX0QfAnPW7Dl4Q.woff2',
			},
			'500': {
				hebrew:
					'https://fonts.gstatic.com/s/frankruhllibre/v23/j8_w6_fAw7jrcalD7oKYNX0QfAnPW7Ll4ajn.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/frankruhllibre/v23/j8_w6_fAw7jrcalD7oKYNX0QfAnPW77l4ajn.woff2',
				latin:
					'https://fonts.gstatic.com/s/frankruhllibre/v23/j8_w6_fAw7jrcalD7oKYNX0QfAnPW7Dl4Q.woff2',
			},
			'600': {
				hebrew:
					'https://fonts.gstatic.com/s/frankruhllibre/v23/j8_w6_fAw7jrcalD7oKYNX0QfAnPW7Ll4ajn.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/frankruhllibre/v23/j8_w6_fAw7jrcalD7oKYNX0QfAnPW77l4ajn.woff2',
				latin:
					'https://fonts.gstatic.com/s/frankruhllibre/v23/j8_w6_fAw7jrcalD7oKYNX0QfAnPW7Dl4Q.woff2',
			},
			'700': {
				hebrew:
					'https://fonts.gstatic.com/s/frankruhllibre/v23/j8_w6_fAw7jrcalD7oKYNX0QfAnPW7Ll4ajn.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/frankruhllibre/v23/j8_w6_fAw7jrcalD7oKYNX0QfAnPW77l4ajn.woff2',
				latin:
					'https://fonts.gstatic.com/s/frankruhllibre/v23/j8_w6_fAw7jrcalD7oKYNX0QfAnPW7Dl4Q.woff2',
			},
			'800': {
				hebrew:
					'https://fonts.gstatic.com/s/frankruhllibre/v23/j8_w6_fAw7jrcalD7oKYNX0QfAnPW7Ll4ajn.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/frankruhllibre/v23/j8_w6_fAw7jrcalD7oKYNX0QfAnPW77l4ajn.woff2',
				latin:
					'https://fonts.gstatic.com/s/frankruhllibre/v23/j8_w6_fAw7jrcalD7oKYNX0QfAnPW7Dl4Q.woff2',
			},
			'900': {
				hebrew:
					'https://fonts.gstatic.com/s/frankruhllibre/v23/j8_w6_fAw7jrcalD7oKYNX0QfAnPW7Ll4ajn.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/frankruhllibre/v23/j8_w6_fAw7jrcalD7oKYNX0QfAnPW77l4ajn.woff2',
				latin:
					'https://fonts.gstatic.com/s/frankruhllibre/v23/j8_w6_fAw7jrcalD7oKYNX0QfAnPW7Dl4Q.woff2',
			},
		},
	},
	subsets: ['hebrew', 'latin', 'latin-ext'],
});

export const fontFamily = 'Frank Ruhl Libre' as const;

type Variants = {
	normal: {
		weights: '300' | '400' | '500' | '600' | '700' | '800' | '900';
		subsets: 'hebrew' | 'latin' | 'latin-ext';
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
