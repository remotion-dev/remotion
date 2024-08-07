import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Sansita',
	importName: 'Sansita',
	version: 'v11',
	url: 'https://fonts.googleapis.com/css2?family=Sansita:ital,wght@0,400;0,700;0,800;0,900;1,400;1,700;1,800;1,900',
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
					'https://fonts.gstatic.com/s/sansita/v11/QldMNTRRphEb_-V7LBuBQFlb_qw.woff2',
				latin:
					'https://fonts.gstatic.com/s/sansita/v11/QldMNTRRphEb_-V7LBuBTllb.woff2',
			},
			'700': {
				'latin-ext':
					'https://fonts.gstatic.com/s/sansita/v11/QldJNTRRphEb_-V7LBuJ9XxOz41r__g.woff2',
				latin:
					'https://fonts.gstatic.com/s/sansita/v11/QldJNTRRphEb_-V7LBuJ9XxOwY1r.woff2',
			},
			'800': {
				'latin-ext':
					'https://fonts.gstatic.com/s/sansita/v11/QldJNTRRphEb_-V7LBuJ6X9Oz41r__g.woff2',
				latin:
					'https://fonts.gstatic.com/s/sansita/v11/QldJNTRRphEb_-V7LBuJ6X9OwY1r.woff2',
			},
			'900': {
				'latin-ext':
					'https://fonts.gstatic.com/s/sansita/v11/QldJNTRRphEb_-V7LBuJzX5Oz41r__g.woff2',
				latin:
					'https://fonts.gstatic.com/s/sansita/v11/QldJNTRRphEb_-V7LBuJzX5OwY1r.woff2',
			},
		},
		normal: {
			'400': {
				'latin-ext':
					'https://fonts.gstatic.com/s/sansita/v11/QldONTRRphEb_-V7LBCxTEFf.woff2',
				latin:
					'https://fonts.gstatic.com/s/sansita/v11/QldONTRRphEb_-V7LB6xTA.woff2',
			},
			'700': {
				'latin-ext':
					'https://fonts.gstatic.com/s/sansita/v11/QldLNTRRphEb_-V7JKWUWXB-w5Vv.woff2',
				latin:
					'https://fonts.gstatic.com/s/sansita/v11/QldLNTRRphEb_-V7JKWUWX5-ww.woff2',
			},
			'800': {
				'latin-ext':
					'https://fonts.gstatic.com/s/sansita/v11/QldLNTRRphEb_-V7JLmXWXB-w5Vv.woff2',
				latin:
					'https://fonts.gstatic.com/s/sansita/v11/QldLNTRRphEb_-V7JLmXWX5-ww.woff2',
			},
			'900': {
				'latin-ext':
					'https://fonts.gstatic.com/s/sansita/v11/QldLNTRRphEb_-V7JJ2WWXB-w5Vv.woff2',
				latin:
					'https://fonts.gstatic.com/s/sansita/v11/QldLNTRRphEb_-V7JJ2WWX5-ww.woff2',
			},
		},
	},
});

export const fontFamily = 'Sansita' as const;

type Variants = {
	italic: {
		weights: '400' | '700' | '800' | '900';
		subsets: 'latin' | 'latin-ext';
	};
	normal: {
		weights: '400' | '700' | '800' | '900';
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
