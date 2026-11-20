import {expect, test} from 'bun:test';
import fs from 'node:fs';
import http from 'node:http';
import type {AddressInfo} from 'node:net';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {
	downloadAsset,
	getSanitizedFilenameForAssetUrl,
} from '../assets/download-and-map-assets-to-file';
import {downloadFile} from '../assets/download-file';
import {cleanDownloadMap, makeDownloadMap} from '../assets/download-map';

test(
	'Should be able to download file',
	async () => {
		const downloadDir = await fs.promises.mkdtemp(
			path.join(tmpdir(), 'remotion-download-test-'),
		);
		const content =
			'<!doctype html><html><body>Download fixture: café</body></html>';
		let requests = 0;
		const server = http.createServer((_request, response) => {
			requests++;
			response.writeHead(200, {
				'Content-Type': 'text/html; charset=utf-8',
				Connection: 'close',
				'Content-Length': Buffer.byteLength(content),
				'Content-Disposition': 'attachment; filename="fixture.html"',
			});
			response.write(content.slice(0, 15));
			response.end(content.slice(15));
		});
		try {
			await new Promise<void>((resolve, reject) => {
				server.once('error', reject);
				server.listen(0, '127.0.0.1', resolve);
			});
			const src = `http://127.0.0.1:${(server.address() as AddressInfo).port}/fixture`;
			const {to, sizeInBytes} = await downloadFile({
				url: src,
				to: (contentDisposition, contentType) =>
					getSanitizedFilenameForAssetUrl({
						contentDisposition,
						contentType,
						downloadDir,
						src,
					}),
				onProgress: () => undefined,
				indent: false,
				logLevel: 'info',
				abortSignal: new AbortController().signal,
			});
			const data = await fs.promises.readFile(to, 'utf8');
			expect(data).toBe(content);
			expect(sizeInBytes).toBe(Buffer.byteLength(content));
			expect(path.dirname(to)).toBe(downloadDir);
			expect(path.extname(to)).toBe('.html');
			expect(requests).toBe(1);
		} finally {
			await new Promise<void>((resolve) => server.close(() => resolve()));
			await fs.promises.rm(downloadDir, {recursive: true, force: true});
		}
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
	const src = `http://127.0.0.1:${(server.address() as AddressInfo).port}/a-503.mp3`;
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

test('Should retry an invalid data URL instead of waiting forever', async () => {
	const downloadMap = makeDownloadMap(48000);
	const download = () =>
		Promise.race([
			downloadAsset({
				src: 'data:audio/wav,AAAA',
				downloadMap,
				indent: false,
				logLevel: 'info',
				shouldAnalyzeAudioImmediately: false,
				binariesDirectory: null,
				cancelSignalForAudioAnalysis: undefined,
				audioStreamIndex: undefined,
			}),
			new Promise((_, reject) => {
				setTimeout(() => reject(new Error('Download hung')), 2000);
			}),
		]);

	try {
		await expect(download()).rejects.toThrow(/data URL/);
		await expect(download()).rejects.toThrow(/data URL/);
	} finally {
		cleanDownloadMap(downloadMap);
	}
});
