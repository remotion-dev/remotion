import {test, expect} from 'bun:test';
import {
	extractInfoFromCss,
	extractVariableInfoFromCss,
} from '../scripts/extract-info-from-css';
import {getVariableCssLink} from '../scripts/utils';

const testFile = `
/* latin-ext */
@font-face {
  font-family: 'ABeeZee';
  font-style: italic;
  font-weight: 400;
  src: url(https://fonts.gstatic.com/s/abeezee/v22/esDT31xSG-6AGleN2tCUnJ8DKpE.woff2) format('woff2');
  unicode-range: U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF;
}
/* latin */
@font-face {
  font-family: 'ABeeZee';
  font-style: italic;
  font-weight: 400;
  src: url(https://fonts.gstatic.com/s/abeezee/v22/esDT31xSG-6AGleN2tCUkp8D.woff2) format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}
/* latin-ext */
@font-face {
  font-family: 'ABeeZee';
  font-style: normal;
  font-weight: 400;
  src: url(https://fonts.gstatic.com/s/abeezee/v22/esDR31xSG-6AGleN2tukkIcH.woff2) format('woff2');
  unicode-range: U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF;
}
/* latin */
@font-face {
  font-family: 'ABeeZee';
  font-style: normal;
  font-weight: 400;
  src: url(https://fonts.gstatic.com/s/abeezee/v22/esDR31xSG-6AGleN2tWkkA.woff2) format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD;
}
`;

test('Should extract correctly', () => {
	const data = extractInfoFromCss({
		contents: testFile.trim(),
		fontFamily: 'ABeeZee',
		importName: 'ABeeZee',
		subsets: ['latin', 'latin-ext'],
		url: 'https://fonts.googleapis.com/css2?family=ABeeZee:ital,wght@0,400;1,400',
		version: 'v22',
	});
	expect(data).toEqual({
		fontFamily: 'ABeeZee',
		importName: 'ABeeZee',
		version: 'v22',
		url: 'https://fonts.googleapis.com/css2?family=ABeeZee:ital,wght@0,400;1,400',
		unicodeRanges: {
			'latin-ext':
				'U+0100-02AF, U+0304, U+0308, U+0329, U+1E00-1E9F, U+1EF2-1EFF, U+2020, U+20A0-20AB, U+20AD-20C0, U+2113, U+2C60-2C7F, U+A720-A7FF',
			latin:
				'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
		},
		fonts: {
			italic: {
				'400': {
					'latin-ext':
						'https://fonts.gstatic.com/s/abeezee/v22/esDT31xSG-6AGleN2tCUnJ8DKpE.woff2',
					latin:
						'https://fonts.gstatic.com/s/abeezee/v22/esDT31xSG-6AGleN2tCUkp8D.woff2',
				},
			},
			normal: {
				'400': {
					'latin-ext':
						'https://fonts.gstatic.com/s/abeezee/v22/esDR31xSG-6AGleN2tukkIcH.woff2',
					latin:
						'https://fonts.gstatic.com/s/abeezee/v22/esDR31xSG-6AGleN2tWkkA.woff2',
				},
			},
		},
		subsets: ['latin', 'latin-ext'],
	});
});

test('Should generate and extract variable font information', () => {
	const font = {
		family: 'Roboto Flex',
		variants: ['regular'],
		subsets: ['latin'],
		version: 'v30',
		lastModified: '2025-09-08',
		category: 'sans-serif',
		axes: [
			{tag: 'opsz', start: 8, end: 144},
			{tag: 'wdth', start: 25, end: 151},
			{tag: 'wght', start: 100, end: 1000},
		],
	};
	const url = getVariableCssLink(font);
	expect(url).toBe(
		'https://fonts.googleapis.com/css2?family=Roboto+Flex:opsz,wdth,wght@8..144,25..151,100..1000',
	);
	expect(
		getVariableCssLink({
			...font,
			family: 'Noto Sans',
			variants: ['regular', 'italic'],
			axes: [{tag: 'wght', start: 100, end: 900}],
		}),
	).toBe(
		'https://fonts.googleapis.com/css2?family=Noto+Sans:ital,wght@0,100..900;1,100..900',
	);

	expect(
		extractVariableInfoFromCss({
			axes: font.axes,
			contents: `/* latin */
@font-face {
  font-family: 'Roboto Flex';
  font-style: normal;
  font-weight: 100 1000;
  font-stretch: 25% 151%;
  src: url(https://fonts.gstatic.com/roboto-flex.woff2) format('woff2');
  unicode-range: U+0000-00FF;
}`,
			url: url as string,
		}),
	).toEqual({
		axes: {
			opsz: {min: 8, max: 144},
			wdth: {min: 25, max: 151},
			wght: {min: 100, max: 1000},
		},
		fontFaces: [
			{
				style: 'normal',
				weight: '100 1000',
				stretch: '25% 151%',
				subset: 'latin',
				unicodeRange: 'U+0000-00FF',
				src: 'https://fonts.gstatic.com/roboto-flex.woff2',
			},
		],
		url,
	});
});
