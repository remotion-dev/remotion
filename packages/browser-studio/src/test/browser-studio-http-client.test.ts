import {expect, test} from 'bun:test';
import {makeBrowserStudioHttpClient} from '../browser-studio-http-client';

test('coalesces concurrent requests with equivalent headers', async () => {
	let requests = 0;
	const httpClient = makeBrowserStudioHttpClient({
		fetchImplementation: async () => {
			requests++;
			await Promise.resolve();
			return new Response('module', {
				headers: {'x-test': 'value'},
				status: 200,
			});
		},
	});

	const first = httpClient('https://example.com/module.js', {
		accept: 'text/javascript',
		authorization: 'token',
	});
	const second = httpClient('https://example.com/module.js', {
		authorization: 'token',
		accept: 'text/javascript',
	});

	expect(first).toBe(second);
	const response = await second;
	expect({...response, body: new TextDecoder().decode(response.body)}).toEqual({
		body: 'module',
		headers: {'x-test': 'value'},
		status: 200,
	});
	expect(requests).toBe(1);
});

test('allows a failed request to be retried', async () => {
	let requests = 0;
	const httpClient = makeBrowserStudioHttpClient({
		fetchImplementation: () => {
			requests++;
			if (requests === 1) {
				return Promise.reject(new Error('Network error'));
			}

			return Promise.resolve(new Response('module'));
		},
	});

	await expect(httpClient('https://example.com/module.js', {})).rejects.toThrow(
		'Network error',
	);
	await expect(
		httpClient('https://example.com/module.js', {}),
	).resolves.toMatchObject({status: 200});
	expect(requests).toBe(2);
});
