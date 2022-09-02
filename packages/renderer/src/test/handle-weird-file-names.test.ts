import path from 'path';
import {expect, test} from 'vitest';
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
			? '\\var\\tmp\\7415404696948826'
			: '/var/tmp/7415404696948826'
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
	expect(asset1).toEqual(`dl${path.sep}2276125883217901.mp4`);
	const asset2 = getSanitizedFilenameForAssetUrl({
		src: 'https://gtts-api.miniggiodev.fr/Ici+Japon+Corp.mp4?hi=1',
		downloadDir: 'dl',
		contentDisposition:
			'attachment; filename=notjacksondatiras_1656689770_musicaldown.com.mp4',
		contentType: null,
	});
	expect(asset2).toEqual(`dl${path.sep}2276125883217901.mp4`);
});

test('Should attach correct file extensions ', () => {
	const asset = getSanitizedFilenameForAssetUrl({
		src: 'https://gtts-api.miniggiodev.fr/aha',
		downloadDir: 'dl',
		contentDisposition: null,
		contentType: 'video/mp4',
	});
	expect(asset).toEqual(`dl${path.sep}2627764018252492.mp4`);
});
