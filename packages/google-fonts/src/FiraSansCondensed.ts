import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Fira Sans Condensed',
	importName: 'FiraSansCondensed',
	version: 'v10',
	url: 'https://fonts.googleapis.com/css2?family=Fira+Sans+Condensed:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900',
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
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOtEADFm8hSaQTFG18FErVhsC9x-tarUfPVzNNeVxtijA.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOtEADFm8hSaQTFG18FErVhsC9x-tarUfPVzNNXVxtijA.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOtEADFm8hSaQTFG18FErVhsC9x-tarUfPVzNNfVxtijA.woff2',
				greek:
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOtEADFm8hSaQTFG18FErVhsC9x-tarUfPVzNNQVxtijA.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOtEADFm8hSaQTFG18FErVhsC9x-tarUfPVzNNcVxtijA.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOtEADFm8hSaQTFG18FErVhsC9x-tarUfPVzNNdVxtijA.woff2',
				latin:
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOtEADFm8hSaQTFG18FErVhsC9x-tarUfPVzNNTVxs.woff2',
			},
			'200': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOuEADFm8hSaQTFG18FErVhsC9x-tarUfPVYMJEfT5ftY4.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOuEADFm8hSaQTFG18FErVhsC9x-tarUfPVYMJEdD5ftY4.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOuEADFm8hSaQTFG18FErVhsC9x-tarUfPVYMJEfD5ftY4.woff2',
				greek:
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOuEADFm8hSaQTFG18FErVhsC9x-tarUfPVYMJEcz5ftY4.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOuEADFm8hSaQTFG18FErVhsC9x-tarUfPVYMJEfz5ftY4.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOuEADFm8hSaQTFG18FErVhsC9x-tarUfPVYMJEfj5ftY4.woff2',
				latin:
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOuEADFm8hSaQTFG18FErVhsC9x-tarUfPVYMJEcD5f.woff2',
			},
			'300': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOuEADFm8hSaQTFG18FErVhsC9x-tarUfPVBMFEfT5ftY4.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOuEADFm8hSaQTFG18FErVhsC9x-tarUfPVBMFEdD5ftY4.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOuEADFm8hSaQTFG18FErVhsC9x-tarUfPVBMFEfD5ftY4.woff2',
				greek:
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOuEADFm8hSaQTFG18FErVhsC9x-tarUfPVBMFEcz5ftY4.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOuEADFm8hSaQTFG18FErVhsC9x-tarUfPVBMFEfz5ftY4.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOuEADFm8hSaQTFG18FErVhsC9x-tarUfPVBMFEfj5ftY4.woff2',
				latin:
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOuEADFm8hSaQTFG18FErVhsC9x-tarUfPVBMFEcD5f.woff2',
			},
			'400': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOjEADFm8hSaQTFG18FErVhsC9x-tarUfPdouNRTx8.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOjEADFm8hSaQTFG18FErVhsC9x-tarUfPdq-NRTx8.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOjEADFm8hSaQTFG18FErVhsC9x-tarUfPdo-NRTx8.woff2',
				greek:
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOjEADFm8hSaQTFG18FErVhsC9x-tarUfPdrONRTx8.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOjEADFm8hSaQTFG18FErVhsC9x-tarUfPdoONRTx8.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOjEADFm8hSaQTFG18FErVhsC9x-tarUfPdoeNRTx8.woff2',
				latin:
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOjEADFm8hSaQTFG18FErVhsC9x-tarUfPdr-NR.woff2',
			},
			'500': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOuEADFm8hSaQTFG18FErVhsC9x-tarUfPVXMBEfT5ftY4.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOuEADFm8hSaQTFG18FErVhsC9x-tarUfPVXMBEdD5ftY4.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOuEADFm8hSaQTFG18FErVhsC9x-tarUfPVXMBEfD5ftY4.woff2',
				greek:
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOuEADFm8hSaQTFG18FErVhsC9x-tarUfPVXMBEcz5ftY4.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOuEADFm8hSaQTFG18FErVhsC9x-tarUfPVXMBEfz5ftY4.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOuEADFm8hSaQTFG18FErVhsC9x-tarUfPVXMBEfj5ftY4.woff2',
				latin:
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOuEADFm8hSaQTFG18FErVhsC9x-tarUfPVXMBEcD5f.woff2',
			},
			'600': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOuEADFm8hSaQTFG18FErVhsC9x-tarUfPVcMdEfT5ftY4.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOuEADFm8hSaQTFG18FErVhsC9x-tarUfPVcMdEdD5ftY4.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOuEADFm8hSaQTFG18FErVhsC9x-tarUfPVcMdEfD5ftY4.woff2',
				greek:
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOuEADFm8hSaQTFG18FErVhsC9x-tarUfPVcMdEcz5ftY4.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOuEADFm8hSaQTFG18FErVhsC9x-tarUfPVcMdEfz5ftY4.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOuEADFm8hSaQTFG18FErVhsC9x-tarUfPVcMdEfj5ftY4.woff2',
				latin:
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOuEADFm8hSaQTFG18FErVhsC9x-tarUfPVcMdEcD5f.woff2',
			},
			'700': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOuEADFm8hSaQTFG18FErVhsC9x-tarUfPVFMZEfT5ftY4.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOuEADFm8hSaQTFG18FErVhsC9x-tarUfPVFMZEdD5ftY4.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOuEADFm8hSaQTFG18FErVhsC9x-tarUfPVFMZEfD5ftY4.woff2',
				greek:
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOuEADFm8hSaQTFG18FErVhsC9x-tarUfPVFMZEcz5ftY4.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOuEADFm8hSaQTFG18FErVhsC9x-tarUfPVFMZEfz5ftY4.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOuEADFm8hSaQTFG18FErVhsC9x-tarUfPVFMZEfj5ftY4.woff2',
				latin:
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOuEADFm8hSaQTFG18FErVhsC9x-tarUfPVFMZEcD5f.woff2',
			},
			'800': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOuEADFm8hSaQTFG18FErVhsC9x-tarUfPVCMVEfT5ftY4.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOuEADFm8hSaQTFG18FErVhsC9x-tarUfPVCMVEdD5ftY4.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOuEADFm8hSaQTFG18FErVhsC9x-tarUfPVCMVEfD5ftY4.woff2',
				greek:
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOuEADFm8hSaQTFG18FErVhsC9x-tarUfPVCMVEcz5ftY4.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOuEADFm8hSaQTFG18FErVhsC9x-tarUfPVCMVEfz5ftY4.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOuEADFm8hSaQTFG18FErVhsC9x-tarUfPVCMVEfj5ftY4.woff2',
				latin:
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOuEADFm8hSaQTFG18FErVhsC9x-tarUfPVCMVEcD5f.woff2',
			},
			'900': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOuEADFm8hSaQTFG18FErVhsC9x-tarUfPVLMREfT5ftY4.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOuEADFm8hSaQTFG18FErVhsC9x-tarUfPVLMREdD5ftY4.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOuEADFm8hSaQTFG18FErVhsC9x-tarUfPVLMREfD5ftY4.woff2',
				greek:
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOuEADFm8hSaQTFG18FErVhsC9x-tarUfPVLMREcz5ftY4.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOuEADFm8hSaQTFG18FErVhsC9x-tarUfPVLMREfz5ftY4.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOuEADFm8hSaQTFG18FErVhsC9x-tarUfPVLMREfj5ftY4.woff2',
				latin:
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOuEADFm8hSaQTFG18FErVhsC9x-tarUfPVLMREcD5f.woff2',
			},
		},
		normal: {
			'100': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOjEADFm8hSaQTFG18FErVhsC9x-tarWZXdouNRTx8.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOjEADFm8hSaQTFG18FErVhsC9x-tarWZXdq-NRTx8.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOjEADFm8hSaQTFG18FErVhsC9x-tarWZXdo-NRTx8.woff2',
				greek:
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOjEADFm8hSaQTFG18FErVhsC9x-tarWZXdrONRTx8.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOjEADFm8hSaQTFG18FErVhsC9x-tarWZXdoONRTx8.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOjEADFm8hSaQTFG18FErVhsC9x-tarWZXdoeNRTx8.woff2',
				latin:
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOjEADFm8hSaQTFG18FErVhsC9x-tarWZXdr-NR.woff2',
			},
			'200': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOsEADFm8hSaQTFG18FErVhsC9x-tarWTnMuMl0ciZb.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOsEADFm8hSaQTFG18FErVhsC9x-tarWTnMuMB0ciZb.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOsEADFm8hSaQTFG18FErVhsC9x-tarWTnMuMh0ciZb.woff2',
				greek:
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOsEADFm8hSaQTFG18FErVhsC9x-tarWTnMuMd0ciZb.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOsEADFm8hSaQTFG18FErVhsC9x-tarWTnMuMt0ciZb.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOsEADFm8hSaQTFG18FErVhsC9x-tarWTnMuMp0ciZb.woff2',
				latin:
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOsEADFm8hSaQTFG18FErVhsC9x-tarWTnMuMR0cg.woff2',
			},
			'300': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOsEADFm8hSaQTFG18FErVhsC9x-tarWV3PuMl0ciZb.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOsEADFm8hSaQTFG18FErVhsC9x-tarWV3PuMB0ciZb.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOsEADFm8hSaQTFG18FErVhsC9x-tarWV3PuMh0ciZb.woff2',
				greek:
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOsEADFm8hSaQTFG18FErVhsC9x-tarWV3PuMd0ciZb.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOsEADFm8hSaQTFG18FErVhsC9x-tarWV3PuMt0ciZb.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOsEADFm8hSaQTFG18FErVhsC9x-tarWV3PuMp0ciZb.woff2',
				latin:
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOsEADFm8hSaQTFG18FErVhsC9x-tarWV3PuMR0cg.woff2',
			},
			'400': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOhEADFm8hSaQTFG18FErVhsC9x-tarUfvtrftV.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOhEADFm8hSaQTFG18FErVhsC9x-tarUfLtrftV.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOhEADFm8hSaQTFG18FErVhsC9x-tarUfrtrftV.woff2',
				greek:
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOhEADFm8hSaQTFG18FErVhsC9x-tarUfXtrftV.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOhEADFm8hSaQTFG18FErVhsC9x-tarUfntrftV.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOhEADFm8hSaQTFG18FErVhsC9x-tarUfjtrftV.woff2',
				latin:
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOhEADFm8hSaQTFG18FErVhsC9x-tarUfbtrQ.woff2',
			},
			'500': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOsEADFm8hSaQTFG18FErVhsC9x-tarWQXOuMl0ciZb.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOsEADFm8hSaQTFG18FErVhsC9x-tarWQXOuMB0ciZb.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOsEADFm8hSaQTFG18FErVhsC9x-tarWQXOuMh0ciZb.woff2',
				greek:
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOsEADFm8hSaQTFG18FErVhsC9x-tarWQXOuMd0ciZb.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOsEADFm8hSaQTFG18FErVhsC9x-tarWQXOuMt0ciZb.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOsEADFm8hSaQTFG18FErVhsC9x-tarWQXOuMp0ciZb.woff2',
				latin:
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOsEADFm8hSaQTFG18FErVhsC9x-tarWQXOuMR0cg.woff2',
			},
			'600': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOsEADFm8hSaQTFG18FErVhsC9x-tarWSnJuMl0ciZb.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOsEADFm8hSaQTFG18FErVhsC9x-tarWSnJuMB0ciZb.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOsEADFm8hSaQTFG18FErVhsC9x-tarWSnJuMh0ciZb.woff2',
				greek:
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOsEADFm8hSaQTFG18FErVhsC9x-tarWSnJuMd0ciZb.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOsEADFm8hSaQTFG18FErVhsC9x-tarWSnJuMt0ciZb.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOsEADFm8hSaQTFG18FErVhsC9x-tarWSnJuMp0ciZb.woff2',
				latin:
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOsEADFm8hSaQTFG18FErVhsC9x-tarWSnJuMR0cg.woff2',
			},
			'700': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOsEADFm8hSaQTFG18FErVhsC9x-tarWU3IuMl0ciZb.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOsEADFm8hSaQTFG18FErVhsC9x-tarWU3IuMB0ciZb.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOsEADFm8hSaQTFG18FErVhsC9x-tarWU3IuMh0ciZb.woff2',
				greek:
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOsEADFm8hSaQTFG18FErVhsC9x-tarWU3IuMd0ciZb.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOsEADFm8hSaQTFG18FErVhsC9x-tarWU3IuMt0ciZb.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOsEADFm8hSaQTFG18FErVhsC9x-tarWU3IuMp0ciZb.woff2',
				latin:
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOsEADFm8hSaQTFG18FErVhsC9x-tarWU3IuMR0cg.woff2',
			},
			'800': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOsEADFm8hSaQTFG18FErVhsC9x-tarWVHLuMl0ciZb.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOsEADFm8hSaQTFG18FErVhsC9x-tarWVHLuMB0ciZb.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOsEADFm8hSaQTFG18FErVhsC9x-tarWVHLuMh0ciZb.woff2',
				greek:
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOsEADFm8hSaQTFG18FErVhsC9x-tarWVHLuMd0ciZb.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOsEADFm8hSaQTFG18FErVhsC9x-tarWVHLuMt0ciZb.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOsEADFm8hSaQTFG18FErVhsC9x-tarWVHLuMp0ciZb.woff2',
				latin:
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOsEADFm8hSaQTFG18FErVhsC9x-tarWVHLuMR0cg.woff2',
			},
			'900': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOsEADFm8hSaQTFG18FErVhsC9x-tarWXXKuMl0ciZb.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOsEADFm8hSaQTFG18FErVhsC9x-tarWXXKuMB0ciZb.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOsEADFm8hSaQTFG18FErVhsC9x-tarWXXKuMh0ciZb.woff2',
				greek:
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOsEADFm8hSaQTFG18FErVhsC9x-tarWXXKuMd0ciZb.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOsEADFm8hSaQTFG18FErVhsC9x-tarWXXKuMt0ciZb.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOsEADFm8hSaQTFG18FErVhsC9x-tarWXXKuMp0ciZb.woff2',
				latin:
					'https://fonts.gstatic.com/s/firasanscondensed/v10/wEOsEADFm8hSaQTFG18FErVhsC9x-tarWXXKuMR0cg.woff2',
			},
		},
	},
});

export const fontFamily = 'Fira Sans Condensed' as const;

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
