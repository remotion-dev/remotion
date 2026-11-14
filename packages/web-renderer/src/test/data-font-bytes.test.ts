import {expect, test} from 'vitest';
import {getCssDataFontBytes} from '../drawing/fingerprint-css-font-groups';

const cases: [string, number[] | null][] = [
	['data:font/woff2,%00%7f%80%ff', [0, 127, 128, 255]],
	['data:font/woff2,%C3%A9', [195, 169]],
	['data:font/woff2,é', [195, 169]],
	['data:font/woff2,%', [37]],
	['data:font/woff2,%8', [37, 56]],
	['data:font/woff2,%GG', [37, 71, 71]],
	['data:font/woff2,%2580', [37, 56, 48]],
	['data:font/woff2,a+b', [97, 43, 98]],
	['data:font/woff2,', []],
	['data:font/woff2;base64,AH+A/w==', [0, 127, 128, 255]],
	['data:font/woff2;base64,AH%2bA%2fw%3d%3D', [0, 127, 128, 255]],
	['data:font/woff2;BASE64,AH%2BA%2Fw', [0, 127, 128, 255]],
	['data:font/woff2;base64,%20AH%2BA%2Fw%3D%3D%0A', [0, 127, 128, 255]],
	['data:font/woff2;base64,', []],
	['data:font/woff2;base64,A', null],
	['data:font/woff2;base64,AA===', null],
	['data:font/woff2;base64,%80', null],
	['data:font/woff2;base64,%GG', null],
	['data:font/woff2', null],
];
for (const [url, expected] of cases) {
	test('decodes font data bytes: ' + url, () => {
		const result = getCssDataFontBytes(
			'url("' + url + '") format("woff2")',
			globalThis,
		);
		expect(result === null ? null : Array.from(result)).toEqual(expected);
		if (result) expect(result.buffer.byteLength).toBe(result.byteLength);
	});
}

test('rejects sources outside the single-data-font subset', () => {
	for (const source of [
		'url("https://example.com/font.woff2")',
		'local("Font")',
		'url("data:font/woff2,AA"),url("data:font/woff2,BB")',
	])
		expect(getCssDataFontBytes(source, globalThis)).toBeNull();
});
