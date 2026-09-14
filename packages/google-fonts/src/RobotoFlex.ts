import {loadFonts, loadVariableFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Roboto Flex',
	importName: 'RobotoFlex',
	version: 'v30',
	url: 'https://fonts.googleapis.com/css2?family=Roboto+Flex:ital,wght@0,400',
	unicodeRanges: {
		'cyrillic-ext':
			'U+0460-052F, U+1C80-1C8A, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F',
		cyrillic: 'U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116',
		greek:
			'U+0370-0377, U+037A-037F, U+0384-038A, U+038C, U+038E-03A1, U+03A3-03FF',
		vietnamese:
			'U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB',
		'latin-ext':
			'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'400': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/robotoflex/v30/NaNnepOXO_NexZs0b5QrzlOHb8wCikXpYqmZsWI-__OGbt8jZktqc2V3Zs0KvDLdBP8SBZtOs2IifRuUZQMsPJtUsR4DEK6cULNeUx9XgTnH37Ha_FIAp4Fm0PP1hw45DntW2x0wZGzhPmr1YNMYKYn9_1IQXGwJAiUJVUMdN5YUW4O8HtSoXjC1z3QSabshNFVe3e0O5j3ZjrZCu23Qd4G0EBysQNK-QKavMl1cKq3tHXtXi8mzLjaAcbuknRNC.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/robotoflex/v30/NaNnepOXO_NexZs0b5QrzlOHb8wCikXpYqmZsWI-__OGbt8jZktqc2V3Zs0KvDLdBP8SBZtOs2IifRuUZQMsPJtUsR4DEK6cULNeUx9XgTnH37Ha_FIAp4Fm0PP1hw45DntW2x0wZGzhPmr1YNMYKYn9_1IQXGwJAiUJVUMdN5YUW4O8HtSoXjC1z3QSabshNFVe3e0O5j3ZjrZCu23Qd4G0EBysQNK-QKavMl1cKq3tHXtXi8mzLjaAcbKknRNC.woff2',
				greek:
					'https://fonts.gstatic.com/s/robotoflex/v30/NaNnepOXO_NexZs0b5QrzlOHb8wCikXpYqmZsWI-__OGbt8jZktqc2V3Zs0KvDLdBP8SBZtOs2IifRuUZQMsPJtUsR4DEK6cULNeUx9XgTnH37Ha_FIAp4Fm0PP1hw45DntW2x0wZGzhPmr1YNMYKYn9_1IQXGwJAiUJVUMdN5YUW4O8HtSoXjC1z3QSabshNFVe3e0O5j3ZjrZCu23Qd4G0EBysQNK-QKavMl1cKq3tHXtXi8mzLjaAcbWknRNC.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/robotoflex/v30/NaNnepOXO_NexZs0b5QrzlOHb8wCikXpYqmZsWI-__OGbt8jZktqc2V3Zs0KvDLdBP8SBZtOs2IifRuUZQMsPJtUsR4DEK6cULNeUx9XgTnH37Ha_FIAp4Fm0PP1hw45DntW2x0wZGzhPmr1YNMYKYn9_1IQXGwJAiUJVUMdN5YUW4O8HtSoXjC1z3QSabshNFVe3e0O5j3ZjrZCu23Qd4G0EBysQNK-QKavMl1cKq3tHXtXi8mzLjaAcbmknRNC.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/robotoflex/v30/NaNnepOXO_NexZs0b5QrzlOHb8wCikXpYqmZsWI-__OGbt8jZktqc2V3Zs0KvDLdBP8SBZtOs2IifRuUZQMsPJtUsR4DEK6cULNeUx9XgTnH37Ha_FIAp4Fm0PP1hw45DntW2x0wZGzhPmr1YNMYKYn9_1IQXGwJAiUJVUMdN5YUW4O8HtSoXjC1z3QSabshNFVe3e0O5j3ZjrZCu23Qd4G0EBysQNK-QKavMl1cKq3tHXtXi8mzLjaAcbiknRNC.woff2',
				latin:
					'https://fonts.gstatic.com/s/robotoflex/v30/NaNnepOXO_NexZs0b5QrzlOHb8wCikXpYqmZsWI-__OGbt8jZktqc2V3Zs0KvDLdBP8SBZtOs2IifRuUZQMsPJtUsR4DEK6cULNeUx9XgTnH37Ha_FIAp4Fm0PP1hw45DntW2x0wZGzhPmr1YNMYKYn9_1IQXGwJAiUJVUMdN5YUW4O8HtSoXjC1z3QSabshNFVe3e0O5j3ZjrZCu23Qd4G0EBysQNK-QKavMl1cKq3tHXtXi8mzLjaAcbaknQ.woff2',
			},
		},
	},
	subsets: [
		'cyrillic',
		'cyrillic-ext',
		'greek',
		'latin',
		'latin-ext',
		'vietnamese',
	],
	variable: {
		axes: {
			GRAD: {
				min: -200,
				max: 150,
			},
			XOPQ: {
				min: 27,
				max: 175,
			},
			XTRA: {
				min: 323,
				max: 603,
			},
			YOPQ: {
				min: 25,
				max: 135,
			},
			YTAS: {
				min: 649,
				max: 854,
			},
			YTDE: {
				min: -305,
				max: -98,
			},
			YTFI: {
				min: 560,
				max: 788,
			},
			YTLC: {
				min: 416,
				max: 570,
			},
			YTUC: {
				min: 528,
				max: 760,
			},
			opsz: {
				min: 8,
				max: 144,
			},
			slnt: {
				min: -10,
				max: 0,
			},
			wdth: {
				min: 25,
				max: 151,
			},
			wght: {
				min: 100,
				max: 1000,
			},
		},
		fontFaces: [
			{
				style: 'oblique 0deg 10deg',
				weight: '100 1000',
				stretch: '25% 151%',
				subset: 'cyrillic-ext',
				unicodeRange:
					'U+0460-052F, U+1C80-1C8A, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F',
				src: 'https://fonts.gstatic.com/s/robotoflex/v30/NaPccZLOBv5T3oB7Cb4i0zu3RMH-CQ.woff2',
			},
			{
				style: 'oblique 0deg 10deg',
				weight: '100 1000',
				stretch: '25% 151%',
				subset: 'cyrillic',
				unicodeRange: 'U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116',
				src: 'https://fonts.gstatic.com/s/robotoflex/v30/NaPccZLOBv5T3oB7Cb4i0zu-RMH-CQ.woff2',
			},
			{
				style: 'oblique 0deg 10deg',
				weight: '100 1000',
				stretch: '25% 151%',
				subset: 'greek',
				unicodeRange:
					'U+0370-0377, U+037A-037F, U+0384-038A, U+038C, U+038E-03A1, U+03A3-03FF',
				src: 'https://fonts.gstatic.com/s/robotoflex/v30/NaPccZLOBv5T3oB7Cb4i0zu5RMH-CQ.woff2',
			},
			{
				style: 'oblique 0deg 10deg',
				weight: '100 1000',
				stretch: '25% 151%',
				subset: 'vietnamese',
				unicodeRange:
					'U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB',
				src: 'https://fonts.gstatic.com/s/robotoflex/v30/NaPccZLOBv5T3oB7Cb4i0zu1RMH-CQ.woff2',
			},
			{
				style: 'oblique 0deg 10deg',
				weight: '100 1000',
				stretch: '25% 151%',
				subset: 'latin-ext',
				unicodeRange:
					'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
				src: 'https://fonts.gstatic.com/s/robotoflex/v30/NaPccZLOBv5T3oB7Cb4i0zu0RMH-CQ.woff2',
			},
			{
				style: 'oblique 0deg 10deg',
				weight: '100 1000',
				stretch: '25% 151%',
				subset: 'latin',
				unicodeRange:
					'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
				src: 'https://fonts.gstatic.com/s/robotoflex/v30/NaPccZLOBv5T3oB7Cb4i0zu6RME.woff2',
			},
		],
		url: 'https://fonts.googleapis.com/css2?family=Roboto+Flex:GRAD,opsz,slnt,wdth,wght,XOPQ,XTRA,YOPQ,YTAS,YTDE,YTFI,YTLC,YTUC@-200..150,8..144,-10..0,25..151,100..1000,27..175,323..603,25..135,649..854,-305..-98,560..788,416..570,528..760',
	},
});

export const fontFamily = 'Roboto Flex' as const;

type Variants = {
	normal: {
		weights: '400';
		subsets:
			| 'cyrillic'
			| 'cyrillic-ext'
			| 'greek'
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
		ignoreTooManyRequestsWarning?: boolean;
	},
) => {
	return loadFonts(getInfo(), style, options);
};

type VariableVariants = {
	'oblique 0deg 10deg': {
		subsets:
			| 'cyrillic'
			| 'cyrillic-ext'
			| 'greek'
			| 'latin'
			| 'latin-ext'
			| 'vietnamese';
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
