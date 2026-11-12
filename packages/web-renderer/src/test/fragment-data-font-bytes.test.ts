import {expect, test} from 'vitest';
import {getCssDataFontBytes} from '../drawing/fingerprint-css-font-groups';

const cases: [string, number[] | null][] = [
	['data:font/woff2;base64,AH+A/w==#font', [0, 127, 128, 255]],
	['data:font/woff2;base64,AH+A/w==#', [0, 127, 128, 255]],
	['data:font/woff2;base64,AH+A/w==#font#other', [0, 127, 128, 255]],
	['data:font/woff2;base64,AH%2BA%2Fw%3D%3D#font', [0, 127, 128, 255]],
	['data:font/woff2;base64,AH%2BA%2Fw#font', [0, 127, 128, 255]],
	['data:font/woff2,%00%7f%80%ff#font', [0, 127, 128, 255]],
	['data:font/woff2,é#font', [195, 169]],
	['data:font/woff2,%GG#font', [37, 71, 71]],
	['data:font/woff2,%23font', [35, 102, 111, 110, 116]],
	['data:font/woff2,%2523font#fragment', [37, 50, 51, 102, 111, 110, 116]],
	['data:font/woff2,a#b,c', [97]],
	['data:font/woff2,#font', []],
	['data:font/woff2#font,AA', null],
	['data:font/woff2;base64,A#font', null],
	['data:font/woff2;base64,AA!#font', null],
	['data:font/woff2,a+b#font', [97, 43, 98]],
];

for (const [url, expected] of cases) {
	test('decodes fragment data font ' + url, () => {
		const result = getCssDataFontBytes(
			'url("' + url + '") format("woff2")',
			globalThis,
		);
		expect(result === null ? null : Array.from(result)).toEqual(expected);
		if (result) expect(result.buffer.byteLength).toBe(result.byteLength);
	});
}
