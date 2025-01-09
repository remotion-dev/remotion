import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'IBM Plex Sans Thai Looped',
	importName: 'IBMPlexSansThaiLooped',
	version: 'v11',
	url: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai+Looped:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700',
	unicodeRanges: {
		'cyrillic-ext':
			'U+0460-052F, U+1C80-1C88, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F',
		thai: 'U+0E01-0E5B, U+200C-200D, U+25CC',
		'latin-ext':
			'U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'100': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/ibmplexsansthailooped/v11/tss5AoJJRAhL3BTrK3r2xxbFhvKfyBB6l7hHT30L_Ha6rnmsJCQ.woff2',
				thai: 'https://fonts.gstatic.com/s/ibmplexsansthailooped/v11/tss5AoJJRAhL3BTrK3r2xxbFhvKfyBB6l7hHT30L_Ha6t3msJCQ.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ibmplexsansthailooped/v11/tss5AoJJRAhL3BTrK3r2xxbFhvKfyBB6l7hHT30L_Ha6rXmsJCQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/ibmplexsansthailooped/v11/tss5AoJJRAhL3BTrK3r2xxbFhvKfyBB6l7hHT30L_Ha6o3ms.woff2',
			},
			'200': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/ibmplexsansthailooped/v11/tss6AoJJRAhL3BTrK3r2xxbFhvKfyBB6l7hHT30L_NqrtFOJGR0i.woff2',
				thai: 'https://fonts.gstatic.com/s/ibmplexsansthailooped/v11/tss6AoJJRAhL3BTrK3r2xxbFhvKfyBB6l7hHT30L_NqrtEqJGR0i.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ibmplexsansthailooped/v11/tss6AoJJRAhL3BTrK3r2xxbFhvKfyBB6l7hHT30L_NqrtFCJGR0i.woff2',
				latin:
					'https://fonts.gstatic.com/s/ibmplexsansthailooped/v11/tss6AoJJRAhL3BTrK3r2xxbFhvKfyBB6l7hHT30L_NqrtF6JGQ.woff2',
			},
			'300': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/ibmplexsansthailooped/v11/tss6AoJJRAhL3BTrK3r2xxbFhvKfyBB6l7hHT30L_L6otFOJGR0i.woff2',
				thai: 'https://fonts.gstatic.com/s/ibmplexsansthailooped/v11/tss6AoJJRAhL3BTrK3r2xxbFhvKfyBB6l7hHT30L_L6otEqJGR0i.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ibmplexsansthailooped/v11/tss6AoJJRAhL3BTrK3r2xxbFhvKfyBB6l7hHT30L_L6otFCJGR0i.woff2',
				latin:
					'https://fonts.gstatic.com/s/ibmplexsansthailooped/v11/tss6AoJJRAhL3BTrK3r2xxbFhvKfyBB6l7hHT30L_L6otF6JGQ.woff2',
			},
			'400': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/ibmplexsansthailooped/v11/tss_AoJJRAhL3BTrK3r2xxbFhvKfyBB6l7hHT30L9BiKoWGo.woff2',
				thai: 'https://fonts.gstatic.com/s/ibmplexsansthailooped/v11/tss_AoJJRAhL3BTrK3r2xxbFhvKfyBB6l7hHT30L9AGKoWGo.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ibmplexsansthailooped/v11/tss_AoJJRAhL3BTrK3r2xxbFhvKfyBB6l7hHT30L9BuKoWGo.woff2',
				latin:
					'https://fonts.gstatic.com/s/ibmplexsansthailooped/v11/tss_AoJJRAhL3BTrK3r2xxbFhvKfyBB6l7hHT30L9BWKoQ.woff2',
			},
			'500': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/ibmplexsansthailooped/v11/tss6AoJJRAhL3BTrK3r2xxbFhvKfyBB6l7hHT30L_OaptFOJGR0i.woff2',
				thai: 'https://fonts.gstatic.com/s/ibmplexsansthailooped/v11/tss6AoJJRAhL3BTrK3r2xxbFhvKfyBB6l7hHT30L_OaptEqJGR0i.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ibmplexsansthailooped/v11/tss6AoJJRAhL3BTrK3r2xxbFhvKfyBB6l7hHT30L_OaptFCJGR0i.woff2',
				latin:
					'https://fonts.gstatic.com/s/ibmplexsansthailooped/v11/tss6AoJJRAhL3BTrK3r2xxbFhvKfyBB6l7hHT30L_OaptF6JGQ.woff2',
			},
			'600': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/ibmplexsansthailooped/v11/tss6AoJJRAhL3BTrK3r2xxbFhvKfyBB6l7hHT30L_MqutFOJGR0i.woff2',
				thai: 'https://fonts.gstatic.com/s/ibmplexsansthailooped/v11/tss6AoJJRAhL3BTrK3r2xxbFhvKfyBB6l7hHT30L_MqutEqJGR0i.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ibmplexsansthailooped/v11/tss6AoJJRAhL3BTrK3r2xxbFhvKfyBB6l7hHT30L_MqutFCJGR0i.woff2',
				latin:
					'https://fonts.gstatic.com/s/ibmplexsansthailooped/v11/tss6AoJJRAhL3BTrK3r2xxbFhvKfyBB6l7hHT30L_MqutF6JGQ.woff2',
			},
			'700': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/ibmplexsansthailooped/v11/tss6AoJJRAhL3BTrK3r2xxbFhvKfyBB6l7hHT30L_K6vtFOJGR0i.woff2',
				thai: 'https://fonts.gstatic.com/s/ibmplexsansthailooped/v11/tss6AoJJRAhL3BTrK3r2xxbFhvKfyBB6l7hHT30L_K6vtEqJGR0i.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ibmplexsansthailooped/v11/tss6AoJJRAhL3BTrK3r2xxbFhvKfyBB6l7hHT30L_K6vtFCJGR0i.woff2',
				latin:
					'https://fonts.gstatic.com/s/ibmplexsansthailooped/v11/tss6AoJJRAhL3BTrK3r2xxbFhvKfyBB6l7hHT30L_K6vtF6JGQ.woff2',
			},
		},
	},
});

export const fontFamily = 'IBM Plex Sans Thai Looped' as const;

type Variants = {
	normal: {
		weights: '100' | '200' | '300' | '400' | '500' | '600' | '700';
		subsets: 'cyrillic-ext' | 'latin' | 'latin-ext' | 'thai';
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
