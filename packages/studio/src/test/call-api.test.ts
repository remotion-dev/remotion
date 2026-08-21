import {expect, test} from 'bun:test';
import {STUDIO_CSRF_HEADER} from '@remotion/studio-shared';
import {callApi} from '../components/call-api';

test('sends the Studio CSRF token with API requests', async () => {
	const previousWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
	const previousFetch = globalThis.fetch;
	let requestInit: RequestInit | undefined;

	Object.defineProperty(globalThis, 'window', {
		configurable: true,
		value: {remotion_studioCsrfToken: 'csrf-token'},
	});
	globalThis.fetch = ((_input, init) => {
		requestInit = init;
		return Promise.resolve(
			new Response(JSON.stringify({success: true, data: {}})),
		);
	}) as typeof fetch;

	try {
		await callApi('/api/restart-studio', {});

		expect(requestInit?.headers).toEqual({
			'content-type': 'application/json',
			[STUDIO_CSRF_HEADER]: 'csrf-token',
		});
	} finally {
		globalThis.fetch = previousFetch;
		if (previousWindow) {
			Object.defineProperty(globalThis, 'window', previousWindow);
		} else {
			Reflect.deleteProperty(globalThis, 'window');
		}
	}
});
