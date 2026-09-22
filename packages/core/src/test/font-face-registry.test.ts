import {afterEach, expect, mock, test} from 'bun:test';
import {fetchFontData} from '../font-face-registry';

const originalFetch = globalThis.fetch;

afterEach(() => {
	globalThis.fetch = originalFetch;
});

test('fetches font data once for concurrent consumers', async () => {
	const fetchMock = mock(() =>
		Promise.resolve(new Response(new Uint8Array([1, 2, 3, 4]))),
	);
	globalThis.fetch = fetchMock as unknown as typeof fetch;

	const [first, second] = await Promise.all([
		fetchFontData('https://example.com/font-cache-test.woff2'),
		fetchFontData('https://example.com/font-cache-test.woff2'),
	]);

	expect(fetchMock).toHaveBeenCalledTimes(1);
	expect(first).toBe(second);
	expect(Array.from(new Uint8Array(first))).toEqual([1, 2, 3, 4]);
});
