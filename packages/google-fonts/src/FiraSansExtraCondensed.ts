import {loadFonts} from './base';

export const getInfo = () => ({
	fontFamily: 'Fira Sans Extra Condensed',
	importName: 'FiraSansExtraCondensed',
	version: 'v10',
	url: 'https://fonts.googleapis.com/css2?family=Fira+Sans+Extra+Condensed:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900',
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
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPOcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda1fqW22-UhEtHcg.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPOcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda1fqW22-dhEtHcg.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPOcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda1fqW22-VhEtHcg.woff2',
				greek:
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPOcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda1fqW22-ahEtHcg.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPOcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda1fqW22-WhEtHcg.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPOcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda1fqW22-XhEtHcg.woff2',
				latin:
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPOcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda1fqW22-ZhEs.woff2',
			},
			'200': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPxcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda1fqWd36Orm56S2Q.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPxcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda1fqWd36Op256S2Q.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPxcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda1fqWd36Or256S2Q.woff2',
				greek:
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPxcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda1fqWd36OoG56S2Q.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPxcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda1fqWd36OrG56S2Q.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPxcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda1fqWd36OrW56S2Q.woff2',
				latin:
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPxcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda1fqWd36Oo256.woff2',
			},
			'300': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPxcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda1fqWE32Orm56S2Q.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPxcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda1fqWE32Op256S2Q.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPxcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda1fqWE32Or256S2Q.woff2',
				greek:
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPxcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda1fqWE32OoG56S2Q.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPxcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda1fqWE32OrG56S2Q.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPxcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda1fqWE32OrW56S2Q.woff2',
				latin:
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPxcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda1fqWE32Oo256.woff2',
			},
			'400': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPMcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda1fqetV-bnE8.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPMcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda1fqevF-bnE8.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPMcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda1fqetF-bnE8.woff2',
				greek:
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPMcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda1fqeu1-bnE8.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPMcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda1fqet1-bnE8.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPMcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda1fqetl-bnE8.woff2',
				latin:
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPMcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda1fqeuF-b.woff2',
			},
			'500': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPxcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda1fqWS3yOrm56S2Q.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPxcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda1fqWS3yOp256S2Q.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPxcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda1fqWS3yOr256S2Q.woff2',
				greek:
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPxcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda1fqWS3yOoG56S2Q.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPxcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda1fqWS3yOrG56S2Q.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPxcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda1fqWS3yOrW56S2Q.woff2',
				latin:
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPxcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda1fqWS3yOo256.woff2',
			},
			'600': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPxcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda1fqWZ3uOrm56S2Q.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPxcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda1fqWZ3uOp256S2Q.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPxcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda1fqWZ3uOr256S2Q.woff2',
				greek:
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPxcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda1fqWZ3uOoG56S2Q.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPxcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda1fqWZ3uOrG56S2Q.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPxcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda1fqWZ3uOrW56S2Q.woff2',
				latin:
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPxcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda1fqWZ3uOo256.woff2',
			},
			'700': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPxcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda1fqWA3qOrm56S2Q.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPxcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda1fqWA3qOp256S2Q.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPxcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda1fqWA3qOr256S2Q.woff2',
				greek:
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPxcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda1fqWA3qOoG56S2Q.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPxcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda1fqWA3qOrG56S2Q.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPxcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda1fqWA3qOrW56S2Q.woff2',
				latin:
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPxcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda1fqWA3qOo256.woff2',
			},
			'800': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPxcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda1fqWH3mOrm56S2Q.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPxcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda1fqWH3mOp256S2Q.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPxcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda1fqWH3mOr256S2Q.woff2',
				greek:
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPxcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda1fqWH3mOoG56S2Q.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPxcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda1fqWH3mOrG56S2Q.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPxcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda1fqWH3mOrW56S2Q.woff2',
				latin:
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPxcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda1fqWH3mOo256.woff2',
			},
			'900': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPxcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda1fqWO3iOrm56S2Q.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPxcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda1fqWO3iOp256S2Q.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPxcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda1fqWO3iOr256S2Q.woff2',
				greek:
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPxcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda1fqWO3iOoG56S2Q.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPxcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda1fqWO3iOrG56S2Q.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPxcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda1fqWO3iOrW56S2Q.woff2',
				latin:
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPxcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda1fqWO3iOo256.woff2',
			},
		},
		normal: {
			'100': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPMcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda3ZyetV-bnE8.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPMcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda3ZyevF-bnE8.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPMcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda3ZyetF-bnE8.woff2',
				greek:
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPMcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda3Zyeu1-bnE8.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPMcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda3Zyet1-bnE8.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPMcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda3Zyetl-bnE8.woff2',
				latin:
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPMcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda3ZyeuF-b.woff2',
			},
			'200': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPPcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda3TCPr3W-oXZ-.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPPcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda3TCPr3y-oXZ-.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPPcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda3TCPr3S-oXZ-.woff2',
				greek:
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPPcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda3TCPr3u-oXZ-.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPPcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda3TCPr3e-oXZ-.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPPcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda3TCPr3a-oXZ-.woff2',
				latin:
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPPcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda3TCPr3i-oQ.woff2',
			},
			'300': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPPcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda3VSMr3W-oXZ-.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPPcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda3VSMr3y-oXZ-.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPPcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda3VSMr3S-oXZ-.woff2',
				greek:
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPPcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda3VSMr3u-oXZ-.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPPcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda3VSMr3e-oXZ-.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPPcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda3VSMr3a-oXZ-.woff2',
				latin:
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPPcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda3VSMr3i-oQ.woff2',
			},
			'400': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPKcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda1fKuukef.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPKcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda1fuuukef.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPKcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda1fOuukef.woff2',
				greek:
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPKcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda1fyuukef.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPKcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda1fCuukef.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPKcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda1fGuukef.woff2',
				latin:
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPKcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda1f-uug.woff2',
			},
			'500': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPPcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda3QyNr3W-oXZ-.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPPcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda3QyNr3y-oXZ-.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPPcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda3QyNr3S-oXZ-.woff2',
				greek:
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPPcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda3QyNr3u-oXZ-.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPPcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda3QyNr3e-oXZ-.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPPcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda3QyNr3a-oXZ-.woff2',
				latin:
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPPcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda3QyNr3i-oQ.woff2',
			},
			'600': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPPcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda3SCKr3W-oXZ-.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPPcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda3SCKr3y-oXZ-.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPPcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda3SCKr3S-oXZ-.woff2',
				greek:
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPPcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda3SCKr3u-oXZ-.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPPcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda3SCKr3e-oXZ-.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPPcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda3SCKr3a-oXZ-.woff2',
				latin:
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPPcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda3SCKr3i-oQ.woff2',
			},
			'700': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPPcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda3USLr3W-oXZ-.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPPcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda3USLr3y-oXZ-.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPPcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda3USLr3S-oXZ-.woff2',
				greek:
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPPcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda3USLr3u-oXZ-.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPPcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda3USLr3e-oXZ-.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPPcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda3USLr3a-oXZ-.woff2',
				latin:
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPPcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda3USLr3i-oQ.woff2',
			},
			'800': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPPcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda3ViIr3W-oXZ-.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPPcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda3ViIr3y-oXZ-.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPPcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda3ViIr3S-oXZ-.woff2',
				greek:
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPPcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda3ViIr3u-oXZ-.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPPcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda3ViIr3e-oXZ-.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPPcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda3ViIr3a-oXZ-.woff2',
				latin:
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPPcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda3ViIr3i-oQ.woff2',
			},
			'900': {
				'cyrillic-ext':
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPPcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda3XyJr3W-oXZ-.woff2',
				cyrillic:
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPPcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda3XyJr3y-oXZ-.woff2',
				'greek-ext':
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPPcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda3XyJr3S-oXZ-.woff2',
				greek:
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPPcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda3XyJr3u-oXZ-.woff2',
				vietnamese:
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPPcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda3XyJr3e-oXZ-.woff2',
				'latin-ext':
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPPcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda3XyJr3a-oXZ-.woff2',
				latin:
					'https://fonts.gstatic.com/s/firasansextracondensed/v10/NaPPcYDaAO5dirw6IaFn7lPJFqXmS-M9Atn3wgda3XyJr3i-oQ.woff2',
			},
		},
	},
});

export const fontFamily = 'Fira Sans Extra Condensed' as const;

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
