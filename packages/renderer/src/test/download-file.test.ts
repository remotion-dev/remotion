import {expect, test} from 'bun:test';
import fs from 'node:fs';
import http from 'node:http';
import type {AddressInfo} from 'node:net';
import {tmpdir} from 'node:os';
import {
	downloadAsset,
	getSanitizedFilenameForAssetUrl,
} from '../assets/download-and-map-assets-to-file';
import {downloadFile} from '../assets/download-file';
import {cleanDownloadMap, makeDownloadMap} from '../assets/download-map';

test(
	'Should be able to download file',
	async () => {
		const downloadDir = tmpdir();
		const {to} = await downloadFile({
			url: 'https://remotion.dev/',
			to: (contentDisposition, contentType) => {
				return getSanitizedFilenameForAssetUrl({
					contentDisposition,
					downloadDir,
					src: 'https://remotion.dev/',
					contentType,
				});
			},
			onProgress: () => undefined,
			indent: false,
			logLevel: 'info',
			abortSignal: new AbortController().signal,
		});
		const data = await fs.promises.readFile(to, 'utf8');

		expect(data).toMatch(/<!doctype/);
	},
	{timeout: 30000},
);

test('Should fail to download invalid files', async () => {
	const downloadDir = tmpdir();
	await expect(() =>
		downloadFile({
			to: (contentDisposition, contentType) => {
				return getSanitizedFilenameForAssetUrl({
					contentDisposition,
					contentType,
					downloadDir,
					src: 'https://thisdomain.doesnotexist',
				});
			},
			url: 'https://thisdomain.doesnotexist',
			onProgress: () => undefined,
			indent: false,
			logLevel: 'info',
			abortSignal: new AbortController().signal,
		}),
	).toThrow(/Unable to connect|ECONNREFUSED|ENOTFOUND/);
});

// https://github.com/remotion-dev/remotion/issues/12817
test('Should reject callers waiting for an asset whose download failed', async () => {
	const server = http
		.createServer((_req, res) => {
			res.writeHead(404);
			res.end();
		})
		.listen(0);
	await new Promise((resolve) => {
		server.once('listening', resolve);
	});
	const src = `http://127.0.0.1:${(server.address() as AddressInfo).port}/a.mp3`;
	const downloadMap = makeDownloadMap(48000);

	const download = () =>
		downloadAsset({
			src,
			downloadMap,
			indent: false,
			logLevel: 'info',
			shouldAnalyzeAudioImmediately: false,
			binariesDirectory: null,
			cancelSignalForAudioAnalysis: undefined,
			audioStreamIndex: undefined,
		});

	try {
		// The second call waits for the first one's download instead of starting its own
		const results = await Promise.allSettled([download(), download()]);
		for (const result of results) {
			expect(result.status).toBe('rejected');
			expect(String((result as PromiseRejectedResult).reason)).toMatch(
				/status code of 404/,
			);
		}
	} finally {
		server.close();
		cleanDownloadMap(downloadMap);
	}
});
