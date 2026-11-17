import {expect, test} from 'bun:test';
import http from 'node:http';
import type {AddressInfo} from 'node:net';
import {downloadAsset} from '../assets/download-and-map-assets-to-file';
import {cleanDownloadMap, makeDownloadMap} from '../assets/download-map';
import {makeAssetDownloadError} from '../make-asset-download-error';

test('Asset download error should not include the original stack in the message and should keep the original error as cause', async () => {
	const server = http.createServer((_req, res) => {
		res.statusCode = 404;
		res.end('Not found');
	});
	await new Promise<void>((resolve) => {
		server.listen(0, '127.0.0.1', resolve);
	});
	const src = `http://127.0.0.1:${(server.address() as AddressInfo).port}/missing.mp3`;
	const downloadMap = makeDownloadMap(48000);

	try {
		const originalError = await downloadAsset({
			src,
			downloadMap,
			indent: false,
			logLevel: 'info',
			shouldAnalyzeAudioImmediately: false,
			binariesDirectory: null,
			cancelSignalForAudioAnalysis: undefined,
			audioStreamIndex: undefined,
		}).then(
			() => {
				throw new Error('Expected the download to fail');
			},
			(err: Error) => err,
		);

		const error = makeAssetDownloadError({src, error: originalError});

		expect(originalError.stack).toContain('\n    at ');
		expect(error.message).toBe(
			`Error while downloading ${src}: ${originalError.message}`,
		);
		expect(error.message).not.toContain('\n    at ');
		expect(error.cause).toBe(originalError);
	} finally {
		server.close();
		cleanDownloadMap(downloadMap);
	}
});

test('Asset download error should truncate long URLs and accept non-Error values', () => {
	const src = `https://example.com/${'a'.repeat(2000)}`;
	const error = makeAssetDownloadError({src, error: 'socket hang up'});

	expect(error.message).toBe(
		`Error while downloading ${src.substring(0, 1000)}...: socket hang up`,
	);
	expect(error.cause).toBe('socket hang up');
});
