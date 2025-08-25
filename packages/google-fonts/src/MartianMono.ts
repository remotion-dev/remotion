import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Martian Mono',
	importName: 'MartianMono',
	version: 'v5',
	url: 'https://fonts.googleapis.com/css2?family=Martian+Mono:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800',
	unicodeRanges: {
		'cyrillic-ext':
			'U+0460-052F, U+1C80-1C8A, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F',
		cyrillic: 'U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116',
		'latin-ext':
			'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'100': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/martianmono/v5/2V0PKIcADoYhV6w87xrTKjs4CYElh_VS9YA4TlTnaTe9wWmm.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/martianmono/v5/2V0PKIcADoYhV6w87xrTKjs4CYElh_VS9YA4TlTnaT69wWmm.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/martianmono/v5/2V0PKIcADoYhV6w87xrTKjs4CYElh_VS9YA4TlTnaTS9wWmm.woff2',
				latin:
					'https://fonts.gstatic.com/s/martianmono/v5/2V0PKIcADoYhV6w87xrTKjs4CYElh_VS9YA4TlTnaTq9wQ.woff2',
			},
			'200': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/martianmono/v5/2V0PKIcADoYhV6w87xrTKjs4CYElh_VS9YA4TlTnaTe9wWmm.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/martianmono/v5/2V0PKIcADoYhV6w87xrTKjs4CYElh_VS9YA4TlTnaT69wWmm.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/martianmono/v5/2V0PKIcADoYhV6w87xrTKjs4CYElh_VS9YA4TlTnaTS9wWmm.woff2',
				latin:
					'https://fonts.gstatic.com/s/martianmono/v5/2V0PKIcADoYhV6w87xrTKjs4CYElh_VS9YA4TlTnaTq9wQ.woff2',
			},
			'300': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/martianmono/v5/2V0PKIcADoYhV6w87xrTKjs4CYElh_VS9YA4TlTnaTe9wWmm.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/martianmono/v5/2V0PKIcADoYhV6w87xrTKjs4CYElh_VS9YA4TlTnaT69wWmm.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/martianmono/v5/2V0PKIcADoYhV6w87xrTKjs4CYElh_VS9YA4TlTnaTS9wWmm.woff2',
				latin:
					'https://fonts.gstatic.com/s/martianmono/v5/2V0PKIcADoYhV6w87xrTKjs4CYElh_VS9YA4TlTnaTq9wQ.woff2',
			},
			'400': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/martianmono/v5/2V0PKIcADoYhV6w87xrTKjs4CYElh_VS9YA4TlTnaTe9wWmm.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/martianmono/v5/2V0PKIcADoYhV6w87xrTKjs4CYElh_VS9YA4TlTnaT69wWmm.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/martianmono/v5/2V0PKIcADoYhV6w87xrTKjs4CYElh_VS9YA4TlTnaTS9wWmm.woff2',
				latin:
					'https://fonts.gstatic.com/s/martianmono/v5/2V0PKIcADoYhV6w87xrTKjs4CYElh_VS9YA4TlTnaTq9wQ.woff2',
			},
			'500': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/martianmono/v5/2V0PKIcADoYhV6w87xrTKjs4CYElh_VS9YA4TlTnaTe9wWmm.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/martianmono/v5/2V0PKIcADoYhV6w87xrTKjs4CYElh_VS9YA4TlTnaT69wWmm.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/martianmono/v5/2V0PKIcADoYhV6w87xrTKjs4CYElh_VS9YA4TlTnaTS9wWmm.woff2',
				latin:
					'https://fonts.gstatic.com/s/martianmono/v5/2V0PKIcADoYhV6w87xrTKjs4CYElh_VS9YA4TlTnaTq9wQ.woff2',
			},
			'600': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/martianmono/v5/2V0PKIcADoYhV6w87xrTKjs4CYElh_VS9YA4TlTnaTe9wWmm.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/martianmono/v5/2V0PKIcADoYhV6w87xrTKjs4CYElh_VS9YA4TlTnaT69wWmm.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/martianmono/v5/2V0PKIcADoYhV6w87xrTKjs4CYElh_VS9YA4TlTnaTS9wWmm.woff2',
				latin:
					'https://fonts.gstatic.com/s/martianmono/v5/2V0PKIcADoYhV6w87xrTKjs4CYElh_VS9YA4TlTnaTq9wQ.woff2',
			},
			'700': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/martianmono/v5/2V0PKIcADoYhV6w87xrTKjs4CYElh_VS9YA4TlTnaTe9wWmm.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/martianmono/v5/2V0PKIcADoYhV6w87xrTKjs4CYElh_VS9YA4TlTnaT69wWmm.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/martianmono/v5/2V0PKIcADoYhV6w87xrTKjs4CYElh_VS9YA4TlTnaTS9wWmm.woff2',
				latin:
					'https://fonts.gstatic.com/s/martianmono/v5/2V0PKIcADoYhV6w87xrTKjs4CYElh_VS9YA4TlTnaTq9wQ.woff2',
			},
			'800': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/martianmono/v5/2V0PKIcADoYhV6w87xrTKjs4CYElh_VS9YA4TlTnaTe9wWmm.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/martianmono/v5/2V0PKIcADoYhV6w87xrTKjs4CYElh_VS9YA4TlTnaT69wWmm.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/martianmono/v5/2V0PKIcADoYhV6w87xrTKjs4CYElh_VS9YA4TlTnaTS9wWmm.woff2',
				latin:
					'https://fonts.gstatic.com/s/martianmono/v5/2V0PKIcADoYhV6w87xrTKjs4CYElh_VS9YA4TlTnaTq9wQ.woff2',
			},
		},
	},
	subsets: ['cyrillic', 'cyrillic-ext', 'latin', 'latin-ext'],
});

export const fontFamily = 'Martian Mono' as const;

type Variants = {
	normal: {
		weights: '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800';
		subsets: 'cyrillic' | 'cyrillic-ext' | 'latin' | 'latin-ext';
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
