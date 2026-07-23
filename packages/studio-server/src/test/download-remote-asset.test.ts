import {expect, test} from 'bun:test';
import {mkdtempSync, rmSync} from 'node:fs';
import type {IncomingMessage, ServerResponse} from 'node:http';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {
	downloadRemoteAssetHandler,
	getRemoteAssetFilename,
} from '../preview-server/routes/download-remote-asset';

test('sanitizes remote asset filenames and uses detected extensions', () => {
	expect(
		getRemoteAssetFilename({
			fileType: {type: 'png', dimensions: null},
			url: new URL('https://example.com/../bad:name.jpg?size=large'),
		}),
	).toBe('bad-name.png');

	expect(
		getRemoteAssetFilename({
			fileType: {type: 'jpeg', dimensions: null},
			url: new URL('https://example.com/photos/image'),
		}),
	).toBe('image.jpg');

	expect(
		getRemoteAssetFilename({
			fileType: {type: 'apng', dimensions: null},
			url: new URL('https://example.com/animation'),
		}),
	).toBe('animation.png');
});

test('follows validated redirects for remote assets', async () => {
	const publicDir = mkdtempSync(path.join(tmpdir(), 'remotion-remote-asset-'));
	const originalFetch = globalThis.fetch;
	const requestedUrls: string[] = [];
	const gif = new Uint8Array([
		0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x20, 0x03, 0x58, 0x02,
	]);

	globalThis.fetch = Object.assign(
		async (input: Parameters<typeof fetch>[0]) => {
			requestedUrls.push(input.toString());

			if (requestedUrls.length === 1) {
				return new Response(null, {
					headers: {
						location: 'https://93.184.216.35/logo.gif',
					},
					status: 302,
				});
			}

			return new Response(gif, {
				headers: {
					'content-length': String(gif.byteLength),
				},
				status: 200,
			});
		},
		{
			preconnect: originalFetch.preconnect,
		},
	);

	try {
		const response = await downloadRemoteAssetHandler({
			binariesDirectory: null,
			entryPoint: '',
			input: {url: 'https://93.184.216.34/raw-link'},
			logLevel: 'info',
			methods: {
				addJob: () => undefined,
				cancelJob: () => undefined,
				removeJob: () => undefined,
			},
			publicDir,
			remotionRoot: '',
			request: {
				headers: {
					host: 'studio.local',
					origin: 'http://studio.local',
				},
			} as IncomingMessage,
			response: {} as ServerResponse,
		});

		expect(requestedUrls).toEqual([
			'https://93.184.216.34/raw-link',
			'https://93.184.216.35/logo.gif',
		]);
		expect(response).toEqual({
			assetPath: 'raw-link.gif',
			created: true,
			element: {
				assetType: 'gif',
				dimensions: {
					height: 600,
					width: 800,
				},
				durationInFrames: null,
				position: null,
				src: 'raw-link.gif',
				srcType: 'static',
				type: 'asset',
			},
			sizeInBytes: gif.byteLength,
		});
	} finally {
		globalThis.fetch = originalFetch;
		rmSync(publicDir, {force: true, recursive: true});
	}
});

test('blocks redirects to private IP addresses', async () => {
	const publicDir = mkdtempSync(path.join(tmpdir(), 'remotion-remote-asset-'));
	const originalFetch = globalThis.fetch;

	globalThis.fetch = Object.assign(
		async (_input: Parameters<typeof fetch>[0]) => {
			return new Response(null, {
				headers: {
					location: 'http://127.0.0.1/logo.gif',
				},
				status: 302,
			});
		},
		{
			preconnect: originalFetch.preconnect,
		},
	);

	try {
		await expect(
			downloadRemoteAssetHandler({
				binariesDirectory: null,
				entryPoint: '',
				input: {url: 'https://93.184.216.34/raw-link'},
				logLevel: 'info',
				methods: {
					addJob: () => undefined,
					cancelJob: () => undefined,
					removeJob: () => undefined,
				},
				publicDir,
				remotionRoot: '',
				request: {
					headers: {
						host: 'studio.local',
						origin: 'http://studio.local',
					},
				} as IncomingMessage,
				response: {} as ServerResponse,
			}),
		).rejects.toThrow('Private IP addresses cannot be imported');
	} finally {
		globalThis.fetch = originalFetch;
		rmSync(publicDir, {force: true, recursive: true});
	}
});
