import {expect, test} from 'bun:test';
import fs from 'node:fs';
import {tmpdir} from 'node:os';
import {getSanitizedFilenameForAssetUrl} from '../assets/download-and-map-assets-to-file';
import {downloadFile} from '../assets/download-file';

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
		});
		const data = await fs.promises.readFile(to, 'utf8');

		expect(data).toMatch(/<!doctype/);
	},
	{timeout: 10000},
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
		}),
	).toThrow(typeof Bun === 'undefined' ? /ENOTFOUND/ : /Unable to connect/);
});
