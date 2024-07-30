import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Fira Sans',
	importName: 'FiraSans',
	version: 'v17',
	url: 'https://fonts.googleapis.com/css2?family=Fira+Sans:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900',
	unicodeRanges: {
		'cyrillic-ext':
			'U+0460-052F, U+1C80-1C88, U+20B4, U+2DE0-2DFF, U+A640-A69F, U+FE2E-FE2F',
		cyrillic: 'U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116',
		'greek-ext': 'U+1F00-1FFF',
		greek:
			'U+0370-0377, U+037A-037F, U+0384-038A, U+038C, U+038E-03A1, U+03A3-03FF',
		vietnamese:
			'U+0102-0103, U+0110-0111, U+0128-0129, U+0168-0169, U+01A0-01A1, U+01AF-01B0, U+0300-0301, U+0303-0304, U+0308-0309, U+0323, U+0329, U+1EA0-1EF9, U+20AB',
		'latin-ext':
			'U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
		latin:
			'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
	},
	fonts: {
		italic: {
			'100': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/firasans/v17/va9A4kDNxMZdWfMOD5VvkrCqUT3fcWTP.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/firasans/v17/va9A4kDNxMZdWfMOD5VvkrCqUTTfcWTP.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/firasans/v17/va9A4kDNxMZdWfMOD5VvkrCqUTzfcWTP.woff2',
				greek:
					'https://fonts.gstatic.com/s/firasans/v17/va9A4kDNxMZdWfMOD5VvkrCqUTPfcWTP.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/firasans/v17/va9A4kDNxMZdWfMOD5VvkrCqUT_fcWTP.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/firasans/v17/va9A4kDNxMZdWfMOD5VvkrCqUT7fcWTP.woff2',
				latin:
					'https://fonts.gstatic.com/s/firasans/v17/va9A4kDNxMZdWfMOD5VvkrCqUTDfcQ.woff2',
			},
			'200': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/firasans/v17/va9f4kDNxMZdWfMOD5VvkrAGQCf1VFn2lg.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/firasans/v17/va9f4kDNxMZdWfMOD5VvkrAGQCf8VFn2lg.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/firasans/v17/va9f4kDNxMZdWfMOD5VvkrAGQCf0VFn2lg.woff2',
				greek:
					'https://fonts.gstatic.com/s/firasans/v17/va9f4kDNxMZdWfMOD5VvkrAGQCf7VFn2lg.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/firasans/v17/va9f4kDNxMZdWfMOD5VvkrAGQCf3VFn2lg.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/firasans/v17/va9f4kDNxMZdWfMOD5VvkrAGQCf2VFn2lg.woff2',
				latin:
					'https://fonts.gstatic.com/s/firasans/v17/va9f4kDNxMZdWfMOD5VvkrAGQCf4VFk.woff2',
			},
			'300': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/firasans/v17/va9f4kDNxMZdWfMOD5VvkrBiQyf1VFn2lg.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/firasans/v17/va9f4kDNxMZdWfMOD5VvkrBiQyf8VFn2lg.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/firasans/v17/va9f4kDNxMZdWfMOD5VvkrBiQyf0VFn2lg.woff2',
				greek:
					'https://fonts.gstatic.com/s/firasans/v17/va9f4kDNxMZdWfMOD5VvkrBiQyf7VFn2lg.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/firasans/v17/va9f4kDNxMZdWfMOD5VvkrBiQyf3VFn2lg.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/firasans/v17/va9f4kDNxMZdWfMOD5VvkrBiQyf2VFn2lg.woff2',
				latin:
					'https://fonts.gstatic.com/s/firasans/v17/va9f4kDNxMZdWfMOD5VvkrBiQyf4VFk.woff2',
			},
			'400': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/firasans/v17/va9C4kDNxMZdWfMOD5VvkrjEYTLHdQ.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/firasans/v17/va9C4kDNxMZdWfMOD5VvkrjNYTLHdQ.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/firasans/v17/va9C4kDNxMZdWfMOD5VvkrjFYTLHdQ.woff2',
				greek:
					'https://fonts.gstatic.com/s/firasans/v17/va9C4kDNxMZdWfMOD5VvkrjKYTLHdQ.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/firasans/v17/va9C4kDNxMZdWfMOD5VvkrjGYTLHdQ.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/firasans/v17/va9C4kDNxMZdWfMOD5VvkrjHYTLHdQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/firasans/v17/va9C4kDNxMZdWfMOD5VvkrjJYTI.woff2',
			},
			'500': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/firasans/v17/va9f4kDNxMZdWfMOD5VvkrA6Qif1VFn2lg.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/firasans/v17/va9f4kDNxMZdWfMOD5VvkrA6Qif8VFn2lg.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/firasans/v17/va9f4kDNxMZdWfMOD5VvkrA6Qif0VFn2lg.woff2',
				greek:
					'https://fonts.gstatic.com/s/firasans/v17/va9f4kDNxMZdWfMOD5VvkrA6Qif7VFn2lg.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/firasans/v17/va9f4kDNxMZdWfMOD5VvkrA6Qif3VFn2lg.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/firasans/v17/va9f4kDNxMZdWfMOD5VvkrA6Qif2VFn2lg.woff2',
				latin:
					'https://fonts.gstatic.com/s/firasans/v17/va9f4kDNxMZdWfMOD5VvkrA6Qif4VFk.woff2',
			},
			'600': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/firasans/v17/va9f4kDNxMZdWfMOD5VvkrAWRSf1VFn2lg.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/firasans/v17/va9f4kDNxMZdWfMOD5VvkrAWRSf8VFn2lg.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/firasans/v17/va9f4kDNxMZdWfMOD5VvkrAWRSf0VFn2lg.woff2',
				greek:
					'https://fonts.gstatic.com/s/firasans/v17/va9f4kDNxMZdWfMOD5VvkrAWRSf7VFn2lg.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/firasans/v17/va9f4kDNxMZdWfMOD5VvkrAWRSf3VFn2lg.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/firasans/v17/va9f4kDNxMZdWfMOD5VvkrAWRSf2VFn2lg.woff2',
				latin:
					'https://fonts.gstatic.com/s/firasans/v17/va9f4kDNxMZdWfMOD5VvkrAWRSf4VFk.woff2',
			},
			'700': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/firasans/v17/va9f4kDNxMZdWfMOD5VvkrByRCf1VFn2lg.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/firasans/v17/va9f4kDNxMZdWfMOD5VvkrByRCf8VFn2lg.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/firasans/v17/va9f4kDNxMZdWfMOD5VvkrByRCf0VFn2lg.woff2',
				greek:
					'https://fonts.gstatic.com/s/firasans/v17/va9f4kDNxMZdWfMOD5VvkrByRCf7VFn2lg.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/firasans/v17/va9f4kDNxMZdWfMOD5VvkrByRCf3VFn2lg.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/firasans/v17/va9f4kDNxMZdWfMOD5VvkrByRCf2VFn2lg.woff2',
				latin:
					'https://fonts.gstatic.com/s/firasans/v17/va9f4kDNxMZdWfMOD5VvkrByRCf4VFk.woff2',
			},
			'800': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/firasans/v17/va9f4kDNxMZdWfMOD5VvkrBuRyf1VFn2lg.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/firasans/v17/va9f4kDNxMZdWfMOD5VvkrBuRyf8VFn2lg.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/firasans/v17/va9f4kDNxMZdWfMOD5VvkrBuRyf0VFn2lg.woff2',
				greek:
					'https://fonts.gstatic.com/s/firasans/v17/va9f4kDNxMZdWfMOD5VvkrBuRyf7VFn2lg.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/firasans/v17/va9f4kDNxMZdWfMOD5VvkrBuRyf3VFn2lg.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/firasans/v17/va9f4kDNxMZdWfMOD5VvkrBuRyf2VFn2lg.woff2',
				latin:
					'https://fonts.gstatic.com/s/firasans/v17/va9f4kDNxMZdWfMOD5VvkrBuRyf4VFk.woff2',
			},
			'900': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/firasans/v17/va9f4kDNxMZdWfMOD5VvkrBKRif1VFn2lg.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/firasans/v17/va9f4kDNxMZdWfMOD5VvkrBKRif8VFn2lg.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/firasans/v17/va9f4kDNxMZdWfMOD5VvkrBKRif0VFn2lg.woff2',
				greek:
					'https://fonts.gstatic.com/s/firasans/v17/va9f4kDNxMZdWfMOD5VvkrBKRif7VFn2lg.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/firasans/v17/va9f4kDNxMZdWfMOD5VvkrBKRif3VFn2lg.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/firasans/v17/va9f4kDNxMZdWfMOD5VvkrBKRif2VFn2lg.woff2',
				latin:
					'https://fonts.gstatic.com/s/firasans/v17/va9f4kDNxMZdWfMOD5VvkrBKRif4VFk.woff2',
			},
		},
		normal: {
			'100': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/firasans/v17/va9C4kDNxMZdWfMOD5Vn9LjEYTLHdQ.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/firasans/v17/va9C4kDNxMZdWfMOD5Vn9LjNYTLHdQ.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/firasans/v17/va9C4kDNxMZdWfMOD5Vn9LjFYTLHdQ.woff2',
				greek:
					'https://fonts.gstatic.com/s/firasans/v17/va9C4kDNxMZdWfMOD5Vn9LjKYTLHdQ.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/firasans/v17/va9C4kDNxMZdWfMOD5Vn9LjGYTLHdQ.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/firasans/v17/va9C4kDNxMZdWfMOD5Vn9LjHYTLHdQ.woff2',
				latin:
					'https://fonts.gstatic.com/s/firasans/v17/va9C4kDNxMZdWfMOD5Vn9LjJYTI.woff2',
			},
			'200': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/firasans/v17/va9B4kDNxMZdWfMOD5VnWKneSxf6TF0.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/firasans/v17/va9B4kDNxMZdWfMOD5VnWKneQhf6TF0.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/firasans/v17/va9B4kDNxMZdWfMOD5VnWKneShf6TF0.woff2',
				greek:
					'https://fonts.gstatic.com/s/firasans/v17/va9B4kDNxMZdWfMOD5VnWKneRRf6TF0.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/firasans/v17/va9B4kDNxMZdWfMOD5VnWKneSRf6TF0.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/firasans/v17/va9B4kDNxMZdWfMOD5VnWKneSBf6TF0.woff2',
				latin:
					'https://fonts.gstatic.com/s/firasans/v17/va9B4kDNxMZdWfMOD5VnWKneRhf6.woff2',
			},
			'300': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/firasans/v17/va9B4kDNxMZdWfMOD5VnPKreSxf6TF0.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/firasans/v17/va9B4kDNxMZdWfMOD5VnPKreQhf6TF0.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/firasans/v17/va9B4kDNxMZdWfMOD5VnPKreShf6TF0.woff2',
				greek:
					'https://fonts.gstatic.com/s/firasans/v17/va9B4kDNxMZdWfMOD5VnPKreRRf6TF0.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/firasans/v17/va9B4kDNxMZdWfMOD5VnPKreSRf6TF0.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/firasans/v17/va9B4kDNxMZdWfMOD5VnPKreSBf6TF0.woff2',
				latin:
					'https://fonts.gstatic.com/s/firasans/v17/va9B4kDNxMZdWfMOD5VnPKreRhf6.woff2',
			},
			'400': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/firasans/v17/va9E4kDNxMZdWfMOD5VvmojLeTY.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/firasans/v17/va9E4kDNxMZdWfMOD5Vvk4jLeTY.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/firasans/v17/va9E4kDNxMZdWfMOD5Vvm4jLeTY.woff2',
				greek:
					'https://fonts.gstatic.com/s/firasans/v17/va9E4kDNxMZdWfMOD5VvlIjLeTY.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/firasans/v17/va9E4kDNxMZdWfMOD5VvmIjLeTY.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/firasans/v17/va9E4kDNxMZdWfMOD5VvmYjLeTY.woff2',
				latin:
					'https://fonts.gstatic.com/s/firasans/v17/va9E4kDNxMZdWfMOD5Vvl4jL.woff2',
			},
			'500': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/firasans/v17/va9B4kDNxMZdWfMOD5VnZKveSxf6TF0.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/firasans/v17/va9B4kDNxMZdWfMOD5VnZKveQhf6TF0.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/firasans/v17/va9B4kDNxMZdWfMOD5VnZKveShf6TF0.woff2',
				greek:
					'https://fonts.gstatic.com/s/firasans/v17/va9B4kDNxMZdWfMOD5VnZKveRRf6TF0.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/firasans/v17/va9B4kDNxMZdWfMOD5VnZKveSRf6TF0.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/firasans/v17/va9B4kDNxMZdWfMOD5VnZKveSBf6TF0.woff2',
				latin:
					'https://fonts.gstatic.com/s/firasans/v17/va9B4kDNxMZdWfMOD5VnZKveRhf6.woff2',
			},
			'600': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/firasans/v17/va9B4kDNxMZdWfMOD5VnSKzeSxf6TF0.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/firasans/v17/va9B4kDNxMZdWfMOD5VnSKzeQhf6TF0.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/firasans/v17/va9B4kDNxMZdWfMOD5VnSKzeShf6TF0.woff2',
				greek:
					'https://fonts.gstatic.com/s/firasans/v17/va9B4kDNxMZdWfMOD5VnSKzeRRf6TF0.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/firasans/v17/va9B4kDNxMZdWfMOD5VnSKzeSRf6TF0.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/firasans/v17/va9B4kDNxMZdWfMOD5VnSKzeSBf6TF0.woff2',
				latin:
					'https://fonts.gstatic.com/s/firasans/v17/va9B4kDNxMZdWfMOD5VnSKzeRhf6.woff2',
			},
			'700': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/firasans/v17/va9B4kDNxMZdWfMOD5VnLK3eSxf6TF0.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/firasans/v17/va9B4kDNxMZdWfMOD5VnLK3eQhf6TF0.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/firasans/v17/va9B4kDNxMZdWfMOD5VnLK3eShf6TF0.woff2',
				greek:
					'https://fonts.gstatic.com/s/firasans/v17/va9B4kDNxMZdWfMOD5VnLK3eRRf6TF0.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/firasans/v17/va9B4kDNxMZdWfMOD5VnLK3eSRf6TF0.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/firasans/v17/va9B4kDNxMZdWfMOD5VnLK3eSBf6TF0.woff2',
				latin:
					'https://fonts.gstatic.com/s/firasans/v17/va9B4kDNxMZdWfMOD5VnLK3eRhf6.woff2',
			},
			'800': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/firasans/v17/va9B4kDNxMZdWfMOD5VnMK7eSxf6TF0.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/firasans/v17/va9B4kDNxMZdWfMOD5VnMK7eQhf6TF0.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/firasans/v17/va9B4kDNxMZdWfMOD5VnMK7eShf6TF0.woff2',
				greek:
					'https://fonts.gstatic.com/s/firasans/v17/va9B4kDNxMZdWfMOD5VnMK7eRRf6TF0.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/firasans/v17/va9B4kDNxMZdWfMOD5VnMK7eSRf6TF0.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/firasans/v17/va9B4kDNxMZdWfMOD5VnMK7eSBf6TF0.woff2',
				latin:
					'https://fonts.gstatic.com/s/firasans/v17/va9B4kDNxMZdWfMOD5VnMK7eRhf6.woff2',
			},
			'900': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/firasans/v17/va9B4kDNxMZdWfMOD5VnFK_eSxf6TF0.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/firasans/v17/va9B4kDNxMZdWfMOD5VnFK_eQhf6TF0.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/firasans/v17/va9B4kDNxMZdWfMOD5VnFK_eShf6TF0.woff2',
				greek:
					'https://fonts.gstatic.com/s/firasans/v17/va9B4kDNxMZdWfMOD5VnFK_eRRf6TF0.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/firasans/v17/va9B4kDNxMZdWfMOD5VnFK_eSRf6TF0.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/firasans/v17/va9B4kDNxMZdWfMOD5VnFK_eSBf6TF0.woff2',
				latin:
					'https://fonts.gstatic.com/s/firasans/v17/va9B4kDNxMZdWfMOD5VnFK_eRhf6.woff2',
			},
		},
	},
});

export const fontFamily = 'Fira Sans' as const;

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
		subsets:
			| 'cyrillic'
			| 'cyrillic-ext'
			| 'greek'
			| 'greek-ext'
			| 'latin'
			| 'latin-ext'
			| 'vietnamese';
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
		subsets:
			| 'cyrillic'
			| 'cyrillic-ext'
			| 'greek'
			| 'greek-ext'
			| 'latin'
			| 'latin-ext'
			| 'vietnamese';
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
