import {expect, test} from 'vitest';
import {getCssDataFontBytes} from '../drawing/fingerprint-css-font-groups';
import {mimeDataFontRuntimeInputs} from './mime-data-font-cases';

for (const input of mimeDataFontRuntimeInputs) {
	test('matches owning-runtime data URL bytes ' + input, async () => {
		// Native fetching of the original string is the independent byte oracle.
		// Engines can disagree on raw URL controls; no UA-specific expectation is used.
		let bytes: Uint8Array | null = null;
		try {
			bytes = new Uint8Array(await (await fetch(input)).arrayBuffer());
		} catch {
			bytes = null;
		}

		const raw = getCssDataFontBytes('url("' + input + '")', globalThis);
		expect(raw).toEqual(bytes);
		const url = new URL(input);
		if (bytes === null) {
			await expect(fetch(url)).rejects.toThrow();
			expect(
				getCssDataFontBytes('url("' + url.href + '")', globalThis),
			).toBeNull();
			return;
		}

		const serialized = new Uint8Array(await (await fetch(url)).arrayBuffer());
		expect(serialized).toEqual(bytes);
		expect(getCssDataFontBytes('url("' + url.href + '")', globalThis)).toEqual(
			bytes,
		);
	});
}
