import {downloadAndMapAssetsToFileUrl} from '../assets/download-and-map-assets-to-file';

test('Should sanitize weird file names when downloading', async () => {
	const newAsset = await downloadAndMapAssetsToFileUrl({
		localhostAsset: {
			src:
				'http://localhost:3000/gtts-api.miniggiodev.fr/Ici+Japon+Corp.?lang=ja',
			frame: 0,
			id: 'japon',
			isRemote: false,
			mediaFrame: 1,
			type: 'video',
			volume: 1,
			playbackRate: 1,
		},
		webpackBundle: '/var/tmp',
		onDownload: () => undefined,
	});
	expect(newAsset.src).toBe(
		process.platform === 'win32'
			? '\\var\\tmp\\06788239371962845'
			: '/var/tmp/06788239371962845'
	);
});

test('Should give different file names based on different url query parameters', async () => {
	const asset1 = await downloadAndMapAssetsToFileUrl({
		localhostAsset: {
			src: 'https://gtts-api.miniggiodev.fr/Ici+Japon+Corp.mp4?hi=1',
			frame: 0,
			id: 'japon',
			isRemote: false,
			mediaFrame: 1,
			type: 'video',
			volume: 1,
			playbackRate: 1,
		},
		webpackBundle: '/var/tmp',
		onDownload: () => undefined,
	});
	const sameAgain = await downloadAndMapAssetsToFileUrl({
		localhostAsset: {
			src: 'https://gtts-api.miniggiodev.fr/Ici+Japon+Corp.mp4?hi=1',
			frame: 0,
			id: 'japon',
			isRemote: false,
			mediaFrame: 1,
			type: 'video',
			volume: 1,
			playbackRate: 1,
		},
		webpackBundle: '/var/tmp',
		onDownload: () => undefined,
	});
	const differentAsset = await downloadAndMapAssetsToFileUrl({
		localhostAsset: {
			src: 'https://gtts-api.miniggiodev.fr/Ici+Japon+Corp.mp4?hi=2',
			frame: 0,
			id: 'japon',
			isRemote: false,
			mediaFrame: 1,
			type: 'video',
			volume: 1,
			playbackRate: 1,
		},
		webpackBundle: '/var/tmp',
		onDownload: () => undefined,
	});
	expect(asset1.src).toEqual(sameAgain.src);
	expect(asset1.src).not.toEqual(differentAsset.src);
});
