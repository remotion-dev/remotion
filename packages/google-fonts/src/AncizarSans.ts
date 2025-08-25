import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Ancizar Sans',
	importName: 'AncizarSans',
	version: 'v7',
	url: 'https://fonts.googleapis.com/css2?family=Ancizar+Sans:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900',
	unicodeRanges: {
		greek:
			'U+0370-0377, U+037A-037F, U+0384-038A, U+038C, U+038E-03A1, U+03A3-03FF',
		'latin-ext':
			'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		italic: {
			'100': {
				greek:
					'https://fonts.gstatic.com/s/ancizarsans/v7/fC14PYtHY2vX3wj8IbE7Pxe8VTjBjl2daw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ancizarsans/v7/fC14PYtHY2vX3wj8IbE7Pxe8VTjMjl2daw.woff2',
				latin:
					'https://fonts.gstatic.com/s/ancizarsans/v7/fC14PYtHY2vX3wj8IbE7Pxe8VTjCjl0.woff2',
			},
			'200': {
				greek:
					'https://fonts.gstatic.com/s/ancizarsans/v7/fC14PYtHY2vX3wj8IbE7Pxe8VTjBjl2daw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ancizarsans/v7/fC14PYtHY2vX3wj8IbE7Pxe8VTjMjl2daw.woff2',
				latin:
					'https://fonts.gstatic.com/s/ancizarsans/v7/fC14PYtHY2vX3wj8IbE7Pxe8VTjCjl0.woff2',
			},
			'300': {
				greek:
					'https://fonts.gstatic.com/s/ancizarsans/v7/fC14PYtHY2vX3wj8IbE7Pxe8VTjBjl2daw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ancizarsans/v7/fC14PYtHY2vX3wj8IbE7Pxe8VTjMjl2daw.woff2',
				latin:
					'https://fonts.gstatic.com/s/ancizarsans/v7/fC14PYtHY2vX3wj8IbE7Pxe8VTjCjl0.woff2',
			},
			'400': {
				greek:
					'https://fonts.gstatic.com/s/ancizarsans/v7/fC14PYtHY2vX3wj8IbE7Pxe8VTjBjl2daw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ancizarsans/v7/fC14PYtHY2vX3wj8IbE7Pxe8VTjMjl2daw.woff2',
				latin:
					'https://fonts.gstatic.com/s/ancizarsans/v7/fC14PYtHY2vX3wj8IbE7Pxe8VTjCjl0.woff2',
			},
			'500': {
				greek:
					'https://fonts.gstatic.com/s/ancizarsans/v7/fC14PYtHY2vX3wj8IbE7Pxe8VTjBjl2daw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ancizarsans/v7/fC14PYtHY2vX3wj8IbE7Pxe8VTjMjl2daw.woff2',
				latin:
					'https://fonts.gstatic.com/s/ancizarsans/v7/fC14PYtHY2vX3wj8IbE7Pxe8VTjCjl0.woff2',
			},
			'600': {
				greek:
					'https://fonts.gstatic.com/s/ancizarsans/v7/fC14PYtHY2vX3wj8IbE7Pxe8VTjBjl2daw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ancizarsans/v7/fC14PYtHY2vX3wj8IbE7Pxe8VTjMjl2daw.woff2',
				latin:
					'https://fonts.gstatic.com/s/ancizarsans/v7/fC14PYtHY2vX3wj8IbE7Pxe8VTjCjl0.woff2',
			},
			'700': {
				greek:
					'https://fonts.gstatic.com/s/ancizarsans/v7/fC14PYtHY2vX3wj8IbE7Pxe8VTjBjl2daw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ancizarsans/v7/fC14PYtHY2vX3wj8IbE7Pxe8VTjMjl2daw.woff2',
				latin:
					'https://fonts.gstatic.com/s/ancizarsans/v7/fC14PYtHY2vX3wj8IbE7Pxe8VTjCjl0.woff2',
			},
			'800': {
				greek:
					'https://fonts.gstatic.com/s/ancizarsans/v7/fC14PYtHY2vX3wj8IbE7Pxe8VTjBjl2daw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ancizarsans/v7/fC14PYtHY2vX3wj8IbE7Pxe8VTjMjl2daw.woff2',
				latin:
					'https://fonts.gstatic.com/s/ancizarsans/v7/fC14PYtHY2vX3wj8IbE7Pxe8VTjCjl0.woff2',
			},
			'900': {
				greek:
					'https://fonts.gstatic.com/s/ancizarsans/v7/fC14PYtHY2vX3wj8IbE7Pxe8VTjBjl2daw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ancizarsans/v7/fC14PYtHY2vX3wj8IbE7Pxe8VTjMjl2daw.woff2',
				latin:
					'https://fonts.gstatic.com/s/ancizarsans/v7/fC14PYtHY2vX3wj8IbE7Pxe8VTjCjl0.woff2',
			},
		},
		normal: {
			'100': {
				greek:
					'https://fonts.gstatic.com/s/ancizarsans/v7/fC1mPYtHY2vX3wj8IbE7Pxe8UwjAllk.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ancizarsans/v7/fC1mPYtHY2vX3wj8IbE7Pxe8XgjAllk.woff2',
				latin:
					'https://fonts.gstatic.com/s/ancizarsans/v7/fC1mPYtHY2vX3wj8IbE7Pxe8UAjA.woff2',
			},
			'200': {
				greek:
					'https://fonts.gstatic.com/s/ancizarsans/v7/fC1mPYtHY2vX3wj8IbE7Pxe8UwjAllk.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ancizarsans/v7/fC1mPYtHY2vX3wj8IbE7Pxe8XgjAllk.woff2',
				latin:
					'https://fonts.gstatic.com/s/ancizarsans/v7/fC1mPYtHY2vX3wj8IbE7Pxe8UAjA.woff2',
			},
			'300': {
				greek:
					'https://fonts.gstatic.com/s/ancizarsans/v7/fC1mPYtHY2vX3wj8IbE7Pxe8UwjAllk.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ancizarsans/v7/fC1mPYtHY2vX3wj8IbE7Pxe8XgjAllk.woff2',
				latin:
					'https://fonts.gstatic.com/s/ancizarsans/v7/fC1mPYtHY2vX3wj8IbE7Pxe8UAjA.woff2',
			},
			'400': {
				greek:
					'https://fonts.gstatic.com/s/ancizarsans/v7/fC1mPYtHY2vX3wj8IbE7Pxe8UwjAllk.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ancizarsans/v7/fC1mPYtHY2vX3wj8IbE7Pxe8XgjAllk.woff2',
				latin:
					'https://fonts.gstatic.com/s/ancizarsans/v7/fC1mPYtHY2vX3wj8IbE7Pxe8UAjA.woff2',
			},
			'500': {
				greek:
					'https://fonts.gstatic.com/s/ancizarsans/v7/fC1mPYtHY2vX3wj8IbE7Pxe8UwjAllk.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ancizarsans/v7/fC1mPYtHY2vX3wj8IbE7Pxe8XgjAllk.woff2',
				latin:
					'https://fonts.gstatic.com/s/ancizarsans/v7/fC1mPYtHY2vX3wj8IbE7Pxe8UAjA.woff2',
			},
			'600': {
				greek:
					'https://fonts.gstatic.com/s/ancizarsans/v7/fC1mPYtHY2vX3wj8IbE7Pxe8UwjAllk.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ancizarsans/v7/fC1mPYtHY2vX3wj8IbE7Pxe8XgjAllk.woff2',
				latin:
					'https://fonts.gstatic.com/s/ancizarsans/v7/fC1mPYtHY2vX3wj8IbE7Pxe8UAjA.woff2',
			},
			'700': {
				greek:
					'https://fonts.gstatic.com/s/ancizarsans/v7/fC1mPYtHY2vX3wj8IbE7Pxe8UwjAllk.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ancizarsans/v7/fC1mPYtHY2vX3wj8IbE7Pxe8XgjAllk.woff2',
				latin:
					'https://fonts.gstatic.com/s/ancizarsans/v7/fC1mPYtHY2vX3wj8IbE7Pxe8UAjA.woff2',
			},
			'800': {
				greek:
					'https://fonts.gstatic.com/s/ancizarsans/v7/fC1mPYtHY2vX3wj8IbE7Pxe8UwjAllk.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ancizarsans/v7/fC1mPYtHY2vX3wj8IbE7Pxe8XgjAllk.woff2',
				latin:
					'https://fonts.gstatic.com/s/ancizarsans/v7/fC1mPYtHY2vX3wj8IbE7Pxe8UAjA.woff2',
			},
			'900': {
				greek:
					'https://fonts.gstatic.com/s/ancizarsans/v7/fC1mPYtHY2vX3wj8IbE7Pxe8UwjAllk.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ancizarsans/v7/fC1mPYtHY2vX3wj8IbE7Pxe8XgjAllk.woff2',
				latin:
					'https://fonts.gstatic.com/s/ancizarsans/v7/fC1mPYtHY2vX3wj8IbE7Pxe8UAjA.woff2',
			},
		},
	},
	subsets: ['greek', 'latin', 'latin-ext'],
});

export const fontFamily = 'Ancizar Sans' as const;

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
		subsets: 'greek' | 'latin' | 'latin-ext';
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
		subsets: 'greek' | 'latin' | 'latin-ext';
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
