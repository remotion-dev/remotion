import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'IBM Plex Sans Thai',
	importName: 'IBMPlexSansThai',
	version: 'v10',
	url: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Thai:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700',
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
					'https://fonts.gstatic.com/s/ibmplexsansthai/v10/m8JNje1VVIzcq1HzJq2AEdo2Tj_qvLqEauYvTcd6Ug.woff2',
				thai: 'https://fonts.gstatic.com/s/ibmplexsansthai/v10/m8JNje1VVIzcq1HzJq2AEdo2Tj_qvLqEauY2Tcd6Ug.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ibmplexsansthai/v10/m8JNje1VVIzcq1HzJq2AEdo2Tj_qvLqEauYsTcd6Ug.woff2',
				latin:
					'https://fonts.gstatic.com/s/ibmplexsansthai/v10/m8JNje1VVIzcq1HzJq2AEdo2Tj_qvLqEauYiTcc.woff2',
			},
			'200': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/ibmplexsansthai/v10/m8JMje1VVIzcq1HzJq2AEdo2Tj_qvLqExvc1Z-JHa74.woff2',
				thai: 'https://fonts.gstatic.com/s/ibmplexsansthai/v10/m8JMje1VVIzcq1HzJq2AEdo2Tj_qvLqExvc1fuJHa74.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ibmplexsansthai/v10/m8JMje1VVIzcq1HzJq2AEdo2Tj_qvLqExvc1ZOJHa74.woff2',
				latin:
					'https://fonts.gstatic.com/s/ibmplexsansthai/v10/m8JMje1VVIzcq1HzJq2AEdo2Tj_qvLqExvc1auJH.woff2',
			},
			'300': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/ibmplexsansthai/v10/m8JMje1VVIzcq1HzJq2AEdo2Tj_qvLqEovQ1Z-JHa74.woff2',
				thai: 'https://fonts.gstatic.com/s/ibmplexsansthai/v10/m8JMje1VVIzcq1HzJq2AEdo2Tj_qvLqEovQ1fuJHa74.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ibmplexsansthai/v10/m8JMje1VVIzcq1HzJq2AEdo2Tj_qvLqEovQ1ZOJHa74.woff2',
				latin:
					'https://fonts.gstatic.com/s/ibmplexsansthai/v10/m8JMje1VVIzcq1HzJq2AEdo2Tj_qvLqEovQ1auJH.woff2',
			},
			'400': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/ibmplexsansthai/v10/m8JPje1VVIzcq1HzJq2AEdo2Tj_qvLqMBNYgVcM.woff2',
				thai: 'https://fonts.gstatic.com/s/ibmplexsansthai/v10/m8JPje1VVIzcq1HzJq2AEdo2Tj_qvLqMHdYgVcM.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ibmplexsansthai/v10/m8JPje1VVIzcq1HzJq2AEdo2Tj_qvLqMB9YgVcM.woff2',
				latin:
					'https://fonts.gstatic.com/s/ibmplexsansthai/v10/m8JPje1VVIzcq1HzJq2AEdo2Tj_qvLqMCdYg.woff2',
			},
			'500': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/ibmplexsansthai/v10/m8JMje1VVIzcq1HzJq2AEdo2Tj_qvLqE-vU1Z-JHa74.woff2',
				thai: 'https://fonts.gstatic.com/s/ibmplexsansthai/v10/m8JMje1VVIzcq1HzJq2AEdo2Tj_qvLqE-vU1fuJHa74.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ibmplexsansthai/v10/m8JMje1VVIzcq1HzJq2AEdo2Tj_qvLqE-vU1ZOJHa74.woff2',
				latin:
					'https://fonts.gstatic.com/s/ibmplexsansthai/v10/m8JMje1VVIzcq1HzJq2AEdo2Tj_qvLqE-vU1auJH.woff2',
			},
			'600': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/ibmplexsansthai/v10/m8JMje1VVIzcq1HzJq2AEdo2Tj_qvLqE1vI1Z-JHa74.woff2',
				thai: 'https://fonts.gstatic.com/s/ibmplexsansthai/v10/m8JMje1VVIzcq1HzJq2AEdo2Tj_qvLqE1vI1fuJHa74.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ibmplexsansthai/v10/m8JMje1VVIzcq1HzJq2AEdo2Tj_qvLqE1vI1ZOJHa74.woff2',
				latin:
					'https://fonts.gstatic.com/s/ibmplexsansthai/v10/m8JMje1VVIzcq1HzJq2AEdo2Tj_qvLqE1vI1auJH.woff2',
			},
			'700': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/ibmplexsansthai/v10/m8JMje1VVIzcq1HzJq2AEdo2Tj_qvLqEsvM1Z-JHa74.woff2',
				thai: 'https://fonts.gstatic.com/s/ibmplexsansthai/v10/m8JMje1VVIzcq1HzJq2AEdo2Tj_qvLqEsvM1fuJHa74.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/ibmplexsansthai/v10/m8JMje1VVIzcq1HzJq2AEdo2Tj_qvLqEsvM1ZOJHa74.woff2',
				latin:
					'https://fonts.gstatic.com/s/ibmplexsansthai/v10/m8JMje1VVIzcq1HzJq2AEdo2Tj_qvLqEsvM1auJH.woff2',
			},
		},
	},
});

export const fontFamily = 'IBM Plex Sans Thai' as const;

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
