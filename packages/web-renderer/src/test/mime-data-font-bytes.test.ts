import {expect, test} from 'vitest';
import {getCssDataFontBytes} from '../drawing/fingerprint-css-font-groups';
import {mimeDataFontByteCases} from './mime-data-font-cases';

for (const [input, expected] of mimeDataFontByteCases) {
	test('decodes serialized MIME header ' + input, () => {
		// Exercise serialization by the owning runtime; control handling varies by engine.
		const url = new URL(input).href;
		const raw = getCssDataFontBytes(
			'url("' + input + '") format("woff2")',
			globalThis,
		);
		expect(raw === null ? null : Array.from(raw)).toEqual(expected);
		if (raw) expect(raw.buffer.byteLength).toBe(raw.byteLength);
		const actual = getCssDataFontBytes(
			'url("' + url + '") format("woff2")',
			globalThis,
		);
		expect(actual === null ? null : Array.from(actual)).toEqual(expected);
		if (actual) expect(actual.buffer.byteLength).toBe(actual.byteLength);
	});
}
