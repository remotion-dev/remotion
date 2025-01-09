import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Tajawal',
	importName: 'Tajawal',
	version: 'v9',
	url: 'https://fonts.googleapis.com/css2?family=Tajawal:ital,wght@0,200;0,300;0,400;0,500;0,700;0,800;0,900',
	unicodeRanges: {
		arabic:
			'U+0600-06FF, U+0750-077F, U+0870-088E, U+0890-0891, U+0898-08E1, U+08E3-08FF, U+200C-200E, U+2010-2011, U+204F, U+2E41, U+FB50-FDFF, U+FE70-FE74, U+FE76-FEFC, U+102E0-102FB, U+10E60-10E7E, U+10EFD-10EFF, U+1EE00-1EE03, U+1EE05-1EE1F, U+1EE21-1EE22, U+1EE24, U+1EE27, U+1EE29-1EE32, U+1EE34-1EE37, U+1EE39, U+1EE3B, U+1EE42, U+1EE47, U+1EE49, U+1EE4B, U+1EE4D-1EE4F, U+1EE51-1EE52, U+1EE54, U+1EE57, U+1EE59, U+1EE5B, U+1EE5D, U+1EE5F, U+1EE61-1EE62, U+1EE64, U+1EE67-1EE6A, U+1EE6C-1EE72, U+1EE74-1EE77, U+1EE79-1EE7C, U+1EE7E, U+1EE80-1EE89, U+1EE8B-1EE9B, U+1EEA1-1EEA3, U+1EEA5-1EEA9, U+1EEAB-1EEBB, U+1EEF0-1EEF1',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'200': {
				arabic:
					'https://fonts.gstatic.com/s/tajawal/v9/Iurf6YBj_oCad4k1l_6gHrRpiYlJ.woff2',
				latin:
					'https://fonts.gstatic.com/s/tajawal/v9/Iurf6YBj_oCad4k1l_6gHrFpiQ.woff2',
			},
			'300': {
				arabic:
					'https://fonts.gstatic.com/s/tajawal/v9/Iurf6YBj_oCad4k1l5qjHrRpiYlJ.woff2',
				latin:
					'https://fonts.gstatic.com/s/tajawal/v9/Iurf6YBj_oCad4k1l5qjHrFpiQ.woff2',
			},
			'400': {
				arabic:
					'https://fonts.gstatic.com/s/tajawal/v9/Iura6YBj_oCad4k1nzSBC45I.woff2',
				latin:
					'https://fonts.gstatic.com/s/tajawal/v9/Iura6YBj_oCad4k1nzGBCw.woff2',
			},
			'500': {
				arabic:
					'https://fonts.gstatic.com/s/tajawal/v9/Iurf6YBj_oCad4k1l8KiHrRpiYlJ.woff2',
				latin:
					'https://fonts.gstatic.com/s/tajawal/v9/Iurf6YBj_oCad4k1l8KiHrFpiQ.woff2',
			},
			'700': {
				arabic:
					'https://fonts.gstatic.com/s/tajawal/v9/Iurf6YBj_oCad4k1l4qkHrRpiYlJ.woff2',
				latin:
					'https://fonts.gstatic.com/s/tajawal/v9/Iurf6YBj_oCad4k1l4qkHrFpiQ.woff2',
			},
			'800': {
				arabic:
					'https://fonts.gstatic.com/s/tajawal/v9/Iurf6YBj_oCad4k1l5anHrRpiYlJ.woff2',
				latin:
					'https://fonts.gstatic.com/s/tajawal/v9/Iurf6YBj_oCad4k1l5anHrFpiQ.woff2',
			},
			'900': {
				arabic:
					'https://fonts.gstatic.com/s/tajawal/v9/Iurf6YBj_oCad4k1l7KmHrRpiYlJ.woff2',
				latin:
					'https://fonts.gstatic.com/s/tajawal/v9/Iurf6YBj_oCad4k1l7KmHrFpiQ.woff2',
			},
		},
	},
});

export const fontFamily = 'Tajawal' as const;

type Variants = {
	normal: {
		weights: '200' | '300' | '400' | '500' | '700' | '800' | '900';
		subsets: 'arabic' | 'latin';
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
