import {expect, test} from 'bun:test';
import {resolveFileSource} from '../error-overlay/react-overlay/effects/resolve-file-source';

test('resolves file source using a POST request', async () => {
	const previousFetch = globalThis.fetch;
	const calls: {
		input: string | URL | Request;
		init: RequestInit | undefined;
	}[] = [];

	globalThis.fetch = ((input, init) => {
		calls.push({input, init});

		return Promise.resolve(
			new Response(['const a = 1;', 'const b = 2;', 'const c = 3;'].join('\n')),
		);
	}) as typeof fetch;

	try {
		const resolved = await resolveFileSource(
			{
				columnNumber: 3,
				fileName: '../rough-notation/dist/esm/index.mjs',
				lineNumber: 2,
				message: 'Example error',
			},
			1,
		);

		expect(calls).toHaveLength(1);
		expect(calls[0].input).toBe('/api/file-source');
		expect(calls[0].init).toEqual({
			body: JSON.stringify({
				fileName: '../rough-notation/dist/esm/index.mjs',
			}),
			headers: {
				'Content-Type': 'application/json',
			},
			method: 'POST',
		});
		expect(resolved.originalScriptCode).toEqual([
			{content: 'const a = 1;', highlight: false, lineNumber: 1},
			{content: 'const b = 2;', highlight: true, lineNumber: 2},
			{content: 'const c = 3;', highlight: false, lineNumber: 3},
		]);
	} finally {
		globalThis.fetch = previousFetch;
	}
});
