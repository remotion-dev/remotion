import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Noto Serif Georgian',
	importName: 'NotoSerifGeorgian',
	version: 'v24',
	url: 'https://fonts.googleapis.com/css2?family=Noto+Serif+Georgian:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900',
	unicodeRanges: {
		georgian: 'U+0589, U+10A0-10FF, U+1C90-1CBA, U+1CBD-1CBF, U+2D00-2D2F',
		'latin-ext':
			'U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'100': {
				georgian:
					'https://fonts.gstatic.com/s/notoserifgeorgian/v26/VEMaRpd8s4nv8hG_qOzL7HOAw4nt0Sl_XxyaEduNMvi7T6Y4ev50sJmasg.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notoserifgeorgian/v26/VEMaRpd8s4nv8hG_qOzL7HOAw4nt0Sl_XxyaEduNMvi7T6Y4ev5lsJmasg.woff2',
				latin:
					'https://fonts.gstatic.com/s/notoserifgeorgian/v26/VEMaRpd8s4nv8hG_qOzL7HOAw4nt0Sl_XxyaEduNMvi7T6Y4ev5rsJk.woff2',
			},
			'200': {
				georgian:
					'https://fonts.gstatic.com/s/notoserifgeorgian/v26/VEMaRpd8s4nv8hG_qOzL7HOAw4nt0Sl_XxyaEduNMvi7T6Y4ev50sJmasg.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notoserifgeorgian/v26/VEMaRpd8s4nv8hG_qOzL7HOAw4nt0Sl_XxyaEduNMvi7T6Y4ev5lsJmasg.woff2',
				latin:
					'https://fonts.gstatic.com/s/notoserifgeorgian/v26/VEMaRpd8s4nv8hG_qOzL7HOAw4nt0Sl_XxyaEduNMvi7T6Y4ev5rsJk.woff2',
			},
			'300': {
				georgian:
					'https://fonts.gstatic.com/s/notoserifgeorgian/v26/VEMaRpd8s4nv8hG_qOzL7HOAw4nt0Sl_XxyaEduNMvi7T6Y4ev50sJmasg.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notoserifgeorgian/v26/VEMaRpd8s4nv8hG_qOzL7HOAw4nt0Sl_XxyaEduNMvi7T6Y4ev5lsJmasg.woff2',
				latin:
					'https://fonts.gstatic.com/s/notoserifgeorgian/v26/VEMaRpd8s4nv8hG_qOzL7HOAw4nt0Sl_XxyaEduNMvi7T6Y4ev5rsJk.woff2',
			},
			'400': {
				georgian:
					'https://fonts.gstatic.com/s/notoserifgeorgian/v26/VEMaRpd8s4nv8hG_qOzL7HOAw4nt0Sl_XxyaEduNMvi7T6Y4ev50sJmasg.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notoserifgeorgian/v26/VEMaRpd8s4nv8hG_qOzL7HOAw4nt0Sl_XxyaEduNMvi7T6Y4ev5lsJmasg.woff2',
				latin:
					'https://fonts.gstatic.com/s/notoserifgeorgian/v26/VEMaRpd8s4nv8hG_qOzL7HOAw4nt0Sl_XxyaEduNMvi7T6Y4ev5rsJk.woff2',
			},
			'500': {
				georgian:
					'https://fonts.gstatic.com/s/notoserifgeorgian/v26/VEMaRpd8s4nv8hG_qOzL7HOAw4nt0Sl_XxyaEduNMvi7T6Y4ev50sJmasg.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notoserifgeorgian/v26/VEMaRpd8s4nv8hG_qOzL7HOAw4nt0Sl_XxyaEduNMvi7T6Y4ev5lsJmasg.woff2',
				latin:
					'https://fonts.gstatic.com/s/notoserifgeorgian/v26/VEMaRpd8s4nv8hG_qOzL7HOAw4nt0Sl_XxyaEduNMvi7T6Y4ev5rsJk.woff2',
			},
			'600': {
				georgian:
					'https://fonts.gstatic.com/s/notoserifgeorgian/v26/VEMaRpd8s4nv8hG_qOzL7HOAw4nt0Sl_XxyaEduNMvi7T6Y4ev50sJmasg.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notoserifgeorgian/v26/VEMaRpd8s4nv8hG_qOzL7HOAw4nt0Sl_XxyaEduNMvi7T6Y4ev5lsJmasg.woff2',
				latin:
					'https://fonts.gstatic.com/s/notoserifgeorgian/v26/VEMaRpd8s4nv8hG_qOzL7HOAw4nt0Sl_XxyaEduNMvi7T6Y4ev5rsJk.woff2',
			},
			'700': {
				georgian:
					'https://fonts.gstatic.com/s/notoserifgeorgian/v26/VEMaRpd8s4nv8hG_qOzL7HOAw4nt0Sl_XxyaEduNMvi7T6Y4ev50sJmasg.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notoserifgeorgian/v26/VEMaRpd8s4nv8hG_qOzL7HOAw4nt0Sl_XxyaEduNMvi7T6Y4ev5lsJmasg.woff2',
				latin:
					'https://fonts.gstatic.com/s/notoserifgeorgian/v26/VEMaRpd8s4nv8hG_qOzL7HOAw4nt0Sl_XxyaEduNMvi7T6Y4ev5rsJk.woff2',
			},
			'800': {
				georgian:
					'https://fonts.gstatic.com/s/notoserifgeorgian/v26/VEMaRpd8s4nv8hG_qOzL7HOAw4nt0Sl_XxyaEduNMvi7T6Y4ev50sJmasg.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notoserifgeorgian/v26/VEMaRpd8s4nv8hG_qOzL7HOAw4nt0Sl_XxyaEduNMvi7T6Y4ev5lsJmasg.woff2',
				latin:
					'https://fonts.gstatic.com/s/notoserifgeorgian/v26/VEMaRpd8s4nv8hG_qOzL7HOAw4nt0Sl_XxyaEduNMvi7T6Y4ev5rsJk.woff2',
			},
			'900': {
				georgian:
					'https://fonts.gstatic.com/s/notoserifgeorgian/v26/VEMaRpd8s4nv8hG_qOzL7HOAw4nt0Sl_XxyaEduNMvi7T6Y4ev50sJmasg.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/notoserifgeorgian/v26/VEMaRpd8s4nv8hG_qOzL7HOAw4nt0Sl_XxyaEduNMvi7T6Y4ev5lsJmasg.woff2',
				latin:
					'https://fonts.gstatic.com/s/notoserifgeorgian/v26/VEMaRpd8s4nv8hG_qOzL7HOAw4nt0Sl_XxyaEduNMvi7T6Y4ev5rsJk.woff2',
			},
		},
	},
});

export const fontFamily = 'Noto Serif Georgian' as const;

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
		subsets: 'georgian' | 'latin' | 'latin-ext';
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
