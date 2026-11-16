import {expect, test} from 'bun:test';
import {mkdtempSync, rmSync} from 'node:fs';
import type {IncomingMessage, ServerResponse} from 'node:http';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {
	downloadRemoteAssetHandler,
	getRemoteAssetFilename,
} from '../preview-server/routes/download-remote-asset';
import {fakeHttps} from './fake-https';

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
	const gif = new Uint8Array([
		0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x20, 0x03, 0x58, 0x02,
	]);
	const remote = fakeHttps((url) =>
		url === 'https://93.184.216.34/raw-link'
			? {
					statusCode: 302,
					headers: {location: 'https://93.184.216.35/logo.gif'},
					body: null,
				}
			: {
					statusCode: 200,
					headers: {'content-length': String(gif.byteLength)},
					body: gif,
				},
	);

	try {
		const response = await downloadRemoteAssetHandler({
			binariesDirectory: null,
			configFile: null,
			getDefaultCodingAgent: () => null,
			getDefaultEditor: () => null,
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

		expect(remote.requestedUrls).toEqual([
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
		remote.restore();
		rmSync(publicDir, {force: true, recursive: true});
	}
});

test('blocks redirects to private IP addresses', async () => {
	const publicDir = mkdtempSync(path.join(tmpdir(), 'remotion-remote-asset-'));
	const remote = fakeHttps(() => ({
		statusCode: 302,
		headers: {location: 'http://127.0.0.1/logo.gif'},
		body: null,
	}));

	try {
		await expect(
			downloadRemoteAssetHandler({
				binariesDirectory: null,
				configFile: null,
				getDefaultCodingAgent: () => null,
				getDefaultEditor: () => null,
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
		remote.restore();
		rmSync(publicDir, {force: true, recursive: true});
	}
});
