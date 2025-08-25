import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Intel One Mono',
	importName: 'IntelOneMono',
	version: 'v2',
	url: 'https://fonts.googleapis.com/css2?family=Intel+One+Mono:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400;1,500;1,600;1,700',
	unicodeRanges: {
		symbols2: 'U+2000-2001, U+2004-2008, U+200A, U+23B8-23BD, U+2500-259F',
		vietnamese:
			'U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB',
		'latin-ext':
			'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		italic: {
			'300': {
				symbols2:
					'https://fonts.gstatic.com/s/intelonemono/v2/P5sUzZuLY8Lb_G1RikFkwPjBvsk1H4RE8-pZ5gQ1abSn3wXqO5y6WSQ.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/intelonemono/v2/P5sUzZuLY8Lb_G1RikFkwPjBvsk1H4RE8-pZ5gQ1abSn3wVfGrmHYA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/intelonemono/v2/P5sUzZuLY8Lb_G1RikFkwPjBvsk1H4RE8-pZ5gQ1abSn3wVeGrmHYA.woff2',
				latin:
					'https://fonts.gstatic.com/s/intelonemono/v2/P5sUzZuLY8Lb_G1RikFkwPjBvsk1H4RE8-pZ5gQ1abSn3wVQGrk.woff2',
			},
			'400': {
				symbols2:
					'https://fonts.gstatic.com/s/intelonemono/v2/P5sUzZuLY8Lb_G1RikFkwPjBvsk1H4RE8-pZ5gQ1abT53wXqO5y6WSQ.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/intelonemono/v2/P5sUzZuLY8Lb_G1RikFkwPjBvsk1H4RE8-pZ5gQ1abT53wVfGrmHYA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/intelonemono/v2/P5sUzZuLY8Lb_G1RikFkwPjBvsk1H4RE8-pZ5gQ1abT53wVeGrmHYA.woff2',
				latin:
					'https://fonts.gstatic.com/s/intelonemono/v2/P5sUzZuLY8Lb_G1RikFkwPjBvsk1H4RE8-pZ5gQ1abT53wVQGrk.woff2',
			},
			'500': {
				symbols2:
					'https://fonts.gstatic.com/s/intelonemono/v2/P5sUzZuLY8Lb_G1RikFkwPjBvsk1H4RE8-pZ5gQ1abTL3wXqO5y6WSQ.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/intelonemono/v2/P5sUzZuLY8Lb_G1RikFkwPjBvsk1H4RE8-pZ5gQ1abTL3wVfGrmHYA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/intelonemono/v2/P5sUzZuLY8Lb_G1RikFkwPjBvsk1H4RE8-pZ5gQ1abTL3wVeGrmHYA.woff2',
				latin:
					'https://fonts.gstatic.com/s/intelonemono/v2/P5sUzZuLY8Lb_G1RikFkwPjBvsk1H4RE8-pZ5gQ1abTL3wVQGrk.woff2',
			},
			'600': {
				symbols2:
					'https://fonts.gstatic.com/s/intelonemono/v2/P5sUzZuLY8Lb_G1RikFkwPjBvsk1H4RE8-pZ5gQ1abQn2AXqO5y6WSQ.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/intelonemono/v2/P5sUzZuLY8Lb_G1RikFkwPjBvsk1H4RE8-pZ5gQ1abQn2AVfGrmHYA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/intelonemono/v2/P5sUzZuLY8Lb_G1RikFkwPjBvsk1H4RE8-pZ5gQ1abQn2AVeGrmHYA.woff2',
				latin:
					'https://fonts.gstatic.com/s/intelonemono/v2/P5sUzZuLY8Lb_G1RikFkwPjBvsk1H4RE8-pZ5gQ1abQn2AVQGrk.woff2',
			},
			'700': {
				symbols2:
					'https://fonts.gstatic.com/s/intelonemono/v2/P5sUzZuLY8Lb_G1RikFkwPjBvsk1H4RE8-pZ5gQ1abQe2AXqO5y6WSQ.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/intelonemono/v2/P5sUzZuLY8Lb_G1RikFkwPjBvsk1H4RE8-pZ5gQ1abQe2AVfGrmHYA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/intelonemono/v2/P5sUzZuLY8Lb_G1RikFkwPjBvsk1H4RE8-pZ5gQ1abQe2AVeGrmHYA.woff2',
				latin:
					'https://fonts.gstatic.com/s/intelonemono/v2/P5sUzZuLY8Lb_G1RikFkwPjBvsk1H4RE8-pZ5gQ1abQe2AVQGrk.woff2',
			},
		},
		normal: {
			'300': {
				symbols2:
					'https://fonts.gstatic.com/s/intelonemono/v2/P5sWzZuLY8Lb_G1RikFkwPjBvuM8LXucmoHDSAMg__chIRR3P4S-.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/intelonemono/v2/P5sWzZuLY8Lb_G1RikFkwPjBvuM8LXucmoHDSAMg__chlDVSAr0.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/intelonemono/v2/P5sWzZuLY8Lb_G1RikFkwPjBvuM8LXucmoHDSAMg__chlTVSAr0.woff2',
				latin:
					'https://fonts.gstatic.com/s/intelonemono/v2/P5sWzZuLY8Lb_G1RikFkwPjBvuM8LXucmoHDSAMg__chmzVS.woff2',
			},
			'400': {
				symbols2:
					'https://fonts.gstatic.com/s/intelonemono/v2/P5sWzZuLY8Lb_G1RikFkwPjBvuM8LXucmoHDSAMgofchIRR3P4S-.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/intelonemono/v2/P5sWzZuLY8Lb_G1RikFkwPjBvuM8LXucmoHDSAMgofchlDVSAr0.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/intelonemono/v2/P5sWzZuLY8Lb_G1RikFkwPjBvuM8LXucmoHDSAMgofchlTVSAr0.woff2',
				latin:
					'https://fonts.gstatic.com/s/intelonemono/v2/P5sWzZuLY8Lb_G1RikFkwPjBvuM8LXucmoHDSAMgofchmzVS.woff2',
			},
			'500': {
				symbols2:
					'https://fonts.gstatic.com/s/intelonemono/v2/P5sWzZuLY8Lb_G1RikFkwPjBvuM8LXucmoHDSAMgk_chIRR3P4S-.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/intelonemono/v2/P5sWzZuLY8Lb_G1RikFkwPjBvuM8LXucmoHDSAMgk_chlDVSAr0.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/intelonemono/v2/P5sWzZuLY8Lb_G1RikFkwPjBvuM8LXucmoHDSAMgk_chlTVSAr0.woff2',
				latin:
					'https://fonts.gstatic.com/s/intelonemono/v2/P5sWzZuLY8Lb_G1RikFkwPjBvuM8LXucmoHDSAMgk_chmzVS.woff2',
			},
			'600': {
				symbols2:
					'https://fonts.gstatic.com/s/intelonemono/v2/P5sWzZuLY8Lb_G1RikFkwPjBvuM8LXucmoHDSAMgf_AhIRR3P4S-.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/intelonemono/v2/P5sWzZuLY8Lb_G1RikFkwPjBvuM8LXucmoHDSAMgf_AhlDVSAr0.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/intelonemono/v2/P5sWzZuLY8Lb_G1RikFkwPjBvuM8LXucmoHDSAMgf_AhlTVSAr0.woff2',
				latin:
					'https://fonts.gstatic.com/s/intelonemono/v2/P5sWzZuLY8Lb_G1RikFkwPjBvuM8LXucmoHDSAMgf_AhmzVS.woff2',
			},
			'700': {
				symbols2:
					'https://fonts.gstatic.com/s/intelonemono/v2/P5sWzZuLY8Lb_G1RikFkwPjBvuM8LXucmoHDSAMgRvAhIRR3P4S-.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/intelonemono/v2/P5sWzZuLY8Lb_G1RikFkwPjBvuM8LXucmoHDSAMgRvAhlDVSAr0.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/intelonemono/v2/P5sWzZuLY8Lb_G1RikFkwPjBvuM8LXucmoHDSAMgRvAhlTVSAr0.woff2',
				latin:
					'https://fonts.gstatic.com/s/intelonemono/v2/P5sWzZuLY8Lb_G1RikFkwPjBvuM8LXucmoHDSAMgRvAhmzVS.woff2',
			},
		},
	},
	subsets: ['latin', 'latin-ext', 'symbols2', 'vietnamese'],
});

export const fontFamily = 'Intel One Mono' as const;

type Variants = {
	italic: {
		weights: '300' | '400' | '500' | '600' | '700';
		subsets: 'latin' | 'latin-ext' | 'symbols2' | 'vietnamese';
	};
	normal: {
		weights: '300' | '400' | '500' | '600' | '700';
		subsets: 'latin' | 'latin-ext' | 'symbols2' | 'vietnamese';
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
