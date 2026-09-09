import {loadFonts, loadVariableFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Texturina',
	importName: 'Texturina',
	version: 'v32',
	url: 'https://fonts.googleapis.com/css2?family=Texturina:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900',
	unicodeRanges: {
		vietnamese:
			'U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB',
		'latin-ext':
			'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		italic: {
			'100': {
				vietnamese:
					'https://fonts.gstatic.com/s/texturina/v32/c4mz1nxpEtL3pXiAulR5mL129FhZmLj7I4oiSUJYfqgfBlw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/texturina/v32/c4mz1nxpEtL3pXiAulR5mL129FhZmLj7I4oiSUJYf6gfBlw.woff2',
				latin:
					'https://fonts.gstatic.com/s/texturina/v32/c4mz1nxpEtL3pXiAulR5mL129FhZmLj7I4oiSUJYcagf.woff2',
			},
			'200': {
				vietnamese:
					'https://fonts.gstatic.com/s/texturina/v32/c4mz1nxpEtL3pXiAulR5mL129FhZmLj7I4oiSUJYfqgfBlw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/texturina/v32/c4mz1nxpEtL3pXiAulR5mL129FhZmLj7I4oiSUJYf6gfBlw.woff2',
				latin:
					'https://fonts.gstatic.com/s/texturina/v32/c4mz1nxpEtL3pXiAulR5mL129FhZmLj7I4oiSUJYcagf.woff2',
			},
			'300': {
				vietnamese:
					'https://fonts.gstatic.com/s/texturina/v32/c4mz1nxpEtL3pXiAulR5mL129FhZmLj7I4oiSUJYfqgfBlw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/texturina/v32/c4mz1nxpEtL3pXiAulR5mL129FhZmLj7I4oiSUJYf6gfBlw.woff2',
				latin:
					'https://fonts.gstatic.com/s/texturina/v32/c4mz1nxpEtL3pXiAulR5mL129FhZmLj7I4oiSUJYcagf.woff2',
			},
			'400': {
				vietnamese:
					'https://fonts.gstatic.com/s/texturina/v32/c4mz1nxpEtL3pXiAulR5mL129FhZmLj7I4oiSUJYfqgfBlw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/texturina/v32/c4mz1nxpEtL3pXiAulR5mL129FhZmLj7I4oiSUJYf6gfBlw.woff2',
				latin:
					'https://fonts.gstatic.com/s/texturina/v32/c4mz1nxpEtL3pXiAulR5mL129FhZmLj7I4oiSUJYcagf.woff2',
			},
			'500': {
				vietnamese:
					'https://fonts.gstatic.com/s/texturina/v32/c4mz1nxpEtL3pXiAulR5mL129FhZmLj7I4oiSUJYfqgfBlw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/texturina/v32/c4mz1nxpEtL3pXiAulR5mL129FhZmLj7I4oiSUJYf6gfBlw.woff2',
				latin:
					'https://fonts.gstatic.com/s/texturina/v32/c4mz1nxpEtL3pXiAulR5mL129FhZmLj7I4oiSUJYcagf.woff2',
			},
			'600': {
				vietnamese:
					'https://fonts.gstatic.com/s/texturina/v32/c4mz1nxpEtL3pXiAulR5mL129FhZmLj7I4oiSUJYfqgfBlw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/texturina/v32/c4mz1nxpEtL3pXiAulR5mL129FhZmLj7I4oiSUJYf6gfBlw.woff2',
				latin:
					'https://fonts.gstatic.com/s/texturina/v32/c4mz1nxpEtL3pXiAulR5mL129FhZmLj7I4oiSUJYcagf.woff2',
			},
			'700': {
				vietnamese:
					'https://fonts.gstatic.com/s/texturina/v32/c4mz1nxpEtL3pXiAulR5mL129FhZmLj7I4oiSUJYfqgfBlw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/texturina/v32/c4mz1nxpEtL3pXiAulR5mL129FhZmLj7I4oiSUJYf6gfBlw.woff2',
				latin:
					'https://fonts.gstatic.com/s/texturina/v32/c4mz1nxpEtL3pXiAulR5mL129FhZmLj7I4oiSUJYcagf.woff2',
			},
			'800': {
				vietnamese:
					'https://fonts.gstatic.com/s/texturina/v32/c4mz1nxpEtL3pXiAulR5mL129FhZmLj7I4oiSUJYfqgfBlw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/texturina/v32/c4mz1nxpEtL3pXiAulR5mL129FhZmLj7I4oiSUJYf6gfBlw.woff2',
				latin:
					'https://fonts.gstatic.com/s/texturina/v32/c4mz1nxpEtL3pXiAulR5mL129FhZmLj7I4oiSUJYcagf.woff2',
			},
			'900': {
				vietnamese:
					'https://fonts.gstatic.com/s/texturina/v32/c4mz1nxpEtL3pXiAulR5mL129FhZmLj7I4oiSUJYfqgfBlw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/texturina/v32/c4mz1nxpEtL3pXiAulR5mL129FhZmLj7I4oiSUJYf6gfBlw.woff2',
				latin:
					'https://fonts.gstatic.com/s/texturina/v32/c4mz1nxpEtL3pXiAulR5mL129FhZmLj7I4oiSUJYcagf.woff2',
			},
		},
		normal: {
			'100': {
				vietnamese:
					'https://fonts.gstatic.com/s/texturina/v32/c4mx1nxpEtL3pXiAulRTkY-HGmNEX1b9NspjGQtoc7Ab.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/texturina/v32/c4mx1nxpEtL3pXiAulRTkY-HGmNEX1b9NspjGQpoc7Ab.woff2',
				latin:
					'https://fonts.gstatic.com/s/texturina/v32/c4mx1nxpEtL3pXiAulRTkY-HGmNEX1b9NspjGQRocw.woff2',
			},
			'200': {
				vietnamese:
					'https://fonts.gstatic.com/s/texturina/v32/c4mx1nxpEtL3pXiAulRTkY-HGmNEX1b9NspjGQtoc7Ab.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/texturina/v32/c4mx1nxpEtL3pXiAulRTkY-HGmNEX1b9NspjGQpoc7Ab.woff2',
				latin:
					'https://fonts.gstatic.com/s/texturina/v32/c4mx1nxpEtL3pXiAulRTkY-HGmNEX1b9NspjGQRocw.woff2',
			},
			'300': {
				vietnamese:
					'https://fonts.gstatic.com/s/texturina/v32/c4mx1nxpEtL3pXiAulRTkY-HGmNEX1b9NspjGQtoc7Ab.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/texturina/v32/c4mx1nxpEtL3pXiAulRTkY-HGmNEX1b9NspjGQpoc7Ab.woff2',
				latin:
					'https://fonts.gstatic.com/s/texturina/v32/c4mx1nxpEtL3pXiAulRTkY-HGmNEX1b9NspjGQRocw.woff2',
			},
			'400': {
				vietnamese:
					'https://fonts.gstatic.com/s/texturina/v32/c4mx1nxpEtL3pXiAulRTkY-HGmNEX1b9NspjGQtoc7Ab.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/texturina/v32/c4mx1nxpEtL3pXiAulRTkY-HGmNEX1b9NspjGQpoc7Ab.woff2',
				latin:
					'https://fonts.gstatic.com/s/texturina/v32/c4mx1nxpEtL3pXiAulRTkY-HGmNEX1b9NspjGQRocw.woff2',
			},
			'500': {
				vietnamese:
					'https://fonts.gstatic.com/s/texturina/v32/c4mx1nxpEtL3pXiAulRTkY-HGmNEX1b9NspjGQtoc7Ab.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/texturina/v32/c4mx1nxpEtL3pXiAulRTkY-HGmNEX1b9NspjGQpoc7Ab.woff2',
				latin:
					'https://fonts.gstatic.com/s/texturina/v32/c4mx1nxpEtL3pXiAulRTkY-HGmNEX1b9NspjGQRocw.woff2',
			},
			'600': {
				vietnamese:
					'https://fonts.gstatic.com/s/texturina/v32/c4mx1nxpEtL3pXiAulRTkY-HGmNEX1b9NspjGQtoc7Ab.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/texturina/v32/c4mx1nxpEtL3pXiAulRTkY-HGmNEX1b9NspjGQpoc7Ab.woff2',
				latin:
					'https://fonts.gstatic.com/s/texturina/v32/c4mx1nxpEtL3pXiAulRTkY-HGmNEX1b9NspjGQRocw.woff2',
			},
			'700': {
				vietnamese:
					'https://fonts.gstatic.com/s/texturina/v32/c4mx1nxpEtL3pXiAulRTkY-HGmNEX1b9NspjGQtoc7Ab.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/texturina/v32/c4mx1nxpEtL3pXiAulRTkY-HGmNEX1b9NspjGQpoc7Ab.woff2',
				latin:
					'https://fonts.gstatic.com/s/texturina/v32/c4mx1nxpEtL3pXiAulRTkY-HGmNEX1b9NspjGQRocw.woff2',
			},
			'800': {
				vietnamese:
					'https://fonts.gstatic.com/s/texturina/v32/c4mx1nxpEtL3pXiAulRTkY-HGmNEX1b9NspjGQtoc7Ab.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/texturina/v32/c4mx1nxpEtL3pXiAulRTkY-HGmNEX1b9NspjGQpoc7Ab.woff2',
				latin:
					'https://fonts.gstatic.com/s/texturina/v32/c4mx1nxpEtL3pXiAulRTkY-HGmNEX1b9NspjGQRocw.woff2',
			},
			'900': {
				vietnamese:
					'https://fonts.gstatic.com/s/texturina/v32/c4mx1nxpEtL3pXiAulRTkY-HGmNEX1b9NspjGQtoc7Ab.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/texturina/v32/c4mx1nxpEtL3pXiAulRTkY-HGmNEX1b9NspjGQpoc7Ab.woff2',
				latin:
					'https://fonts.gstatic.com/s/texturina/v32/c4mx1nxpEtL3pXiAulRTkY-HGmNEX1b9NspjGQRocw.woff2',
			},
		},
	},
	subsets: ['latin', 'latin-ext', 'vietnamese'],
	variable: {
		axes: {
			opsz: {
				min: 12,
				max: 72,
			},
			wght: {
				min: 100,
				max: 900,
			},
		},
		fontFaces: [
			{
				style: 'italic',
				weight: '100 900',
				stretch: null,
				subset: 'vietnamese',
				unicodeRange:
					'U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB',
				src: 'https://fonts.gstatic.com/s/texturina/v32/c4mk1nxpEtL3pXiAulR5mJd13KeHWA.woff2',
			},
			{
				style: 'italic',
				weight: '100 900',
				stretch: null,
				subset: 'latin-ext',
				unicodeRange:
					'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
				src: 'https://fonts.gstatic.com/s/texturina/v32/c4mk1nxpEtL3pXiAulR5mJd03KeHWA.woff2',
			},
			{
				style: 'italic',
				weight: '100 900',
				stretch: null,
				subset: 'latin',
				unicodeRange:
					'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
				src: 'https://fonts.gstatic.com/s/texturina/v32/c4mk1nxpEtL3pXiAulR5mJd63Kc.woff2',
			},
			{
				style: 'normal',
				weight: '100 900',
				stretch: null,
				subset: 'vietnamese',
				unicodeRange:
					'U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB',
				src: 'https://fonts.gstatic.com/s/texturina/v32/c4mi1nxpEtL3pXiAulR5kqd4xKM.woff2',
			},
			{
				style: 'normal',
				weight: '100 900',
				stretch: null,
				subset: 'latin-ext',
				unicodeRange:
					'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
				src: 'https://fonts.gstatic.com/s/texturina/v32/c4mi1nxpEtL3pXiAulR5k6d4xKM.woff2',
			},
			{
				style: 'normal',
				weight: '100 900',
				stretch: null,
				subset: 'latin',
				unicodeRange:
					'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
				src: 'https://fonts.gstatic.com/s/texturina/v32/c4mi1nxpEtL3pXiAulR5nad4.woff2',
			},
		],
		url: 'https://fonts.googleapis.com/css2?family=Texturina:ital,opsz,wght@0,12..72,100..900;1,12..72,100..900',
	},
});

export const fontFamily = 'Texturina' as const;

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
		subsets: 'latin' | 'latin-ext' | 'vietnamese';
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
		subsets: 'latin' | 'latin-ext' | 'vietnamese';
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

type VariableVariants = {
	italic: {
		subsets: 'latin' | 'latin-ext' | 'vietnamese';
	};
	normal: {
		subsets: 'latin' | 'latin-ext' | 'vietnamese';
	};
};

export const loadVariableFont = <T extends keyof VariableVariants>(
	style: T,
	options: {
		subsets: VariableVariants[T]['subsets'][];
		document?: Document;
		ignoreTooManyRequestsWarning?: boolean;
	},
) => {
	return loadVariableFonts(getInfo(), style, options);
};
