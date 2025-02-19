import {expect, test} from 'bun:test';
import path from 'node:path';
import {getSanitizedFilenameForAssetUrl} from '../assets/download-and-map-assets-to-file';

test('Should sanitize weird file names when downloading', () => {
	const newSrc = getSanitizedFilenameForAssetUrl({
		src: 'http://gtts-api.miniggiodev.fr/Ici+Japon+Corp.?lang=ja',
		downloadDir: '/var/tmp',
		contentDisposition: null,
		contentType: null,
	});
	expect(newSrc).toBe(
		process.platform === 'win32'
			? '\\var\\tmp\\13348542619496584'
			: '/var/tmp/13348542619496584',
	);
});

test('Should give different file names based on different url query parameters', () => {
	const asset1 = getSanitizedFilenameForAssetUrl({
		src: 'https://gtts-api.miniggiodev.fr/Ici+Japon+Corp.mp4?hi=1',
		downloadDir: '',
		contentDisposition: null,
		contentType: null,
	});
	const sameAgain = getSanitizedFilenameForAssetUrl({
		src: 'https://gtts-api.miniggiodev.fr/Ici+Japon+Corp.mp4?hi=1',
		downloadDir: '',
		contentDisposition: null,
		contentType: null,
	});
	const differentAsset = getSanitizedFilenameForAssetUrl({
		src: 'https://gtts-api.miniggiodev.fr/Ici+Japon+Corp.mp4?hi=2',
		downloadDir: '',
		contentDisposition: null,
		contentType: null,
	});
	expect(asset1).toEqual(sameAgain);
	expect(asset1).not.toEqual(differentAsset);
});

test('Should give different file names based on different url query parameters', () => {
	const asset1 = getSanitizedFilenameForAssetUrl({
		src: 'https://gtts-api.miniggiodev.fr/Ici+Japon+Corp.mp4?hi=1',
		downloadDir: 'dl',
		contentDisposition:
			'attachment; filename=notjacksondatiras_1656689770_musicaldown.com.mp4; otherstuff',
		contentType: null,
	});
	expect(asset1).toEqual(`dl${path.sep}9482773013878614.mp4`);
	const asset2 = getSanitizedFilenameForAssetUrl({
		src: 'https://gtts-api.miniggiodev.fr/Ici+Japon+Corp.mp4?hi=1',
		downloadDir: 'dl',
		contentDisposition:
			'attachment; filename=notjacksondatiras_1656689770_musicaldown.com.mp4',
		contentType: null,
	});
	expect(asset2).toEqual(`dl${path.sep}9482773013878614.mp4`);
});

test('Should attach correct file extensions ', () => {
	const asset = getSanitizedFilenameForAssetUrl({
		src: 'https://gtts-api.miniggiodev.fr/aha',
		downloadDir: 'dl',
		contentDisposition: null,
		contentType: 'video/mp4',
	});
	expect(asset).toEqual(`dl${path.sep}47313183709047735.mp4`);
});

test('Different URL, same content disposition ', () => {
	const asset1 = getSanitizedFilenameForAssetUrl({
		src: 'https://gtts-api.miniggiodev.fr/123/aha',
		downloadDir: 'dl',
		contentDisposition: 'attachment; filename=hi-123.mp4',
		contentType: 'video/mp4',
	});
	const asset2 = getSanitizedFilenameForAssetUrl({
		src: 'https://gtts-api.miniggiodev.fr/456/aha',
		downloadDir: 'dl',
		contentDisposition: 'attachment; filename=hi-123.mp4',
		contentType: 'video/mp4',
	});
	expect(asset1).toBe(`dl${path.sep}6382670500315726.mp4`);
	expect(asset2).toBe(`dl${path.sep}49303837097249925.mp4`);
});
