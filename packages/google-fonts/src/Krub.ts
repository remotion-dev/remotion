import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Krub',
	importName: 'Krub',
	version: 'v9',
	url: 'https://fonts.googleapis.com/css2?family=Krub:ital,wght@0,200;0,300;0,400;0,500;0,600;0,700;1,200;1,300;1,400;1,500;1,600;1,700',
	unicodeRanges: {
		thai: 'U+0E01-0E5B, U+200C-200D, U+25CC',
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
				thai: 'https://fonts.gstatic.com/s/krub/v9/sZlGdRyC6CRYbkQiwLBCUIASSf8.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/krub/v9/sZlGdRyC6CRYbkQiwLBCS4ASSf8.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/krub/v9/sZlGdRyC6CRYbkQiwLBCSoASSf8.woff2',
				latin:
					'https://fonts.gstatic.com/s/krub/v9/sZlGdRyC6CRYbkQiwLBCRIAS.woff2',
			},
			'300': {
				thai: 'https://fonts.gstatic.com/s/krub/v9/sZlGdRyC6CRYbkQipLNCUIASSf8.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/krub/v9/sZlGdRyC6CRYbkQipLNCS4ASSf8.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/krub/v9/sZlGdRyC6CRYbkQipLNCSoASSf8.woff2',
				latin:
					'https://fonts.gstatic.com/s/krub/v9/sZlGdRyC6CRYbkQipLNCRIAS.woff2',
			},
			'400': {
				thai: 'https://fonts.gstatic.com/s/krub/v9/sZlFdRyC6CRYbkQqG5FXe6E.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/krub/v9/sZlFdRyC6CRYbkQqAJFXe6E.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/krub/v9/sZlFdRyC6CRYbkQqAZFXe6E.woff2',
				latin: 'https://fonts.gstatic.com/s/krub/v9/sZlFdRyC6CRYbkQqD5FX.woff2',
			},
			'500': {
				thai: 'https://fonts.gstatic.com/s/krub/v9/sZlGdRyC6CRYbkQi_LJCUIASSf8.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/krub/v9/sZlGdRyC6CRYbkQi_LJCS4ASSf8.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/krub/v9/sZlGdRyC6CRYbkQi_LJCSoASSf8.woff2',
				latin:
					'https://fonts.gstatic.com/s/krub/v9/sZlGdRyC6CRYbkQi_LJCRIAS.woff2',
			},
			'600': {
				thai: 'https://fonts.gstatic.com/s/krub/v9/sZlGdRyC6CRYbkQi0LVCUIASSf8.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/krub/v9/sZlGdRyC6CRYbkQi0LVCS4ASSf8.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/krub/v9/sZlGdRyC6CRYbkQi0LVCSoASSf8.woff2',
				latin:
					'https://fonts.gstatic.com/s/krub/v9/sZlGdRyC6CRYbkQi0LVCRIAS.woff2',
			},
			'700': {
				thai: 'https://fonts.gstatic.com/s/krub/v9/sZlGdRyC6CRYbkQitLRCUIASSf8.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/krub/v9/sZlGdRyC6CRYbkQitLRCS4ASSf8.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/krub/v9/sZlGdRyC6CRYbkQitLRCSoASSf8.woff2',
				latin:
					'https://fonts.gstatic.com/s/krub/v9/sZlGdRyC6CRYbkQitLRCRIAS.woff2',
			},
		},
		normal: {
			'200': {
				thai: 'https://fonts.gstatic.com/s/krub/v9/sZlEdRyC6CRYZo47GKJyRpgW.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/krub/v9/sZlEdRyC6CRYZo47GLlyRpgW.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/krub/v9/sZlEdRyC6CRYZo47GLhyRpgW.woff2',
				latin:
					'https://fonts.gstatic.com/s/krub/v9/sZlEdRyC6CRYZo47GLZyRg.woff2',
			},
			'300': {
				thai: 'https://fonts.gstatic.com/s/krub/v9/sZlEdRyC6CRYZuo4GKJyRpgW.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/krub/v9/sZlEdRyC6CRYZuo4GLlyRpgW.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/krub/v9/sZlEdRyC6CRYZuo4GLhyRpgW.woff2',
				latin:
					'https://fonts.gstatic.com/s/krub/v9/sZlEdRyC6CRYZuo4GLZyRg.woff2',
			},
			'400': {
				thai: 'https://fonts.gstatic.com/s/krub/v9/sZlLdRyC6CRYblUaDYlT.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/krub/v9/sZlLdRyC6CRYbk4aDYlT.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/krub/v9/sZlLdRyC6CRYbk8aDYlT.woff2',
				latin: 'https://fonts.gstatic.com/s/krub/v9/sZlLdRyC6CRYbkEaDQ.woff2',
			},
			'500': {
				thai: 'https://fonts.gstatic.com/s/krub/v9/sZlEdRyC6CRYZrI5GKJyRpgW.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/krub/v9/sZlEdRyC6CRYZrI5GLlyRpgW.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/krub/v9/sZlEdRyC6CRYZrI5GLhyRpgW.woff2',
				latin:
					'https://fonts.gstatic.com/s/krub/v9/sZlEdRyC6CRYZrI5GLZyRg.woff2',
			},
			'600': {
				thai: 'https://fonts.gstatic.com/s/krub/v9/sZlEdRyC6CRYZp4-GKJyRpgW.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/krub/v9/sZlEdRyC6CRYZp4-GLlyRpgW.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/krub/v9/sZlEdRyC6CRYZp4-GLhyRpgW.woff2',
				latin:
					'https://fonts.gstatic.com/s/krub/v9/sZlEdRyC6CRYZp4-GLZyRg.woff2',
			},
			'700': {
				thai: 'https://fonts.gstatic.com/s/krub/v9/sZlEdRyC6CRYZvo_GKJyRpgW.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/krub/v9/sZlEdRyC6CRYZvo_GLlyRpgW.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/krub/v9/sZlEdRyC6CRYZvo_GLhyRpgW.woff2',
				latin:
					'https://fonts.gstatic.com/s/krub/v9/sZlEdRyC6CRYZvo_GLZyRg.woff2',
			},
		},
	},
});

export const fontFamily = 'Krub' as const;

type Variants = {
	italic: {
		weights: '200' | '300' | '400' | '500' | '600' | '700';
		subsets: 'latin' | 'latin-ext' | 'thai' | 'vietnamese';
	};
	normal: {
		weights: '200' | '300' | '400' | '500' | '600' | '700';
		subsets: 'latin' | 'latin-ext' | 'thai' | 'vietnamese';
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
