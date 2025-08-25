import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Noto Sans Adlam Unjoined',
	importName: 'NotoSansAdlamUnjoined',
	version: 'v27',
	url: 'https://fonts.googleapis.com/css2?family=Noto+Sans+Adlam+Unjoined:ital,wght@0,400;0,500;0,600;0,700',
	unicodeRanges: {
		adlam:
			'U+061F, U+0640, U+2015, U+201B, U+2020-2021, U+2030, U+204F, U+25CC, U+2E28-2E29, U+2E41, U+1E900-1E95F',
		'latin-ext':
			'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'400': {
				adlam:
					'https://fonts.gstatic.com/s/notosansadlamunjoined/v27/P5sRzY2MYsLRsB5_ildkzPPDsLQXcOEmaFOqOGcwDJQ0pBQ.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosansadlamunjoined/v27/P5sRzY2MYsLRsB5_ildkzPPDsLQXcOEmaFOqOGcwYJQ0pBQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosansadlamunjoined/v27/P5sRzY2MYsLRsB5_ildkzPPDsLQXcOEmaFOqOGcwbpQ0.woff2',
			},
			'500': {
				adlam:
					'https://fonts.gstatic.com/s/notosansadlamunjoined/v27/P5sRzY2MYsLRsB5_ildkzPPDsLQXcOEmaFOqOGcwDJQ0pBQ.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosansadlamunjoined/v27/P5sRzY2MYsLRsB5_ildkzPPDsLQXcOEmaFOqOGcwYJQ0pBQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosansadlamunjoined/v27/P5sRzY2MYsLRsB5_ildkzPPDsLQXcOEmaFOqOGcwbpQ0.woff2',
			},
			'600': {
				adlam:
					'https://fonts.gstatic.com/s/notosansadlamunjoined/v27/P5sRzY2MYsLRsB5_ildkzPPDsLQXcOEmaFOqOGcwDJQ0pBQ.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosansadlamunjoined/v27/P5sRzY2MYsLRsB5_ildkzPPDsLQXcOEmaFOqOGcwYJQ0pBQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosansadlamunjoined/v27/P5sRzY2MYsLRsB5_ildkzPPDsLQXcOEmaFOqOGcwbpQ0.woff2',
			},
			'700': {
				adlam:
					'https://fonts.gstatic.com/s/notosansadlamunjoined/v27/P5sRzY2MYsLRsB5_ildkzPPDsLQXcOEmaFOqOGcwDJQ0pBQ.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notosansadlamunjoined/v27/P5sRzY2MYsLRsB5_ildkzPPDsLQXcOEmaFOqOGcwYJQ0pBQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/notosansadlamunjoined/v27/P5sRzY2MYsLRsB5_ildkzPPDsLQXcOEmaFOqOGcwbpQ0.woff2',
			},
		},
	},
	subsets: ['adlam', 'latin', 'latin-ext'],
});

export const fontFamily = 'Noto Sans Adlam Unjoined' as const;

type Variants = {
	normal: {
		weights: '400' | '500' | '600' | '700';
		subsets: 'adlam' | 'latin' | 'latin-ext';
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
