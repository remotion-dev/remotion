import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Noto Serif Vithkuqi',
	importName: 'NotoSerifVithkuqi',
	version: 'v1',
	url: 'https://fonts.googleapis.com/css2?family=Noto+Serif+Vithkuqi:ital,wght@0,400;0,500;0,600;0,700',
	unicodeRanges: {
		vithkuqi:
			'U+10570-1057A, U+1057C-1058A, U+1058C-10592, U+10594-10595, U+10597-105A1, U+105A3-105B1, U+105B3-105B9, U+105BB-105BC',
		'latin-ext':
			'U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'400': {
				vithkuqi:
					'https://fonts.gstatic.com/s/notoserifvithkuqi/v1/YA9Pr1OY7FjTf5szakutkndpw9HH-4a45WNtQi2Qmw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notoserifvithkuqi/v1/YA9Pr1OY7FjTf5szakutkndpw9HH-4a45dhMZxCp.woff2',
				latin:
					'https://fonts.gstatic.com/s/notoserifvithkuqi/v1/YA9Pr1OY7FjTf5szakutkndpw9HH-4a45dZMZw.woff2',
			},
			'500': {
				vithkuqi:
					'https://fonts.gstatic.com/s/notoserifvithkuqi/v1/YA9Pr1OY7FjTf5szakutkndpw9HH-4a45WNtQi2Qmw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notoserifvithkuqi/v1/YA9Pr1OY7FjTf5szakutkndpw9HH-4a45dhMZxCp.woff2',
				latin:
					'https://fonts.gstatic.com/s/notoserifvithkuqi/v1/YA9Pr1OY7FjTf5szakutkndpw9HH-4a45dZMZw.woff2',
			},
			'600': {
				vithkuqi:
					'https://fonts.gstatic.com/s/notoserifvithkuqi/v1/YA9Pr1OY7FjTf5szakutkndpw9HH-4a45WNtQi2Qmw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notoserifvithkuqi/v1/YA9Pr1OY7FjTf5szakutkndpw9HH-4a45dhMZxCp.woff2',
				latin:
					'https://fonts.gstatic.com/s/notoserifvithkuqi/v1/YA9Pr1OY7FjTf5szakutkndpw9HH-4a45dZMZw.woff2',
			},
			'700': {
				vithkuqi:
					'https://fonts.gstatic.com/s/notoserifvithkuqi/v1/YA9Pr1OY7FjTf5szakutkndpw9HH-4a45WNtQi2Qmw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notoserifvithkuqi/v1/YA9Pr1OY7FjTf5szakutkndpw9HH-4a45dhMZxCp.woff2',
				latin:
					'https://fonts.gstatic.com/s/notoserifvithkuqi/v1/YA9Pr1OY7FjTf5szakutkndpw9HH-4a45dZMZw.woff2',
			},
		},
	},
});

export const fontFamily = 'Noto Serif Vithkuqi' as const;

type Variants = {
	normal: {
		weights: '400' | '500' | '600' | '700';
		subsets: 'latin' | 'latin-ext' | 'vithkuqi';
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
