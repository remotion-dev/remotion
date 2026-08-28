import {expect, test} from 'bun:test';
import type {IncomingMessage, ServerResponse} from 'node:http';
import {getReleaseNotesHandler} from '../preview-server/routes/release-notes';

const callHandler = (currentVersion: string, latestVersion: string) => {
	return getReleaseNotesHandler({
		binariesDirectory: null,
		configFile: null,
		entryPoint: '',
		getDefaultCodingAgent: () => null,
		getDefaultEditor: () => null,
		input: {currentVersion, latestVersion},
		logLevel: 'info',
		methods: {
			addJob: () => undefined,
			cancelJob: () => undefined,
			removeJob: () => undefined,
		},
		publicDir: '',
		remotionRoot: '',
		request: {} as IncomingMessage,
		response: {} as ServerResponse,
	});
};

test('renders every missed release with GitHub-flavored Markdown', async () => {
	const originalFetch = globalThis.fetch;
	const requests: {body: string | null; url: string}[] = [];

	globalThis.fetch = Object.assign(
		(input: Parameters<typeof fetch>[0], init?: RequestInit) => {
			const body = typeof init?.body === 'string' ? init.body : null;
			requests.push({body, url: input.toString()});

			if (body === null) {
				return Promise.resolve(
					Response.json([
						{body: '## Future', tag_name: 'v4.0.519'},
						{
							body: '## Latest',
							published_at: '2026-08-27T12:00:00Z',
							tag_name: 'v4.0.518',
						},
						{
							body: '## Earlier',
							published_at: '2026-08-20T12:00:00Z',
							tag_name: 'v4.0.517',
						},
						{body: '## Installed', tag_name: 'v4.0.516'},
					]),
				);
			}

			const {text} = JSON.parse(body) as {text: string};
			return Promise.resolve(new Response(`<h2>${text.slice(3)}</h2>`));
		},
		{preconnect: originalFetch.preconnect},
	);

	try {
		await expect(callHandler('4.0.516', '4.0.518')).resolves.toEqual({
			hasMore: false,
			releases: [
				{
					publishedAt: '2026-08-27T12:00:00Z',
					releaseNotesHtml: '<h2>Latest</h2>',
					version: '4.0.518',
				},
				{
					publishedAt: '2026-08-20T12:00:00Z',
					releaseNotesHtml: '<h2>Earlier</h2>',
					version: '4.0.517',
				},
			],
		});
		expect(requests).toEqual([
			{
				body: null,
				url: 'https://api.github.com/repos/remotion-dev/remotion/releases?per_page=100',
			},
			{
				body: JSON.stringify({
					context: 'remotion-dev/remotion',
					mode: 'gfm',
					text: '## Latest',
				}),
				url: 'https://api.github.com/markdown',
			},
			{
				body: JSON.stringify({
					context: 'remotion-dev/remotion',
					mode: 'gfm',
					text: '## Earlier',
				}),
				url: 'https://api.github.com/markdown',
			},
		]);
	} finally {
		globalThis.fetch = originalFetch;
	}
});

test('limits release notes to the five most recent releases', async () => {
	const originalFetch = globalThis.fetch;
	globalThis.fetch = Object.assign(
		(input: Parameters<typeof fetch>[0], init?: RequestInit) => {
			if (typeof init?.body !== 'string') {
				return Promise.resolve(
					Response.json(
						[513, 514, 515, 516, 517, 518].map((patch) => ({
							body: `## ${patch}`,
							tag_name: `v4.0.${patch}`,
						})),
					),
				);
			}

			return Promise.resolve(new Response(input.toString()));
		},
		{preconnect: originalFetch.preconnect},
	);

	try {
		const response = await callHandler('4.0.512', '4.0.518');
		expect(response.hasMore).toBe(true);
		expect(response.releases.map(({version}) => version)).toEqual([
			'4.0.518',
			'4.0.517',
			'4.0.516',
			'4.0.515',
			'4.0.514',
		]);
	} finally {
		globalThis.fetch = originalFetch;
	}
});

test('gracefully falls back when releases cannot be loaded', async () => {
	const originalFetch = globalThis.fetch;
	globalThis.fetch = Object.assign(
		() => Promise.resolve(new Response(null, {status: 404})),
		{preconnect: originalFetch.preconnect},
	);

	try {
		await expect(callHandler('4.0.516', '4.0.518')).resolves.toEqual({
			hasMore: false,
			releases: [],
		});
	} finally {
		globalThis.fetch = originalFetch;
	}
});

test('rejects invalid versions without calling GitHub', async () => {
	const originalFetch = globalThis.fetch;
	let didFetch = false;
	globalThis.fetch = Object.assign(
		() => {
			didFetch = true;
			return Promise.resolve(new Response());
		},
		{preconnect: originalFetch.preconnect},
	);

	try {
		await expect(callHandler('../../latest', '4.0.518')).rejects.toThrow(
			'Invalid Remotion version range',
		);
		expect(didFetch).toBe(false);
	} finally {
		globalThis.fetch = originalFetch;
	}
});
