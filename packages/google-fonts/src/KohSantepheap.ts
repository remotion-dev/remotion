import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Koh Santepheap',
	importName: 'KohSantepheap',
	version: 'v11',
	url: 'https://fonts.googleapis.com/css2?family=Koh+Santepheap:ital,wght@0,100;0,300;0,400;0,700;0,900',
	unicodeRanges: {
		khmer: 'U+1780-17FF, U+19E0-19FF, U+200C-200D, U+25CC',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'100': {
				khmer:
					'https://fonts.gstatic.com/s/kohsantepheap/v11/gNMfW3p6SJbwyGj2rBZyeOrTjNuFLVCZtwNJ.woff2',
				latin:
					'https://fonts.gstatic.com/s/kohsantepheap/v11/gNMfW3p6SJbwyGj2rBZyeOrTjNuFLVuZtw.woff2',
			},
			'300': {
				khmer:
					'https://fonts.gstatic.com/s/kohsantepheap/v11/gNMeW3p6SJbwyGj2rBZyeOrTjNtNP0y1kj5wSA.woff2',
				latin:
					'https://fonts.gstatic.com/s/kohsantepheap/v11/gNMeW3p6SJbwyGj2rBZyeOrTjNtNP0y-kj4.woff2',
			},
			'400': {
				khmer:
					'https://fonts.gstatic.com/s/kohsantepheap/v11/gNMdW3p6SJbwyGj2rBZyeOrTjNPtHVmBsw.woff2',
				latin:
					'https://fonts.gstatic.com/s/kohsantepheap/v11/gNMdW3p6SJbwyGj2rBZyeOrTjNPmHVk.woff2',
			},
			'700': {
				khmer:
					'https://fonts.gstatic.com/s/kohsantepheap/v11/gNMeW3p6SJbwyGj2rBZyeOrTjNtdOEy1kj5wSA.woff2',
				latin:
					'https://fonts.gstatic.com/s/kohsantepheap/v11/gNMeW3p6SJbwyGj2rBZyeOrTjNtdOEy-kj4.woff2',
			},
			'900': {
				khmer:
					'https://fonts.gstatic.com/s/kohsantepheap/v11/gNMeW3p6SJbwyGj2rBZyeOrTjNtlOky1kj5wSA.woff2',
				latin:
					'https://fonts.gstatic.com/s/kohsantepheap/v11/gNMeW3p6SJbwyGj2rBZyeOrTjNtlOky-kj4.woff2',
			},
		},
	},
});

export const fontFamily = 'Koh Santepheap' as const;

type Variants = {
	normal: {
		weights: '100' | '300' | '400' | '700' | '900';
		subsets: 'khmer' | 'latin';
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
