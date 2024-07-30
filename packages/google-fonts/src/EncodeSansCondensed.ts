import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Encode Sans Condensed',
	importName: 'EncodeSansCondensed',
	version: 'v10',
	url: 'https://fonts.googleapis.com/css2?family=Encode+Sans+Condensed:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900',
	unicodeRanges: {
		vietnamese:
			'U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB',
		'latin-ext':
			'U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		normal: {
			'100': {
				vietnamese:
					'https://fonts.gstatic.com/s/encodesanscondensed/v10/j8_76_LD37rqfuwxyIuaZhE6cRXOLtm2gfT-5Z-BJws1Iw.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/encodesanscondensed/v10/j8_76_LD37rqfuwxyIuaZhE6cRXOLtm2gfT-5Z-AJws1Iw.woff2',
				latin:
					'https://fonts.gstatic.com/s/encodesanscondensed/v10/j8_76_LD37rqfuwxyIuaZhE6cRXOLtm2gfT-5Z-OJws.woff2',
			},
			'200': {
				vietnamese:
					'https://fonts.gstatic.com/s/encodesanscondensed/v10/j8_46_LD37rqfuwxyIuaZhE6cRXOLtm2gfT-SY6ZDy4IGns.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/encodesanscondensed/v10/j8_46_LD37rqfuwxyIuaZhE6cRXOLtm2gfT-SY6ZDi4IGns.woff2',
				latin:
					'https://fonts.gstatic.com/s/encodesanscondensed/v10/j8_46_LD37rqfuwxyIuaZhE6cRXOLtm2gfT-SY6ZAC4I.woff2',
			},
			'300': {
				vietnamese:
					'https://fonts.gstatic.com/s/encodesanscondensed/v10/j8_46_LD37rqfuwxyIuaZhE6cRXOLtm2gfT-LY2ZDy4IGns.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/encodesanscondensed/v10/j8_46_LD37rqfuwxyIuaZhE6cRXOLtm2gfT-LY2ZDi4IGns.woff2',
				latin:
					'https://fonts.gstatic.com/s/encodesanscondensed/v10/j8_46_LD37rqfuwxyIuaZhE6cRXOLtm2gfT-LY2ZAC4I.woff2',
			},
			'400': {
				vietnamese:
					'https://fonts.gstatic.com/s/encodesanscondensed/v10/j8_16_LD37rqfuwxyIuaZhE6cRXOLtm2gfT2ia-MPw8.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/encodesanscondensed/v10/j8_16_LD37rqfuwxyIuaZhE6cRXOLtm2gfT2iK-MPw8.woff2',
				latin:
					'https://fonts.gstatic.com/s/encodesanscondensed/v10/j8_16_LD37rqfuwxyIuaZhE6cRXOLtm2gfT2hq-M.woff2',
			},
			'500': {
				vietnamese:
					'https://fonts.gstatic.com/s/encodesanscondensed/v10/j8_46_LD37rqfuwxyIuaZhE6cRXOLtm2gfT-dYyZDy4IGns.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/encodesanscondensed/v10/j8_46_LD37rqfuwxyIuaZhE6cRXOLtm2gfT-dYyZDi4IGns.woff2',
				latin:
					'https://fonts.gstatic.com/s/encodesanscondensed/v10/j8_46_LD37rqfuwxyIuaZhE6cRXOLtm2gfT-dYyZAC4I.woff2',
			},
			'600': {
				vietnamese:
					'https://fonts.gstatic.com/s/encodesanscondensed/v10/j8_46_LD37rqfuwxyIuaZhE6cRXOLtm2gfT-WYuZDy4IGns.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/encodesanscondensed/v10/j8_46_LD37rqfuwxyIuaZhE6cRXOLtm2gfT-WYuZDi4IGns.woff2',
				latin:
					'https://fonts.gstatic.com/s/encodesanscondensed/v10/j8_46_LD37rqfuwxyIuaZhE6cRXOLtm2gfT-WYuZAC4I.woff2',
			},
			'700': {
				vietnamese:
					'https://fonts.gstatic.com/s/encodesanscondensed/v10/j8_46_LD37rqfuwxyIuaZhE6cRXOLtm2gfT-PYqZDy4IGns.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/encodesanscondensed/v10/j8_46_LD37rqfuwxyIuaZhE6cRXOLtm2gfT-PYqZDi4IGns.woff2',
				latin:
					'https://fonts.gstatic.com/s/encodesanscondensed/v10/j8_46_LD37rqfuwxyIuaZhE6cRXOLtm2gfT-PYqZAC4I.woff2',
			},
			'800': {
				vietnamese:
					'https://fonts.gstatic.com/s/encodesanscondensed/v10/j8_46_LD37rqfuwxyIuaZhE6cRXOLtm2gfT-IYmZDy4IGns.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/encodesanscondensed/v10/j8_46_LD37rqfuwxyIuaZhE6cRXOLtm2gfT-IYmZDi4IGns.woff2',
				latin:
					'https://fonts.gstatic.com/s/encodesanscondensed/v10/j8_46_LD37rqfuwxyIuaZhE6cRXOLtm2gfT-IYmZAC4I.woff2',
			},
			'900': {
				vietnamese:
					'https://fonts.gstatic.com/s/encodesanscondensed/v10/j8_46_LD37rqfuwxyIuaZhE6cRXOLtm2gfT-BYiZDy4IGns.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/encodesanscondensed/v10/j8_46_LD37rqfuwxyIuaZhE6cRXOLtm2gfT-BYiZDi4IGns.woff2',
				latin:
					'https://fonts.gstatic.com/s/encodesanscondensed/v10/j8_46_LD37rqfuwxyIuaZhE6cRXOLtm2gfT-BYiZAC4I.woff2',
			},
		},
	},
});

export const fontFamily = 'Encode Sans Condensed' as const;

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
		subsets: 'latin' | 'latin-ext' | 'vietnamese';
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
