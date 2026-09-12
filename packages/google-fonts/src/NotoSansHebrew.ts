import {loadFonts, loadVariableFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Noto Sans Hebrew',
	importName: 'NotoSansHebrew',
	version: 'v50',
	url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Hebrew:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900',
	unicodeRanges: {
		'cyrillic-ext':
			'U+0460-052F, U+1C80-1C8A, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F',
		'greek-ext': 'U+1F00-1FFF',
		hebrew:
			'U+0307-0308, U+0590-05FF, U+200C-2010, U+20AA, U+25CC, U+FB1D-FB4F',
		'latin-ext':
			'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'100': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/notosanshebrew/v50/or30Q7v33eiDljA1IufXTtVf7V6RvEEdhQlk0LlGxCyaePiZTNzENg.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/notosanshebrew/v50/or30Q7v33eiDljA1IufXTtVf7V6RvEEdhQlk0LlGxCyaePiYTNzENg.woff2',
				hebrew:
					'https://fonts.gstatic.com/s/notosanshebrew/v50/or30Q7v33eiDljA1IufXTtVf7V6RvEEdhQlk0LlGxCyaePiWTNzENg.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosanshebrew/v50/or30Q7v33eiDljA1IufXTtVf7V6RvEEdhQlk0LlGxCyaePiaTNzENg.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosanshebrew/v50/or30Q7v33eiDljA1IufXTtVf7V6RvEEdhQlk0LlGxCyaePiUTNw.woff2',
			},
			'200': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/notosanshebrew/v50/or30Q7v33eiDljA1IufXTtVf7V6RvEEdhQlk0LlGxCyaePiZTNzENg.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/notosanshebrew/v50/or30Q7v33eiDljA1IufXTtVf7V6RvEEdhQlk0LlGxCyaePiYTNzENg.woff2',
				hebrew:
					'https://fonts.gstatic.com/s/notosanshebrew/v50/or30Q7v33eiDljA1IufXTtVf7V6RvEEdhQlk0LlGxCyaePiWTNzENg.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosanshebrew/v50/or30Q7v33eiDljA1IufXTtVf7V6RvEEdhQlk0LlGxCyaePiaTNzENg.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosanshebrew/v50/or30Q7v33eiDljA1IufXTtVf7V6RvEEdhQlk0LlGxCyaePiUTNw.woff2',
			},
			'300': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/notosanshebrew/v50/or30Q7v33eiDljA1IufXTtVf7V6RvEEdhQlk0LlGxCyaePiZTNzENg.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/notosanshebrew/v50/or30Q7v33eiDljA1IufXTtVf7V6RvEEdhQlk0LlGxCyaePiYTNzENg.woff2',
				hebrew:
					'https://fonts.gstatic.com/s/notosanshebrew/v50/or30Q7v33eiDljA1IufXTtVf7V6RvEEdhQlk0LlGxCyaePiWTNzENg.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosanshebrew/v50/or30Q7v33eiDljA1IufXTtVf7V6RvEEdhQlk0LlGxCyaePiaTNzENg.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosanshebrew/v50/or30Q7v33eiDljA1IufXTtVf7V6RvEEdhQlk0LlGxCyaePiUTNw.woff2',
			},
			'400': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/notosanshebrew/v50/or30Q7v33eiDljA1IufXTtVf7V6RvEEdhQlk0LlGxCyaePiZTNzENg.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/notosanshebrew/v50/or30Q7v33eiDljA1IufXTtVf7V6RvEEdhQlk0LlGxCyaePiYTNzENg.woff2',
				hebrew:
					'https://fonts.gstatic.com/s/notosanshebrew/v50/or30Q7v33eiDljA1IufXTtVf7V6RvEEdhQlk0LlGxCyaePiWTNzENg.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosanshebrew/v50/or30Q7v33eiDljA1IufXTtVf7V6RvEEdhQlk0LlGxCyaePiaTNzENg.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosanshebrew/v50/or30Q7v33eiDljA1IufXTtVf7V6RvEEdhQlk0LlGxCyaePiUTNw.woff2',
			},
			'500': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/notosanshebrew/v50/or30Q7v33eiDljA1IufXTtVf7V6RvEEdhQlk0LlGxCyaePiZTNzENg.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/notosanshebrew/v50/or30Q7v33eiDljA1IufXTtVf7V6RvEEdhQlk0LlGxCyaePiYTNzENg.woff2',
				hebrew:
					'https://fonts.gstatic.com/s/notosanshebrew/v50/or30Q7v33eiDljA1IufXTtVf7V6RvEEdhQlk0LlGxCyaePiWTNzENg.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosanshebrew/v50/or30Q7v33eiDljA1IufXTtVf7V6RvEEdhQlk0LlGxCyaePiaTNzENg.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosanshebrew/v50/or30Q7v33eiDljA1IufXTtVf7V6RvEEdhQlk0LlGxCyaePiUTNw.woff2',
			},
			'600': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/notosanshebrew/v50/or30Q7v33eiDljA1IufXTtVf7V6RvEEdhQlk0LlGxCyaePiZTNzENg.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/notosanshebrew/v50/or30Q7v33eiDljA1IufXTtVf7V6RvEEdhQlk0LlGxCyaePiYTNzENg.woff2',
				hebrew:
					'https://fonts.gstatic.com/s/notosanshebrew/v50/or30Q7v33eiDljA1IufXTtVf7V6RvEEdhQlk0LlGxCyaePiWTNzENg.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosanshebrew/v50/or30Q7v33eiDljA1IufXTtVf7V6RvEEdhQlk0LlGxCyaePiaTNzENg.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosanshebrew/v50/or30Q7v33eiDljA1IufXTtVf7V6RvEEdhQlk0LlGxCyaePiUTNw.woff2',
			},
			'700': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/notosanshebrew/v50/or30Q7v33eiDljA1IufXTtVf7V6RvEEdhQlk0LlGxCyaePiZTNzENg.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/notosanshebrew/v50/or30Q7v33eiDljA1IufXTtVf7V6RvEEdhQlk0LlGxCyaePiYTNzENg.woff2',
				hebrew:
					'https://fonts.gstatic.com/s/notosanshebrew/v50/or30Q7v33eiDljA1IufXTtVf7V6RvEEdhQlk0LlGxCyaePiWTNzENg.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosanshebrew/v50/or30Q7v33eiDljA1IufXTtVf7V6RvEEdhQlk0LlGxCyaePiaTNzENg.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosanshebrew/v50/or30Q7v33eiDljA1IufXTtVf7V6RvEEdhQlk0LlGxCyaePiUTNw.woff2',
			},
			'800': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/notosanshebrew/v50/or30Q7v33eiDljA1IufXTtVf7V6RvEEdhQlk0LlGxCyaePiZTNzENg.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/notosanshebrew/v50/or30Q7v33eiDljA1IufXTtVf7V6RvEEdhQlk0LlGxCyaePiYTNzENg.woff2',
				hebrew:
					'https://fonts.gstatic.com/s/notosanshebrew/v50/or30Q7v33eiDljA1IufXTtVf7V6RvEEdhQlk0LlGxCyaePiWTNzENg.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosanshebrew/v50/or30Q7v33eiDljA1IufXTtVf7V6RvEEdhQlk0LlGxCyaePiaTNzENg.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosanshebrew/v50/or30Q7v33eiDljA1IufXTtVf7V6RvEEdhQlk0LlGxCyaePiUTNw.woff2',
			},
			'900': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/notosanshebrew/v50/or30Q7v33eiDljA1IufXTtVf7V6RvEEdhQlk0LlGxCyaePiZTNzENg.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/notosanshebrew/v50/or30Q7v33eiDljA1IufXTtVf7V6RvEEdhQlk0LlGxCyaePiYTNzENg.woff2',
				hebrew:
					'https://fonts.gstatic.com/s/notosanshebrew/v50/or30Q7v33eiDljA1IufXTtVf7V6RvEEdhQlk0LlGxCyaePiWTNzENg.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosanshebrew/v50/or30Q7v33eiDljA1IufXTtVf7V6RvEEdhQlk0LlGxCyaePiaTNzENg.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosanshebrew/v50/or30Q7v33eiDljA1IufXTtVf7V6RvEEdhQlk0LlGxCyaePiUTNw.woff2',
			},
		},
	},
	subsets: ['cyrillic-ext', 'greek-ext', 'hebrew', 'latin', 'latin-ext'],
	variable: {
		axes: {
			wdth: {
				min: 62.5,
				max: 100,
			},
			wght: {
				min: 100,
				max: 900,
			},
		},
		fontFaces: [
			{
				style: 'normal',
				weight: '100 900',
				stretch: '62.5% 100%',
				subset: 'cyrillic-ext',
				unicodeRange:
					'U+0460-052F, U+1C80-1C8A, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F',
				src: 'https://fonts.gstatic.com/s/notosanshebrew/v50/or35Q7v33eiDljA1IufXTtVf7V6RlkA1aNn0.woff2',
			},
			{
				style: 'normal',
				weight: '100 900',
				stretch: '62.5% 100%',
				subset: 'greek-ext',
				unicodeRange: 'U+1F00-1FFF',
				src: 'https://fonts.gstatic.com/s/notosanshebrew/v50/or35Q7v33eiDljA1IufXTtVf7V6RlkE1aNn0.woff2',
			},
			{
				style: 'normal',
				weight: '100 900',
				stretch: '62.5% 100%',
				subset: 'hebrew',
				unicodeRange:
					'U+0307-0308, U+0590-05FF, U+200C-2010, U+20AA, U+25CC, U+FB1D-FB4F',
				src: 'https://fonts.gstatic.com/s/notosanshebrew/v50/or35Q7v33eiDljA1IufXTtVf7V6Rlk81aNn0.woff2',
			},
			{
				style: 'normal',
				weight: '100 900',
				stretch: '62.5% 100%',
				subset: 'latin-ext',
				unicodeRange:
					'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
				src: 'https://fonts.gstatic.com/s/notosanshebrew/v50/or35Q7v33eiDljA1IufXTtVf7V6RlkM1aNn0.woff2',
			},
			{
				style: 'normal',
				weight: '100 900',
				stretch: '62.5% 100%',
				subset: 'latin',
				unicodeRange:
					'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
				src: 'https://fonts.gstatic.com/s/notosanshebrew/v50/or35Q7v33eiDljA1IufXTtVf7V6Rlk01aA.woff2',
			},
		],
		url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Hebrew:wdth,wght@62.5..100,100..900',
	},
});

export const fontFamily = 'Noto Sans Hebrew' as const;

type Variants = {
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
		subsets: 'cyrillic-ext' | 'greek-ext' | 'hebrew' | 'latin' | 'latin-ext';
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
	normal: {
		subsets: 'cyrillic-ext' | 'greek-ext' | 'hebrew' | 'latin' | 'latin-ext';
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
