import {loadFonts, loadVariableFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'DM Sans',
	importName: 'DMSans',
	version: 'v17',
	url: 'https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900',
	unicodeRanges: {
		'latin-ext':
			'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C4, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		italic: {
			'100': {
				'latin-ext':
					'https://fonts.gstatic.com/l/font?kit=rP28p2ywxg089UriCZaSExd86J3t9jz86Mvy4qCRAL19DksVat-JDA_4ZJbROmk_4j2pDgP_Bjuq&skey=3320fd60b11c3775&v=v17',
				latin:
					'https://fonts.gstatic.com/l/font?kit=rP28p2ywxg089UriCZaSExd86J3t9jz86Mvy4qCRAL19DksVat-JDA_4ZJbROmk_4j2pDgP_CDuq&skey=3320fd60b11c3775&v=v17',
			},
			'200': {
				'latin-ext':
					'https://fonts.gstatic.com/l/font?kit=rP28p2ywxg089UriCZaSExd86J3t9jz86Mvy4qCRAL19DksVat-JDA_4ZJbROmk_4j2pDgP_Bjuq&skey=3320fd60b11c3775&v=v17',
				latin:
					'https://fonts.gstatic.com/l/font?kit=rP28p2ywxg089UriCZaSExd86J3t9jz86Mvy4qCRAL19DksVat-JDA_4ZJbROmk_4j2pDgP_CDuq&skey=3320fd60b11c3775&v=v17',
			},
			'300': {
				'latin-ext':
					'https://fonts.gstatic.com/l/font?kit=rP28p2ywxg089UriCZaSExd86J3t9jz86Mvy4qCRAL19DksVat-JDA_4ZJbROmk_4j2pDgP_Bjuq&skey=3320fd60b11c3775&v=v17',
				latin:
					'https://fonts.gstatic.com/l/font?kit=rP28p2ywxg089UriCZaSExd86J3t9jz86Mvy4qCRAL19DksVat-JDA_4ZJbROmk_4j2pDgP_CDuq&skey=3320fd60b11c3775&v=v17',
			},
			'400': {
				'latin-ext':
					'https://fonts.gstatic.com/l/font?kit=rP28p2ywxg089UriCZaSExd86J3t9jz86Mvy4qCRAL19DksVat-JDA_4ZJbROmk_4j2pDgP_Bjuq&skey=3320fd60b11c3775&v=v17',
				latin:
					'https://fonts.gstatic.com/l/font?kit=rP28p2ywxg089UriCZaSExd86J3t9jz86Mvy4qCRAL19DksVat-JDA_4ZJbROmk_4j2pDgP_CDuq&skey=3320fd60b11c3775&v=v17',
			},
			'500': {
				'latin-ext':
					'https://fonts.gstatic.com/l/font?kit=rP28p2ywxg089UriCZaSExd86J3t9jz86Mvy4qCRAL19DksVat-JDA_4ZJbROmk_4j2pDgP_Bjuq&skey=3320fd60b11c3775&v=v17',
				latin:
					'https://fonts.gstatic.com/l/font?kit=rP28p2ywxg089UriCZaSExd86J3t9jz86Mvy4qCRAL19DksVat-JDA_4ZJbROmk_4j2pDgP_CDuq&skey=3320fd60b11c3775&v=v17',
			},
			'600': {
				'latin-ext':
					'https://fonts.gstatic.com/l/font?kit=rP28p2ywxg089UriCZaSExd86J3t9jz86Mvy4qCRAL19DksVat-JDA_4ZJbROmk_4j2pDgP_Bjuq&skey=3320fd60b11c3775&v=v17',
				latin:
					'https://fonts.gstatic.com/l/font?kit=rP28p2ywxg089UriCZaSExd86J3t9jz86Mvy4qCRAL19DksVat-JDA_4ZJbROmk_4j2pDgP_CDuq&skey=3320fd60b11c3775&v=v17',
			},
			'700': {
				'latin-ext':
					'https://fonts.gstatic.com/l/font?kit=rP28p2ywxg089UriCZaSExd86J3t9jz86Mvy4qCRAL19DksVat-JDA_4ZJbROmk_4j2pDgP_Bjuq&skey=3320fd60b11c3775&v=v17',
				latin:
					'https://fonts.gstatic.com/l/font?kit=rP28p2ywxg089UriCZaSExd86J3t9jz86Mvy4qCRAL19DksVat-JDA_4ZJbROmk_4j2pDgP_CDuq&skey=3320fd60b11c3775&v=v17',
			},
			'800': {
				'latin-ext':
					'https://fonts.gstatic.com/l/font?kit=rP28p2ywxg089UriCZaSExd86J3t9jz86Mvy4qCRAL19DksVat-JDA_4ZJbROmk_4j2pDgP_Bjuq&skey=3320fd60b11c3775&v=v17',
				latin:
					'https://fonts.gstatic.com/l/font?kit=rP28p2ywxg089UriCZaSExd86J3t9jz86Mvy4qCRAL19DksVat-JDA_4ZJbROmk_4j2pDgP_CDuq&skey=3320fd60b11c3775&v=v17',
			},
			'900': {
				'latin-ext':
					'https://fonts.gstatic.com/l/font?kit=rP28p2ywxg089UriCZaSExd86J3t9jz86Mvy4qCRAL19DksVat-JDA_4ZJbROmk_4j2pDgP_Bjuq&skey=3320fd60b11c3775&v=v17',
				latin:
					'https://fonts.gstatic.com/l/font?kit=rP28p2ywxg089UriCZaSExd86J3t9jz86Mvy4qCRAL19DksVat-JDA_4ZJbROmk_4j2pDgP_CDuq&skey=3320fd60b11c3775&v=v17',
			},
		},
		normal: {
			'100': {
				'latin-ext':
					'https://fonts.gstatic.com/l/font?kit=rP2-p2ywxg089UriI5-g4vlH9VoD8CmcqZG40F9JadbnoEwAop0DRUUHvP-6oMc491ztf07PCg&skey=cd068b3e1b767e51&v=v17',
				latin:
					'https://fonts.gstatic.com/l/font?kit=rP2-p2ywxg089UriI5-g4vlH9VoD8CmcqZG40F9JadbnoEwAop0DRUUHvP-6oMc491ztf0DPCg&skey=cd068b3e1b767e51&v=v17',
			},
			'200': {
				'latin-ext':
					'https://fonts.gstatic.com/l/font?kit=rP2-p2ywxg089UriI5-g4vlH9VoD8CmcqZG40F9JadbnoEwAop0DRUUHvP-6oMc491ztf07PCg&skey=cd068b3e1b767e51&v=v17',
				latin:
					'https://fonts.gstatic.com/l/font?kit=rP2-p2ywxg089UriI5-g4vlH9VoD8CmcqZG40F9JadbnoEwAop0DRUUHvP-6oMc491ztf0DPCg&skey=cd068b3e1b767e51&v=v17',
			},
			'300': {
				'latin-ext':
					'https://fonts.gstatic.com/l/font?kit=rP2-p2ywxg089UriI5-g4vlH9VoD8CmcqZG40F9JadbnoEwAop0DRUUHvP-6oMc491ztf07PCg&skey=cd068b3e1b767e51&v=v17',
				latin:
					'https://fonts.gstatic.com/l/font?kit=rP2-p2ywxg089UriI5-g4vlH9VoD8CmcqZG40F9JadbnoEwAop0DRUUHvP-6oMc491ztf0DPCg&skey=cd068b3e1b767e51&v=v17',
			},
			'400': {
				'latin-ext':
					'https://fonts.gstatic.com/l/font?kit=rP2-p2ywxg089UriI5-g4vlH9VoD8CmcqZG40F9JadbnoEwAop0DRUUHvP-6oMc491ztf07PCg&skey=cd068b3e1b767e51&v=v17',
				latin:
					'https://fonts.gstatic.com/l/font?kit=rP2-p2ywxg089UriI5-g4vlH9VoD8CmcqZG40F9JadbnoEwAop0DRUUHvP-6oMc491ztf0DPCg&skey=cd068b3e1b767e51&v=v17',
			},
			'500': {
				'latin-ext':
					'https://fonts.gstatic.com/l/font?kit=rP2-p2ywxg089UriI5-g4vlH9VoD8CmcqZG40F9JadbnoEwAop0DRUUHvP-6oMc491ztf07PCg&skey=cd068b3e1b767e51&v=v17',
				latin:
					'https://fonts.gstatic.com/l/font?kit=rP2-p2ywxg089UriI5-g4vlH9VoD8CmcqZG40F9JadbnoEwAop0DRUUHvP-6oMc491ztf0DPCg&skey=cd068b3e1b767e51&v=v17',
			},
			'600': {
				'latin-ext':
					'https://fonts.gstatic.com/l/font?kit=rP2-p2ywxg089UriI5-g4vlH9VoD8CmcqZG40F9JadbnoEwAop0DRUUHvP-6oMc491ztf07PCg&skey=cd068b3e1b767e51&v=v17',
				latin:
					'https://fonts.gstatic.com/l/font?kit=rP2-p2ywxg089UriI5-g4vlH9VoD8CmcqZG40F9JadbnoEwAop0DRUUHvP-6oMc491ztf0DPCg&skey=cd068b3e1b767e51&v=v17',
			},
			'700': {
				'latin-ext':
					'https://fonts.gstatic.com/l/font?kit=rP2-p2ywxg089UriI5-g4vlH9VoD8CmcqZG40F9JadbnoEwAop0DRUUHvP-6oMc491ztf07PCg&skey=cd068b3e1b767e51&v=v17',
				latin:
					'https://fonts.gstatic.com/l/font?kit=rP2-p2ywxg089UriI5-g4vlH9VoD8CmcqZG40F9JadbnoEwAop0DRUUHvP-6oMc491ztf0DPCg&skey=cd068b3e1b767e51&v=v17',
			},
			'800': {
				'latin-ext':
					'https://fonts.gstatic.com/l/font?kit=rP2-p2ywxg089UriI5-g4vlH9VoD8CmcqZG40F9JadbnoEwAop0DRUUHvP-6oMc491ztf07PCg&skey=cd068b3e1b767e51&v=v17',
				latin:
					'https://fonts.gstatic.com/l/font?kit=rP2-p2ywxg089UriI5-g4vlH9VoD8CmcqZG40F9JadbnoEwAop0DRUUHvP-6oMc491ztf0DPCg&skey=cd068b3e1b767e51&v=v17',
			},
			'900': {
				'latin-ext':
					'https://fonts.gstatic.com/l/font?kit=rP2-p2ywxg089UriI5-g4vlH9VoD8CmcqZG40F9JadbnoEwAop0DRUUHvP-6oMc491ztf07PCg&skey=cd068b3e1b767e51&v=v17',
				latin:
					'https://fonts.gstatic.com/l/font?kit=rP2-p2ywxg089UriI5-g4vlH9VoD8CmcqZG40F9JadbnoEwAop0DRUUHvP-6oMc491ztf0DPCg&skey=cd068b3e1b767e51&v=v17',
			},
		},
	},
	subsets: ['latin', 'latin-ext'],
	variable: {
		axes: {
			opsz: {
				min: 9,
				max: 40,
			},
			wght: {
				min: 100,
				max: 1000,
			},
		},
		fontFaces: [
			{
				style: 'italic',
				weight: '100 1000',
				stretch: null,
				subset: 'latin-ext',
				unicodeRange:
					'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C4, U+2113, U+2C60-2C7F, U+A720-A7FF',
				src: 'https://fonts.gstatic.com/s/dmsans/v17/rP2Fp2ywxg089UriCZa4ET-DNl0.woff2',
			},
			{
				style: 'italic',
				weight: '100 1000',
				stretch: null,
				subset: 'latin',
				unicodeRange:
					'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
				src: 'https://fonts.gstatic.com/s/dmsans/v17/rP2Fp2ywxg089UriCZa4Hz-D.woff2',
			},
			{
				style: 'normal',
				weight: '100 1000',
				stretch: null,
				subset: 'latin-ext',
				unicodeRange:
					'U+0100-02BA, U+02BD-02C5, U+02C7-02CC, U+02CE-02D7, U+02DD-02FF, U+0304, U+0308, U+0329, U+1D00-1DBF, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C4, U+2113, U+2C60-2C7F, U+A720-A7FF',
				src: 'https://fonts.gstatic.com/s/dmsans/v17/rP2Hp2ywxg089UriCZ2IHSeH.woff2',
			},
			{
				style: 'normal',
				weight: '100 1000',
				stretch: null,
				subset: 'latin',
				unicodeRange:
					'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
				src: 'https://fonts.gstatic.com/s/dmsans/v17/rP2Hp2ywxg089UriCZOIHQ.woff2',
			},
		],
		url: 'https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,100..1000;1,9..40,100..1000',
	},
});

export const fontFamily = 'DM Sans' as const;

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
		subsets: 'latin' | 'latin-ext';
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
		subsets: 'latin' | 'latin-ext';
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
		subsets: 'latin' | 'latin-ext';
	};
	normal: {
		subsets: 'latin' | 'latin-ext';
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
