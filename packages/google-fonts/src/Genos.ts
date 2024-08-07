import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Genos',
	importName: 'Genos',
	version: 'v12',
	url: 'https://fonts.googleapis.com/css2?family=Genos:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900',
	unicodeRanges: {
		cherokee:
			'U+0300-0302, U+0304, U+030B-030C, U+0323-0324, U+0330-0331, U+13A0-13FF, U+AB70-ABBF',
		vietnamese:
			'U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB',
		'latin-ext':
			'U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		italic: {
			'100': {
				cherokee:
					'https://fonts.gstatic.com/s/genos/v12/SlGQmQqPqpUOYRwqcSYEhUxz.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/genos/v12/SlGQmQqPqpUOYRwqcToEhUxz.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/genos/v12/SlGQmQqPqpUOYRwqcTsEhUxz.woff2',
				latin:
					'https://fonts.gstatic.com/s/genos/v12/SlGQmQqPqpUOYRwqcTUEhQ.woff2',
			},
			'200': {
				cherokee:
					'https://fonts.gstatic.com/s/genos/v12/SlGQmQqPqpUOYRwqcSYEhUxz.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/genos/v12/SlGQmQqPqpUOYRwqcToEhUxz.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/genos/v12/SlGQmQqPqpUOYRwqcTsEhUxz.woff2',
				latin:
					'https://fonts.gstatic.com/s/genos/v12/SlGQmQqPqpUOYRwqcTUEhQ.woff2',
			},
			'300': {
				cherokee:
					'https://fonts.gstatic.com/s/genos/v12/SlGQmQqPqpUOYRwqcSYEhUxz.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/genos/v12/SlGQmQqPqpUOYRwqcToEhUxz.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/genos/v12/SlGQmQqPqpUOYRwqcTsEhUxz.woff2',
				latin:
					'https://fonts.gstatic.com/s/genos/v12/SlGQmQqPqpUOYRwqcTUEhQ.woff2',
			},
			'400': {
				cherokee:
					'https://fonts.gstatic.com/s/genos/v12/SlGQmQqPqpUOYRwqcSYEhUxz.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/genos/v12/SlGQmQqPqpUOYRwqcToEhUxz.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/genos/v12/SlGQmQqPqpUOYRwqcTsEhUxz.woff2',
				latin:
					'https://fonts.gstatic.com/s/genos/v12/SlGQmQqPqpUOYRwqcTUEhQ.woff2',
			},
			'500': {
				cherokee:
					'https://fonts.gstatic.com/s/genos/v12/SlGQmQqPqpUOYRwqcSYEhUxz.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/genos/v12/SlGQmQqPqpUOYRwqcToEhUxz.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/genos/v12/SlGQmQqPqpUOYRwqcTsEhUxz.woff2',
				latin:
					'https://fonts.gstatic.com/s/genos/v12/SlGQmQqPqpUOYRwqcTUEhQ.woff2',
			},
			'600': {
				cherokee:
					'https://fonts.gstatic.com/s/genos/v12/SlGQmQqPqpUOYRwqcSYEhUxz.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/genos/v12/SlGQmQqPqpUOYRwqcToEhUxz.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/genos/v12/SlGQmQqPqpUOYRwqcTsEhUxz.woff2',
				latin:
					'https://fonts.gstatic.com/s/genos/v12/SlGQmQqPqpUOYRwqcTUEhQ.woff2',
			},
			'700': {
				cherokee:
					'https://fonts.gstatic.com/s/genos/v12/SlGQmQqPqpUOYRwqcSYEhUxz.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/genos/v12/SlGQmQqPqpUOYRwqcToEhUxz.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/genos/v12/SlGQmQqPqpUOYRwqcTsEhUxz.woff2',
				latin:
					'https://fonts.gstatic.com/s/genos/v12/SlGQmQqPqpUOYRwqcTUEhQ.woff2',
			},
			'800': {
				cherokee:
					'https://fonts.gstatic.com/s/genos/v12/SlGQmQqPqpUOYRwqcSYEhUxz.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/genos/v12/SlGQmQqPqpUOYRwqcToEhUxz.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/genos/v12/SlGQmQqPqpUOYRwqcTsEhUxz.woff2',
				latin:
					'https://fonts.gstatic.com/s/genos/v12/SlGQmQqPqpUOYRwqcTUEhQ.woff2',
			},
			'900': {
				cherokee:
					'https://fonts.gstatic.com/s/genos/v12/SlGQmQqPqpUOYRwqcSYEhUxz.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/genos/v12/SlGQmQqPqpUOYRwqcToEhUxz.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/genos/v12/SlGQmQqPqpUOYRwqcTsEhUxz.woff2',
				latin:
					'https://fonts.gstatic.com/s/genos/v12/SlGQmQqPqpUOYRwqcTUEhQ.woff2',
			},
		},
		normal: {
			'100': {
				cherokee:
					'https://fonts.gstatic.com/s/genos/v12/SlGemQqPqpUOYRw8QTccgQ.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/genos/v12/SlGemQqPqpUOYRwgQTccgQ.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/genos/v12/SlGemQqPqpUOYRwhQTccgQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/genos/v12/SlGemQqPqpUOYRwvQTc.woff2',
			},
			'200': {
				cherokee:
					'https://fonts.gstatic.com/s/genos/v12/SlGemQqPqpUOYRw8QTccgQ.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/genos/v12/SlGemQqPqpUOYRwgQTccgQ.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/genos/v12/SlGemQqPqpUOYRwhQTccgQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/genos/v12/SlGemQqPqpUOYRwvQTc.woff2',
			},
			'300': {
				cherokee:
					'https://fonts.gstatic.com/s/genos/v12/SlGemQqPqpUOYRw8QTccgQ.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/genos/v12/SlGemQqPqpUOYRwgQTccgQ.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/genos/v12/SlGemQqPqpUOYRwhQTccgQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/genos/v12/SlGemQqPqpUOYRwvQTc.woff2',
			},
			'400': {
				cherokee:
					'https://fonts.gstatic.com/s/genos/v12/SlGemQqPqpUOYRw8QTccgQ.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/genos/v12/SlGemQqPqpUOYRwgQTccgQ.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/genos/v12/SlGemQqPqpUOYRwhQTccgQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/genos/v12/SlGemQqPqpUOYRwvQTc.woff2',
			},
			'500': {
				cherokee:
					'https://fonts.gstatic.com/s/genos/v12/SlGemQqPqpUOYRw8QTccgQ.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/genos/v12/SlGemQqPqpUOYRwgQTccgQ.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/genos/v12/SlGemQqPqpUOYRwhQTccgQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/genos/v12/SlGemQqPqpUOYRwvQTc.woff2',
			},
			'600': {
				cherokee:
					'https://fonts.gstatic.com/s/genos/v12/SlGemQqPqpUOYRw8QTccgQ.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/genos/v12/SlGemQqPqpUOYRwgQTccgQ.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/genos/v12/SlGemQqPqpUOYRwhQTccgQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/genos/v12/SlGemQqPqpUOYRwvQTc.woff2',
			},
			'700': {
				cherokee:
					'https://fonts.gstatic.com/s/genos/v12/SlGemQqPqpUOYRw8QTccgQ.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/genos/v12/SlGemQqPqpUOYRwgQTccgQ.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/genos/v12/SlGemQqPqpUOYRwhQTccgQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/genos/v12/SlGemQqPqpUOYRwvQTc.woff2',
			},
			'800': {
				cherokee:
					'https://fonts.gstatic.com/s/genos/v12/SlGemQqPqpUOYRw8QTccgQ.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/genos/v12/SlGemQqPqpUOYRwgQTccgQ.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/genos/v12/SlGemQqPqpUOYRwhQTccgQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/genos/v12/SlGemQqPqpUOYRwvQTc.woff2',
			},
			'900': {
				cherokee:
					'https://fonts.gstatic.com/s/genos/v12/SlGemQqPqpUOYRw8QTccgQ.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/genos/v12/SlGemQqPqpUOYRwgQTccgQ.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/genos/v12/SlGemQqPqpUOYRwhQTccgQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/genos/v12/SlGemQqPqpUOYRwvQTc.woff2',
			},
		},
	},
});

export const fontFamily = 'Genos' as const;

type Variants = {
	italic: {
		weights:
			| '100'
			| '200'
			| '300'
			| '400'
			| '500'
			| '600'
			| '700'
			| '800'
			| '900';
		subsets: 'cherokee' | 'latin' | 'latin-ext' | 'vietnamese';
	};
	normal: {
		weights:
			| '100'
			| '200'
			| '300'
			| '400'
			| '500'
			| '600'
			| '700'
			| '800'
			| '900';
		subsets: 'cherokee' | 'latin' | 'latin-ext' | 'vietnamese';
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
