import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Alegreya Sans',
	importName: 'AlegreyaSans',
	version: 'v24',
	url: 'https://fonts.googleapis.com/css2?family=Alegreya+Sans:ital,wght@0,100;0,300;0,400;0,500;0,700;0,800;0,900;1,100;1,300;1,400;1,500;1,700;1,800;1,900',
	unicodeRanges: {
		'cyrillic-ext':
			'U+0460-052F, U+1C80-1C88, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F',
		cyrillic: 'U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116',
		'greek-ext': 'U+1F00-1FFF',
		greek:
			'U+0370-0377, U+037A-037F, U+0384-038A, U+038C, U+038E-03A1, U+03A3-03FF',
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
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUv9_-1phKLFgshYDvh6Vwt7V9V3F1crmp7sg.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUv9_-1phKLFgshYDvh6Vwt7V9V3F1Vrmp7sg.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUv9_-1phKLFgshYDvh6Vwt7V9V3F1drmp7sg.woff2',
				greek:
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUv9_-1phKLFgshYDvh6Vwt7V9V3F1Srmp7sg.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUv9_-1phKLFgshYDvh6Vwt7V9V3F1ermp7sg.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUv9_-1phKLFgshYDvh6Vwt7V9V3F1frmp7sg.woff2',
				latin:
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUv9_-1phKLFgshYDvh6Vwt7V9V3F1Rrmo.woff2',
			},
			'300': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUo9_-1phKLFgshYDvh6Vwt7V9VFE9GhE9GixI.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUo9_-1phKLFgshYDvh6Vwt7V9VFE9GjU9GixI.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUo9_-1phKLFgshYDvh6Vwt7V9VFE9GhU9GixI.woff2',
				greek:
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUo9_-1phKLFgshYDvh6Vwt7V9VFE9Gik9GixI.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUo9_-1phKLFgshYDvh6Vwt7V9VFE9Ghk9GixI.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUo9_-1phKLFgshYDvh6Vwt7V9VFE9Gh09GixI.woff2',
				latin:
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUo9_-1phKLFgshYDvh6Vwt7V9VFE9GiU9G.woff2',
			},
			'400': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUt9_-1phKLFgshYDvh6Vwt7V9dsm1Ttm4.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUt9_-1phKLFgshYDvh6Vwt7V9du21Ttm4.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUt9_-1phKLFgshYDvh6Vwt7V9ds21Ttm4.woff2',
				greek:
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUt9_-1phKLFgshYDvh6Vwt7V9dvG1Ttm4.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUt9_-1phKLFgshYDvh6Vwt7V9dsG1Ttm4.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUt9_-1phKLFgshYDvh6Vwt7V9dsW1Ttm4.woff2',
				latin:
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUt9_-1phKLFgshYDvh6Vwt7V9dv21T.woff2',
			},
			'500': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUo9_-1phKLFgshYDvh6Vwt7V9VTE5GhE9GixI.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUo9_-1phKLFgshYDvh6Vwt7V9VTE5GjU9GixI.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUo9_-1phKLFgshYDvh6Vwt7V9VTE5GhU9GixI.woff2',
				greek:
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUo9_-1phKLFgshYDvh6Vwt7V9VTE5Gik9GixI.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUo9_-1phKLFgshYDvh6Vwt7V9VTE5Ghk9GixI.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUo9_-1phKLFgshYDvh6Vwt7V9VTE5Gh09GixI.woff2',
				latin:
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUo9_-1phKLFgshYDvh6Vwt7V9VTE5GiU9G.woff2',
			},
			'700': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUo9_-1phKLFgshYDvh6Vwt7V9VBEhGhE9GixI.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUo9_-1phKLFgshYDvh6Vwt7V9VBEhGjU9GixI.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUo9_-1phKLFgshYDvh6Vwt7V9VBEhGhU9GixI.woff2',
				greek:
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUo9_-1phKLFgshYDvh6Vwt7V9VBEhGik9GixI.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUo9_-1phKLFgshYDvh6Vwt7V9VBEhGhk9GixI.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUo9_-1phKLFgshYDvh6Vwt7V9VBEhGh09GixI.woff2',
				latin:
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUo9_-1phKLFgshYDvh6Vwt7V9VBEhGiU9G.woff2',
			},
			'800': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUo9_-1phKLFgshYDvh6Vwt7V9VGEtGhE9GixI.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUo9_-1phKLFgshYDvh6Vwt7V9VGEtGjU9GixI.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUo9_-1phKLFgshYDvh6Vwt7V9VGEtGhU9GixI.woff2',
				greek:
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUo9_-1phKLFgshYDvh6Vwt7V9VGEtGik9GixI.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUo9_-1phKLFgshYDvh6Vwt7V9VGEtGhk9GixI.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUo9_-1phKLFgshYDvh6Vwt7V9VGEtGh09GixI.woff2',
				latin:
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUo9_-1phKLFgshYDvh6Vwt7V9VGEtGiU9G.woff2',
			},
			'900': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUo9_-1phKLFgshYDvh6Vwt7V9VPEpGhE9GixI.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUo9_-1phKLFgshYDvh6Vwt7V9VPEpGjU9GixI.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUo9_-1phKLFgshYDvh6Vwt7V9VPEpGhU9GixI.woff2',
				greek:
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUo9_-1phKLFgshYDvh6Vwt7V9VPEpGik9GixI.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUo9_-1phKLFgshYDvh6Vwt7V9VPEpGhk9GixI.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUo9_-1phKLFgshYDvh6Vwt7V9VPEpGh09GixI.woff2',
				latin:
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUo9_-1phKLFgshYDvh6Vwt7V9VPEpGiU9G.woff2',
			},
		},
		normal: {
			'100': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUt9_-1phKLFgshYDvh6Vwt5Tldsm1Ttm4.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUt9_-1phKLFgshYDvh6Vwt5Tldu21Ttm4.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUt9_-1phKLFgshYDvh6Vwt5Tlds21Ttm4.woff2',
				greek:
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUt9_-1phKLFgshYDvh6Vwt5TldvG1Ttm4.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUt9_-1phKLFgshYDvh6Vwt5TldsG1Ttm4.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUt9_-1phKLFgshYDvh6Vwt5TldsW1Ttm4.woff2',
				latin:
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUt9_-1phKLFgshYDvh6Vwt5Tldv21T.woff2',
			},
			'300': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUu9_-1phKLFgshYDvh6Vwt5fFPqEd2i1dC.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUu9_-1phKLFgshYDvh6Vwt5fFPqE52i1dC.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUu9_-1phKLFgshYDvh6Vwt5fFPqEZ2i1dC.woff2',
				greek:
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUu9_-1phKLFgshYDvh6Vwt5fFPqEl2i1dC.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUu9_-1phKLFgshYDvh6Vwt5fFPqEV2i1dC.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUu9_-1phKLFgshYDvh6Vwt5fFPqER2i1dC.woff2',
				latin:
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUu9_-1phKLFgshYDvh6Vwt5fFPqEp2iw.woff2',
			},
			'400': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUz9_-1phKLFgshYDvh6Vwt7VdtvXVX.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUz9_-1phKLFgshYDvh6Vwt7V5tvXVX.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUz9_-1phKLFgshYDvh6Vwt7VZtvXVX.woff2',
				greek:
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUz9_-1phKLFgshYDvh6Vwt7VltvXVX.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUz9_-1phKLFgshYDvh6Vwt7VVtvXVX.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUz9_-1phKLFgshYDvh6Vwt7VRtvXVX.woff2',
				latin:
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUz9_-1phKLFgshYDvh6Vwt7VptvQ.woff2',
			},
			'500': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUu9_-1phKLFgshYDvh6Vwt5alOqEd2i1dC.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUu9_-1phKLFgshYDvh6Vwt5alOqE52i1dC.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUu9_-1phKLFgshYDvh6Vwt5alOqEZ2i1dC.woff2',
				greek:
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUu9_-1phKLFgshYDvh6Vwt5alOqEl2i1dC.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUu9_-1phKLFgshYDvh6Vwt5alOqEV2i1dC.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUu9_-1phKLFgshYDvh6Vwt5alOqER2i1dC.woff2',
				latin:
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUu9_-1phKLFgshYDvh6Vwt5alOqEp2iw.woff2',
			},
			'700': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUu9_-1phKLFgshYDvh6Vwt5eFIqEd2i1dC.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUu9_-1phKLFgshYDvh6Vwt5eFIqE52i1dC.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUu9_-1phKLFgshYDvh6Vwt5eFIqEZ2i1dC.woff2',
				greek:
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUu9_-1phKLFgshYDvh6Vwt5eFIqEl2i1dC.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUu9_-1phKLFgshYDvh6Vwt5eFIqEV2i1dC.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUu9_-1phKLFgshYDvh6Vwt5eFIqER2i1dC.woff2',
				latin:
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUu9_-1phKLFgshYDvh6Vwt5eFIqEp2iw.woff2',
			},
			'800': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUu9_-1phKLFgshYDvh6Vwt5f1LqEd2i1dC.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUu9_-1phKLFgshYDvh6Vwt5f1LqE52i1dC.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUu9_-1phKLFgshYDvh6Vwt5f1LqEZ2i1dC.woff2',
				greek:
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUu9_-1phKLFgshYDvh6Vwt5f1LqEl2i1dC.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUu9_-1phKLFgshYDvh6Vwt5f1LqEV2i1dC.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUu9_-1phKLFgshYDvh6Vwt5f1LqER2i1dC.woff2',
				latin:
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUu9_-1phKLFgshYDvh6Vwt5f1LqEp2iw.woff2',
			},
			'900': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUu9_-1phKLFgshYDvh6Vwt5dlKqEd2i1dC.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUu9_-1phKLFgshYDvh6Vwt5dlKqE52i1dC.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUu9_-1phKLFgshYDvh6Vwt5dlKqEZ2i1dC.woff2',
				greek:
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUu9_-1phKLFgshYDvh6Vwt5dlKqEl2i1dC.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUu9_-1phKLFgshYDvh6Vwt5dlKqEV2i1dC.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUu9_-1phKLFgshYDvh6Vwt5dlKqER2i1dC.woff2',
				latin:
					'https://fonts.gstatic.com/s/alegreyasans/v24/5aUu9_-1phKLFgshYDvh6Vwt5dlKqEp2iw.woff2',
			},
		},
	},
});

export const fontFamily = 'Alegreya Sans' as const;

type Variants = {
	italic: {
		weights: '100' | '300' | '400' | '500' | '700' | '800' | '900';
		subsets:
			| 'cyrillic'
			| 'cyrillic-ext'
			| 'greek'
			| 'greek-ext'
			| 'latin'
			| 'latin-ext'
			| 'vietnamese';
	};
	normal: {
		weights: '100' | '300' | '400' | '500' | '700' | '800' | '900';
		subsets:
			| 'cyrillic'
			| 'cyrillic-ext'
			| 'greek'
			| 'greek-ext'
			| 'latin'
			| 'latin-ext'
			| 'vietnamese';
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
